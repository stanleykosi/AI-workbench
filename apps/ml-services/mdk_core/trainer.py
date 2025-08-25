"""
@description
This module provides the core, non-interactive training functionality for the MDK.
It encapsulates the model training pipeline into a single function that can be called
programmatically, for example, by a Temporal activity.

Key features:
- `run_training`: A function that orchestrates data preprocessing, model instantiation,
  training, and artifact saving.
- Decoupled Logic: Separates the training process from CLI inputs, making it suitable for a backend service.
- Artifact Management: Returns the paths of the generated model and scaler artifacts.
"""

import os
import pandas as pd
from mdk_core.models.model_factory import ModelFactory
from mdk_core.data.utils.data_preprocessing import preprocess_data
from mdk_core.utils.common import print_colored

def run_training(model_name: str, data: pd.DataFrame, output_dir: str) -> dict:
    """
    Runs the training process for a specified model.

    This function preprocesses the input data, creates a model instance using a factory,
    trains the model, saves the artifacts (model file and optional scaler), and returns
    the paths to these artifacts.

    Args:
        model_name: The name of the model to train (e.g., 'arima', 'lstm').
        data: A pandas DataFrame containing the training data.
        output_dir: The directory where trained models and artifacts will be saved.

    Returns:
        A dictionary containing the path to the saved model artifact and scaler artifact (if any).
        Example: {'model_artifact_path': '/path/to/model.pkl', 'scaler_artifact_path': '/path/to/scaler.pkl'}

    Raises:
        ValueError: If data preprocessing fails.
        Exception: If model training fails.
        FileNotFoundError: If the model artifact is not found after training.
    """
    print_colored(f"Starting training process for model: {model_name}", "info")
    os.makedirs(output_dir, exist_ok=True)

    # 1. Preprocess the data
    try:
        processed_data = preprocess_data(data)
        print_colored("Data preprocessing completed successfully.", "success")
    except ValueError as e:
        print_colored(f"Data preprocessing failed: {e}", "error")
        raise

    # 2. Initialize ModelFactory
    factory = ModelFactory()

    # 3. Create and train the model
    try:
        print_colored(f"Creating model: {model_name}", "info")
        model = factory.create_model(model_name)
        
        # Set the save directory for the model instance
        model.save_dir = output_dir
        
        print_colored(f"Training {model_name} model...", "info")
        model.train(processed_data)
        print_colored(f"Model training for {model_name} complete.", "success")
        
    except Exception as e:
        print_colored(f"An error occurred during model training: {e}", "error")
        raise

    # 4. Determine artifact paths and return
    model_dir = os.path.join(output_dir, model_name)
    model_artifact_path = None
    scaler_artifact_path = None

    if model.model_type == "pytorch":
        model_artifact_path = os.path.join(model_dir, "model.pt")
    elif model.model_type == "pkl":
        model_artifact_path = os.path.join(model_dir, "model.pkl")

    scaler_file = os.path.join(model_dir, "scaler.pkl")
    if os.path.exists(scaler_file):
        scaler_artifact_path = scaler_file

    if not model_artifact_path or not os.path.exists(model_artifact_path):
        raise FileNotFoundError(f"Model artifact not found at {model_artifact_path} after training.")

    return {
        "model_artifact_path": model_artifact_path,
        "scaler_artifact_path": scaler_artifact_path,
    }







