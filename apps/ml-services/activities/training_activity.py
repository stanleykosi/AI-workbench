"""
@description
This module defines the Temporal activity for training a machine learning model.
The activity now runs locally within the Temporal worker container on Modal.

Key components:
- `TrainModelActivityParams` & `TrainModelActivityResult`: Dataclasses for type-safe
  data exchange between the workflow and the activity.
- `train_model_activity`: The Temporal activity that executes the training logic
  directly within the worker container.
"""

import dataclasses
import os
from pathlib import Path
import tempfile

import boto3
import pandas as pd
from temporalio import activity

# Import the refactored MDK training function
from mdk_core.trainer import run_training

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

    This function now runs directly within the Temporal worker container on Modal.
    All ML logic executes locally, making it simpler and more reliable.

    Args:
        params: The input parameters for the training job.

    Returns:
        The result of the training job, including S3 keys for the generated artifacts.
    """
    activity.heartbeat()
    print(f"🚀 Starting training for experiment: {params.experiment_id}")

    # Initialize S3 client using credentials from environment
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
        print(f"📥 Downloading dataset {params.dataset_s3_key} from bucket {datasets_bucket}")
        s3_client.download_file(
            datasets_bucket, params.dataset_s3_key, str(local_dataset_path)
        )

        # Load dataset into pandas
        data = pd.read_csv(local_dataset_path)
        print(f"📊 Loaded dataset with {len(data)} rows")

        # 2. Run MDK training
        print(f"🤖 Running training for model: {model_name}")
        training_results = run_training(
            model_name=model_name, data=data, output_dir=str(artifacts_output_dir)
        )

        # 3. Upload artifacts to S3
        model_artifact_path = training_results["model_artifact_path"]
        scaler_artifact_path = training_results["scaler_artifact_path"]

        # Construct a structured S3 key for the model artifact
        model_ext = Path(model_artifact_path).suffix
        model_artifact_s3_key = f"{params.user_id}/{params.project_id}/{params.experiment_id}/model{model_ext}"

        print(f"📤 Uploading model artifact to s3://{models_bucket}/{model_artifact_s3_key}")
        s3_client.upload_file(model_artifact_path, models_bucket, model_artifact_s3_key)

        scaler_artifact_s3_key = None
        if scaler_artifact_path:
            scaler_artifact_s3_key = f"{params.user_id}/{params.project_id}/{params.experiment_id}/scaler.pkl"
            print(f"📤 Uploading scaler artifact to s3://{models_bucket}/{scaler_artifact_s3_key}")
            s3_client.upload_file(
                scaler_artifact_path, models_bucket, scaler_artifact_s3_key
            )

        print("✅ Training and artifact upload complete!")

        return TrainModelActivityResult(
            model_artifact_s3_key=model_artifact_s3_key,
            scaler_artifact_s3_key=scaler_artifact_s3_key,
        )
