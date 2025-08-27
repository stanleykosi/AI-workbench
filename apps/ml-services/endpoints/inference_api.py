"""
@description
This module defines the Modal-deployed FastAPI application for serving model inference.
It provides a scalable, serverless endpoint that can load any trained model from S3
on demand and return the next price prediction.

Key components:
- `load_model`: A FastAPI dependency that handles the entire model loading pipeline:
  1. Checks an in-memory cache for the requested model.
  2. If not cached, queries the database for the experiment's metadata.
  3. Downloads the model and scaler artifacts from AWS S3.
  4. Uses the MDK `ModelFactory` to instantiate and load the model.
  5. Caches the loaded model for subsequent requests.
- `predict`: The main FastAPI endpoint at `/predict/{experiment_id}` that automatically
  returns the next price prediction without requiring input data.
- `inference_endpoint`: The Modal function decorated with `@modal.asgi_app()` that
  deploys and serves the FastAPI application.

This architecture creates a single, dynamic inference service capable of serving
any model trained within the AI Workbench, identified by its unique experiment ID.
"""
import os
import sys
import tempfile
from pathlib import Path
from typing import Dict, List, Any, TYPE_CHECKING
from datetime import datetime

import modal
import psycopg2
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, Field

# Resolve absolute paths early and set sys.path before local imports
BASE_DIR = Path(__file__).resolve().parent.parent  # apps/ml-services
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))  # allow imports locally during deploy
if "/app" not in sys.path:
    sys.path.insert(0, "/app")  # allow imports inside container

# Avoid importing heavy MDK modules at import time to pass Modal's client-side import
if TYPE_CHECKING:
    # Only imported for type checking; not executed at runtime
    from mdk_core.models.base_model import Model as MdkModel  # pragma: no cover
else:
    MdkModel = Any  # type: ignore

# Import configuration and activity tracking
from config import modal_config
from activity_tracker import activity_tracker

# --- Modal Configuration ---
# Define the Modal app, which serves as a container for our functions and configurations.
app = modal.App("ai-workbench-inference-endpoint")

# Define the Docker image for the execution environment and bundle our ml-services code
image = (
    modal.Image.from_registry("python:3.12-slim")
    .pip_install_from_requirements(str(BASE_DIR / "requirements.txt"))
    .add_local_dir(
        str(BASE_DIR),
        remote_path="/app",
        ignore=[
            "venv",
            ".venv",
            "__pycache__",
            "*.pyc",
            "*.pyo",
            "*.pyd",
            ".mypy_cache",
            ".pytest_cache",
            ".pytype",
            ".git",
            "node_modules",
            "data",
            "datasets",
            "artifacts",
            "checkpoints",
            "models",
            "mlruns",
            "wandb",
            "notebooks",
            "*.ipynb",
            "build",
            "dist",
            "*.log",
            "temporal_server.py",
            "test_*.py",
        ],
    )
)

# Define Modal secrets, which securely inject environment variables into the container.
# These must be created by the user in their Modal account.
aws_secret = modal.Secret.from_name("ai-workbench-aws-secret")
supabase_secret = modal.Secret.from_name("ai-workbench-supabase-secret")

# --- Model Loading and Caching ---
# A simple in-memory cache to store loaded models within a warm container.
# This avoids the latency of downloading and loading the model from S3 on every request.
model_cache: Dict[str, Any] = {}


def get_db_connection():
    """Creates a database connection using environment variables."""
    return psycopg2.connect(os.environ["SUPABASE_DATABASE_URL"])


def load_model(experiment_id: str):
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
    
    # Parse model_config if it's a JSON string
    if isinstance(model_config, str):
        import json
        try:
            model_config = json.loads(model_config)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail=f"Invalid model config format for experiment '{experiment_id}'.",
            )
    
    model_name = model_config.get("modelName")

    if not model_artifact_s3_key or not model_name:
        raise HTTPException(
            status_code=404,
            detail=f"Model artifact or name not found for experiment '{experiment_id}'.",
        )

    # 3. Download model artifact(s) from S3 into a temporary directory.
    # Defer heavy imports to runtime inside the container
    import boto3
    from mdk_core.models.model_factory import ModelFactory
    
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
        # For LSTM models, the scaler should be in the same directory as the model
        print(f"🔍 Model artifact S3 key: {model_artifact_s3_key}")
        print(f"🔍 Model filename: {model_filename}")
        
        # Try different approaches to find the scaler
        possible_scaler_keys = [
            model_artifact_s3_key.replace(model_filename, "scaler.pkl"),
            model_artifact_s3_key.replace(f"/{model_filename}", "/scaler.pkl"),
            model_artifact_s3_key.rsplit("/", 1)[0] + "/scaler.pkl"
        ]
        
        scaler_downloaded = False
        for scaler_key in possible_scaler_keys:
            print(f"🔍 Trying scaler key: {scaler_key}")
            try:
                s3_client.head_object(Bucket=models_bucket, Key=scaler_key)
                local_scaler_path = local_model_dir / "scaler.pkl"
                print(f"✅ Found scaler at: {scaler_key}")
                print(f"Downloading scaler artifact to {local_scaler_path}")
                s3_client.download_file(
                    models_bucket, scaler_key, str(local_scaler_path)
                )
                print(f"✅ Scaler downloaded successfully to {local_scaler_path}")
                scaler_downloaded = True
                break
            except s3_client.exceptions.ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    print(f"❌ Scaler not found at: {scaler_key}")
                    continue
                else:
                    raise  # Re-raise other S3 errors.
        
        if not scaler_downloaded:
            print("⚠️ No scaler found for this model, which is expected for some models.")
            print("🔄 Will attempt to recreate scaler from training data if needed.")

        # 4. Instantiate and load the model using the MDK factory.
        try:
            factory = ModelFactory()
            model_instance = factory.create_model(model_name)

            # The model's `load` method needs the parent directory of the artifacts.
            model_instance.save_dir = temp_dir
            print(f"🔧 Model save_dir set to: {temp_dir}")
            print(f"🔧 Model type: {type(model_instance).__name__}")
            
            # Check if the model has a custom load method
            if hasattr(model_instance, 'load'):
                print(f"🔧 Calling custom load method for {type(model_instance).__name__}")
                model_instance.load()
            else:
                print(f"⚠️ No custom load method found, using base class load")
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


@fastapi_app.get("/health")
async def health_check():
    """
    Health check endpoint that provides scaling and activity information.
    """
    return {
        "status": "healthy",
        "authentication": {
            "mode": "production" if modal_config.is_production else "development",
            "modal_authenticated": modal_config.is_production,
            "token_id_set": bool(modal_config.token_id),
            "token_secret_set": bool(modal_config.token_secret),
        },
        "scaling": {
            "current_scaledown_window": modal_config.get_scaledown_window(activity_tracker.has_recent_activity()),
            "base_warm_time": modal_config.base_warm_time,
            "extension_time": modal_config.extension_time,
            "max_containers": modal_config.max_containers,
        },
        "activity": activity_tracker.get_stats(),
        "cached_models": list(model_cache.keys()),
    }


@fastapi_app.get("/predict/{experiment_id}")
async def predict(
    experiment_id: str,
    model = Depends(load_model),
):
    """
    Returns the next price prediction for the trained model.
    For time series models, this predicts the next value in the sequence.
    No input data required - the model uses its training to predict the next value.
    """
    try:
        # Track activity for this experiment to optimize scaling
        activity_tracker.record_activity(experiment_id)
        
        # For time series models, we can use the model's forecast method
        # This typically uses the last known data points to predict the next value
        if hasattr(model, 'forecast'):
            # Use the model's built-in forecast method if available
            try:
                # Check if the model requires last_known_data parameter
                import inspect
                forecast_params = inspect.signature(model.forecast).parameters
                
                if 'last_known_data' in forecast_params:
                    # LSTM models need historical data for forecasting
                    print(f"📊 Using forecast method with last_known_data for {model.__class__.__name__}")
                    
                    # Get the training dataset to use as last_known_data
                    conn = get_db_connection()
                    try:
                        with conn.cursor() as cur:
                            cur.execute(
                                """
                                SELECT dataset_id FROM experiments WHERE id = %s
                                """,
                                (experiment_id,),
                            )
                            dataset_result = cur.fetchone()
                    finally:
                        if conn:
                            conn.close()
                    
                    if not dataset_result or not dataset_result[0]:
                        raise HTTPException(
                            status_code=500,
                            detail="No training dataset found for this experiment."
                        )
                    
                    dataset_id = dataset_result[0]
                    
                    # Fetch dataset metadata
                    conn = get_db_connection()
                    try:
                        with conn.cursor() as cur:
                            cur.execute(
                                """
                                SELECT s3_key FROM datasets WHERE id = %s
                                """,
                                (dataset_id,),
                            )
                            dataset_result = cur.fetchone()
                    finally:
                        if conn:
                            conn.close()
                    
                    if not dataset_result:
                        raise HTTPException(
                            status_code=500,
                            detail="Training dataset not found."
                        )
                    
                    dataset_s3_key = dataset_result[0]
                    
                    # Download and load the training dataset
                    import boto3
                    import pandas as pd
                    
                    s3_client = boto3.client("s3")
                    datasets_bucket = os.environ["S3_DATASETS_BUCKET"]
                    
                    with tempfile.TemporaryDirectory() as temp_dir:
                        local_dataset_path = Path(temp_dir) / "training_data.csv"
                        s3_client.download_file(
                            datasets_bucket, dataset_s3_key, str(local_dataset_path)
                        )
                        
                        # Load the training dataset
                        training_data = pd.read_csv(local_dataset_path)
                        
                        # Ensure required columns exist
                        required_cols = ["open", "high", "low", "close", "volume"]
                        if not all(col in training_data.columns for col in required_cols):
                            raise HTTPException(
                                status_code=500,
                                detail="Training dataset missing required OHLCV columns."
                            )
                        
                        # Use the last few rows of training data for prediction
                        # LSTM models need at least 60 data points for time_steps
                        min_data_points = 60  # Minimum for LSTM time_steps
                        if len(training_data) < min_data_points:
                            raise HTTPException(
                                status_code=500,
                                detail=f"Training dataset too small. Need at least {min_data_points} data points, got {len(training_data)}."
                            )
                        
                        # Use the last 60+ data points for LSTM prediction
                        recent_data = training_data.tail(max(min_data_points, 100))  # At least 60, up to 100
                        print(f"📊 Using {len(recent_data)} data points for LSTM prediction")
                        
                        # Run forecast with the recent data
                        forecast_df = model.forecast(steps=1, last_known_data=recent_data)
                        
                        if "Forecasted Close" in forecast_df.columns:
                            next_prediction = forecast_df["Forecasted Close"].iloc[0]
                        else:
                            next_prediction = forecast_df.iloc[0, 1]  # Assume second column is prediction
                else:
                    # Models with simple forecast method (no last_known_data required)
                    forecast_df = model.forecast(steps=1)
                    if "prediction" in forecast_df.columns:
                        next_prediction = forecast_df["prediction"].iloc[0]
                    elif "Forecasted Close" in forecast_df.columns:
                        next_prediction = forecast_df["Forecasted Close"].iloc[0]
                    else:
                        # Safely handle different DataFrame sizes
                        if len(forecast_df.columns) > 1:
                            next_prediction = forecast_df.iloc[0, 1]  # Second column if available
                        else:
                            next_prediction = forecast_df.iloc[0, 0]  # Only column if only one exists
            except Exception as forecast_error:
                print(f"⚠️ Forecast method failed: {forecast_error}, falling back to inference method")
                # Fall through to the inference method below
                next_prediction = None
        else:
            next_prediction = None
        
        # If forecast didn't work or model doesn't have forecast method, use inference
        if next_prediction is None:
            # Fallback: fetch the training dataset and use recent data for prediction
            print(f"Model {model.__class__.__name__} doesn't have forecast method, using training data fallback")
            
            # Get the dataset ID from the experiment
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT dataset_id FROM experiments WHERE id = %s
                        """,
                        (experiment_id,),
                    )
                    dataset_result = cur.fetchone()
            finally:
                if conn:
                    conn.close()
            
            if not dataset_result or not dataset_result[0]:
                raise HTTPException(
                    status_code=500,
                    detail="No training dataset found for this experiment."
                )
            
            dataset_id = dataset_result[0]
            
            # Fetch dataset metadata
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT s3_key FROM datasets WHERE id = %s
                        """,
                        (dataset_id,),
                    )
                    dataset_result = cur.fetchone()
            finally:
                if conn:
                    conn.close()
            
            if not dataset_result:
                raise HTTPException(
                    status_code=500,
                    detail="Training dataset not found."
                )
            
            dataset_s3_key = dataset_result[0]
            
            # Download and load the training dataset
            import boto3
            import pandas as pd
            
            s3_client = boto3.client("s3")
            datasets_bucket = os.environ["S3_DATASETS_BUCKET"]
            
            with tempfile.TemporaryDirectory() as temp_dir:
                local_dataset_path = Path(temp_dir) / "training_data.csv"
                s3_client.download_file(
                    datasets_bucket, dataset_s3_key, str(local_dataset_path)
                )
                
                # Load the training dataset
                training_data = pd.read_csv(local_dataset_path)
                
                # Ensure required columns exist
                required_cols = ["open", "high", "low", "close", "volume"]
                if not all(col in training_data.columns for col in required_cols):
                    raise HTTPException(
                        status_code=500,
                        detail="Training dataset missing required OHLCV columns."
                    )
                
                # Use the last few rows of training data for prediction
                # This gives the model the historical context it needs
                recent_data = training_data.tail(10)  # Last 10 data points
                
                # Run inference on the recent training data
                predictions_df = model.inference(recent_data)
                
                # Get the last prediction
                if "prediction" in predictions_df.columns:
                    next_prediction = predictions_df["prediction"].iloc[-1]
                elif len(predictions_df.columns) > 1:
                    # Look for prediction-like columns
                    prediction_cols = [col for col in predictions_df.columns if 'pred' in col.lower() or 'forecast' in col.lower()]
                    if prediction_cols:
                        next_prediction = predictions_df[prediction_cols[0]].iloc[-1]
                    else:
                        # Use the last column as fallback
                        next_prediction = predictions_df.iloc[-1, -1]
                else:
                    # Single column DataFrame
                    next_prediction = predictions_df.iloc[-1, 0]
        
        return {
            "experiment_id": experiment_id,
            "next_prediction": float(next_prediction),
            "prediction_time": datetime.now().isoformat(),
            "model_type": model.__class__.__name__
        }
        
    except Exception as e:
        print(f"Next prediction error for experiment {experiment_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate next prediction: {e}"
        )


# --- Modal Deployment ---
@app.function(
    image=image,
    secrets=[
        aws_secret,
        supabase_secret,
        modal.Secret.from_name("ai-workbench-modal-secret"),
    ],
    scaledown_window=modal_config.get_scaledown_window(activity_tracker.has_recent_activity()),
    max_containers=modal_config.max_containers,
)
@modal.asgi_app()
def inference_endpoint():
    """Exposes the FastAPI application as a serverless Modal web endpoint."""
    return fastapi_app
