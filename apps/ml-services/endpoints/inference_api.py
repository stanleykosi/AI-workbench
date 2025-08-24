"""
@description
This module defines the Modal-deployed FastAPI application for serving model inference.
It provides a scalable, serverless endpoint that can load any trained model from S3
on demand, perform predictions, and return results.

Key components:
- `InferenceRequest` & `InferenceDataPoint`: Pydantic models for validating the
  structure of incoming inference requests.
- `load_model`: A FastAPI dependency that handles the entire model loading pipeline:
  1. Checks an in-memory cache for the requested model.
  2. If not cached, queries the database for the experiment's metadata.
  3. Downloads the model and scaler artifacts from AWS S3.
  4. Uses the MDK `ModelFactory` to instantiate and load the model.
  5. Caches the loaded model for subsequent requests.
- `predict`: The main FastAPI endpoint at `/predict/{experiment_id}` that uses the
  `load_model` dependency to perform inference.
- `inference_endpoint`: The Modal function decorated with `@modal.asgi_app()` that
  deploys and serves the FastAPI application.

This architecture creates a single, dynamic inference service capable of serving
any model trained within the AI Workbench, identified by its unique experiment ID.
"""
import os
import tempfile
from pathlib import Path
from typing import Dict, List

import boto3
import modal
import pandas as pd
import psycopg2
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field

# Import the MDK's model factory and base model class for type hinting
from mdk_core.models.base_model import Model as MdkModel
from mdk_core.models.model_factory import ModelFactory

# Import configuration and activity tracking
from config import modal_config
from activity_tracker import activity_tracker

# --- Modal Configuration ---
# Define the Modal app, which serves as a container for our functions and configurations.
app = modal.App("ai-workbench-inference-endpoint")

# Define the Docker image for the execution environment. This ensures all dependencies
# from the MDK are available when the inference code runs.
image = modal.Image.from_registry("python:3.12-slim").pip_install_from_requirements(
    "requirements.txt"
)

# Define Modal secrets, which securely inject environment variables into the container.
# These must be created by the user in their Modal account.
aws_secret = modal.Secret.from_name("ai-workbench-aws-secret")
supabase_secret = modal.Secret.from_name("ai-workbench-supabase-secret")

# --- Model Loading and Caching ---
# A simple in-memory cache to store loaded models within a warm container.
# This avoids the latency of downloading and loading the model from S3 on every request.
model_cache: Dict[str, MdkModel] = {}


def get_db_connection():
    """
    Establishes and returns a connection to the Supabase PostgreSQL database.
    Handles connection errors gracefully.
    """
    try:
        conn = psycopg2.connect(os.environ["SUPABASE_DATABASE_URL"])
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        # Return a 503 Service Unavailable error if the database can't be reached.
        raise HTTPException(status_code=503, detail="Database connection failed.")


def load_model(experiment_id: str) -> MdkModel:
    """
    FastAPI dependency to load a model based on its experiment ID.

    This function is the core of the dynamic model serving logic. It fetches
    model metadata from the database, downloads the artifact from S3, loads it
    into memory using the MDK factory, and caches it for future use.

    Args:
        experiment_id: The UUID of the experiment whose model should be loaded.

    Returns:
        An instance of a loaded MDK model, ready for inference.
    """
    # 1. Check cache first to avoid redundant work.
    if experiment_id in model_cache:
        print(f"Model for experiment {experiment_id} found in cache.")
        return model_cache[experiment_id]

    print(f"Model for experiment {experiment_id} not in cache. Loading...")

    # 2. Fetch experiment details from the database.
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT model_artifact_s3_key, model_config
                FROM experiments
                WHERE id = %s AND status = 'completed'
                """,
                (experiment_id,),
            )
            result = cur.fetchone()
    finally:
        if conn:
            conn.close()

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Completed experiment '{experiment_id}' not found.",
        )

    model_artifact_s3_key, model_config = result
    model_name = model_config.get("modelName")

    if not model_artifact_s3_key or not model_name:
        raise HTTPException(
            status_code=404,
            detail=f"Model artifact or name not found for experiment '{experiment_id}'.",
        )

    # 3. Download model artifact(s) from S3 into a temporary directory.
    s3_client = boto3.client("s3")
    models_bucket = os.environ["S3_MODELS_BUCKET"]

    with tempfile.TemporaryDirectory() as temp_dir:
        # The MDK's `load` method expects artifacts to be in `save_dir/model_name/`.
        local_model_dir = Path(temp_dir) / model_name
        local_model_dir.mkdir()

        model_filename = Path(model_artifact_s3_key).name
        local_model_path = local_model_dir / model_filename
        print(f"Downloading model artifact to {local_model_path}")
        s3_client.download_file(
            models_bucket, model_artifact_s3_key, str(local_model_path)
        )

        # Check for and download the associated scaler artifact if it exists.
        scaler_artifact_s3_key = model_artifact_s3_key.replace(
            model_filename, "scaler.pkl"
        )
        try:
            s3_client.head_object(Bucket=models_bucket, Key=scaler_artifact_s3_key)
            local_scaler_path = local_model_dir / "scaler.pkl"
            print(f"Downloading scaler artifact to {local_scaler_path}")
            s3_client.download_file(
                models_bucket, scaler_artifact_s3_key, str(local_scaler_path)
            )
        except s3_client.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                print("No scaler found for this model, which is expected for some models.")
            else:
                raise  # Re-raise other S3 errors.

        # 4. Instantiate and load the model using the MDK factory.
        try:
            factory = ModelFactory()
            model_instance = factory.create_model(model_name)

            # The model's `load` method needs the parent directory of the artifacts.
            model_instance.save_dir = temp_dir
            model_instance.load()

            # 5. Cache and return the loaded model.
            model_cache[experiment_id] = model_instance
            print(f"Model for experiment {experiment_id} loaded and cached successfully.")
            return model_instance
        except Exception as e:
            print(f"Critical error during model instantiation or loading: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load model: {e}")


# --- FastAPI Application Definition ---
fastapi_app = FastAPI(title="AI Workbench Inference API")


class InferenceDataPoint(BaseModel):
    """Pydantic model for a single row of input data, used for validation."""

    date: str = Field(..., description="Date in YYYY-MM-DD format.")
    open: float
    high: float
    low: float
    close: float
    volume: float


class InferenceRequest(BaseModel):
    """Pydantic model for the main inference request body."""

    data: List[InferenceDataPoint] = Field(
        ...,
        description="A list of data points, providing historical context for time-series models.",
    )


@fastapi_app.get("/health")
async def health_check():
    """
    Health check endpoint that provides scaling and activity information.
    """
    return {
        "status": "healthy",
        "scaling": {
            "current_scaledown_window": modal_config.get_scaledown_window(activity_tracker.has_recent_activity()),
            "base_warm_time": modal_config.base_warm_time,
            "extension_time": modal_config.extension_time,
            "max_containers": modal_config.max_containers,
        },
        "activity": activity_tracker.get_stats(),
        "cached_models": list(model_cache.keys()),
    }


@fastapi_app.post("/predict/{experiment_id}")
async def predict(
    experiment_id: str,
    request: InferenceRequest,
    model: MdkModel = Depends(load_model),
):
    """
    Performs inference using a trained model specified by the experiment_id.
    """
    if not request.data:
        raise HTTPException(status_code=400, detail="Input data cannot be empty.")

    try:
        # Track activity for this experiment to optimize scaling
        activity_tracker.record_activity(experiment_id)
        
        # Convert the validated Pydantic models to a pandas DataFrame.
        input_df = pd.DataFrame([row.model_dump() for row in request.data])

        # Ensure 'date' column is in the correct datetime format for MDK models.
        input_df["date"] = pd.to_datetime(input_df["date"])

        # Perform inference using the loaded model's specific method.
        predictions_df = model.inference(input_df)

        # Standardize the output format.
        if "prediction" not in predictions_df.columns:
            raise ValueError("Model output from MDK did not contain 'prediction' column.")

        # Handle potential NaNs in results (e.g., from lag features) and return clean list.
        predictions = predictions_df["prediction"].dropna().tolist()

        return {"predictions": predictions}
    except Exception as e:
        print(f"Inference error for experiment {experiment_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"An error occurred during inference: {e}"
        )


# --- Modal Deployment ---
@app.function(
    image=image,
    secrets=[aws_secret, supabase_secret],
    scaledown_window=modal_config.get_scaledown_window(activity_tracker.has_recent_activity()),
    max_containers=modal_config.max_containers,
)
@modal.asgi_app()
def inference_endpoint():
    """Exposes the FastAPI application as a serverless Modal web endpoint."""
    return fastapi_app
