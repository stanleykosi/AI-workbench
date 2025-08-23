"""
@description
This module defines the Temporal activity and Modal function for training a machine learning model.
It bridges the gap between the Temporal orchestrator and the Modal execution environment.

Key components:
- `TrainModelActivityParams` & `TrainModelActivityResult`: Dataclasses for type-safe
  data exchange between the workflow and the activity.
- `train_model_activity`: The Temporal activity that is called by a workflow. It acts as a
  lightweight wrapper that triggers the execution of the actual training logic on Modal.
- `_train_model`: The Modal function containing the core training logic. It downloads data
  from S3, runs the MDK trainer, and uploads the resulting artifacts back to S3.

This separation of concerns allows the Temporal worker to remain lightweight, while the
computationally intensive training task is offloaded to Modal's ephemeral, scalable infrastructure.
"""
import dataclasses
import os
from pathlib import Path
import tempfile

import boto3
import modal
import pandas as pd
from temporalio import activity

# Import the refactored MDK training function
from mdk_core.trainer import run_training

# --- Modal Configuration ---

# Define the Modal app. This is the entry point for defining Modal apps and functions.
# The name helps organize functions in the Modal dashboard.
app = modal.App("ai-workbench-training-activity")

# Define the Docker image for the Modal environment. This ensures that all necessary
# dependencies are available when the activity runs. We install directly from the
# requirements.txt file to keep the environment consistent with the MDK core.
image = modal.Image.from_registry("python:3.12-slim").pip_install_from_requirements(
    "requirements.txt"
)

# Define Modal secrets. These securely provide environment variables to the Modal function.
# The user must create these secrets in their Modal account using the `modal secret create` command.
aws_secret = modal.Secret.from_name("ai-workbench-aws-secret")
# Supabase secret is included for future use by workflows/activities that need to write back to the DB.
supabase_secret = modal.Secret.from_name("ai-workbench-supabase-secret")

# --- Dataclass Definitions for Type Safety ---


@dataclasses.dataclass
class TrainModelActivityParams:
    """Input parameters for the train_model_activity."""

    experiment_id: str
    project_id: str
    user_id: str
    dataset_s3_key: str
    model_config: dict  # Will contain model_name and other hyperparams


@dataclasses.dataclass
class TrainModelActivityResult:
    """Result of the train_model_activity."""

    model_artifact_s3_key: str
    scaler_artifact_s3_key: str | None


# --- Temporal Activity Definition ---


@activity.defn
async def train_model_activity(
    params: TrainModelActivityParams,
) -> TrainModelActivityResult:
    """
    Temporal Activity to train an ML model using the MDK core library.

    This function is executed by a Temporal worker. It offloads the actual computation
    to a Modal function by calling `.remote()`. This keeps the Temporal worker lightweight.

    Args:
        params: The input parameters for the training job.

    Returns:
        The result of the training job, including S3 keys for the generated artifacts.
    """
    activity.heartbeat()

    # The .remote() call executes the function in a Modal container. This is an async call.
    result = await _train_model.remote.aio(params)
    return result


# --- Modal Function (The actual implementation) ---


@app.function(
    image=image,
    secrets=[aws_secret, supabase_secret],
    timeout=7200,  # 2-hour timeout for training job
    cpu=4,  # Request 4 CPUs for the container
    memory=8192,  # Request 8GB of memory
)
def _train_model(params: TrainModelActivityParams) -> TrainModelActivityResult:
    """
    The core logic for model training, executed within a Modal container.
    """
    print(f"Starting training for experiment: {params.experiment_id}")

    # Initialize S3 client using credentials from the Modal secret
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name=os.environ["AWS_REGION"],
    )

    datasets_bucket = os.environ["S3_DATASETS_BUCKET"]
    models_bucket = os.environ["S3_MODELS_BUCKET"]

    model_name = params.model_config.get("modelName", "default_model")

    # Use a temporary directory to handle local file operations within the container
    with tempfile.TemporaryDirectory() as temp_dir:
        local_dataset_path = Path(temp_dir) / "dataset.csv"
        artifacts_output_dir = Path(temp_dir) / "artifacts"
        artifacts_output_dir.mkdir()

        # 1. Download dataset from S3
        print(f"Downloading dataset {params.dataset_s3_key} from bucket {datasets_bucket}")
        s3_client.download_file(
            datasets_bucket, params.dataset_s3_key, str(local_dataset_path)
        )

        # Load dataset into pandas
        data = pd.read_csv(local_dataset_path)

        # 2. Run MDK training
        print(f"Running training for model: {model_name}")
        training_results = run_training(
            model_name=model_name, data=data, output_dir=str(artifacts_output_dir)
        )

        # 3. Upload artifacts to S3
        model_artifact_path = training_results["model_artifact_path"]
        scaler_artifact_path = training_results["scaler_artifact_path"]

        # Construct a structured S3 key for the model artifact
        model_ext = Path(model_artifact_path).suffix
        model_artifact_s3_key = f"{params.user_id}/{params.project_id}/{params.experiment_id}/model{model_ext}"

        print(f"Uploading model artifact to s3://{models_bucket}/{model_artifact_s3_key}")
        s3_client.upload_file(model_artifact_path, models_bucket, model_artifact_s3_key)

        scaler_artifact_s3_key = None
        if scaler_artifact_path:
            scaler_artifact_s3_key = f"{params.user_id}/{params.project_id}/{params.experiment_id}/scaler.pkl"
            print(f"Uploading scaler artifact to s3://{models_bucket}/{scaler_artifact_s3_key}")
            s3_client.upload_file(
                scaler_artifact_path, models_bucket, scaler_artifact_s3_key
            )

        print("Training and artifact upload complete.")

        return TrainModelActivityResult(
            model_artifact_s3_key=model_artifact_s3_key,
            scaler_artifact_s3_key=scaler_artifact_s3_key,
        )
