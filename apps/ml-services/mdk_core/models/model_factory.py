import importlib

from mdk_core.utils.common import print_colored, snake_to_camel
from mdk_core.utils.model_commons import set_seed


class ModelFactory:
    """Factory class to dynamically create and manage machine learning models."""

    def __init__(self, seed=42):
        """Initialize the factory with a default random seed for reproducibility."""
        set_seed(seed)
        self.models_dir = "mdk_core.models"

    def create_model(self, model_name: str, config: dict = None):
        """Dynamically import and create a model class based on the model_name."""
        print_colored(f"Initializing model: {model_name}", "gray")
        try:
            # Dynamically construct the module path based on model_name
            module_name = f"{self.models_dir}.{model_name}.model"

            # Import the model module dynamically (from model.py)
            model_module = importlib.import_module(module_name)

            # Convert the model_name from snake_case to CamelCase
            model_class_name = snake_to_camel(model_name) + "Model"
            print_colored(f"Model class name: {model_class_name}", "gray")

            # Get the model class from the imported module
            model_class = getattr(model_module, model_class_name)

            # Create config instance if provided
            if config and model_name == "lstm":
                from mdk_core.models.lstm.configs import LstmConfig
                lstm_config = LstmConfig()
                # Override default values with user config
                if "time_steps" in config:
                    lstm_config.time_steps = int(config["time_steps"])
                if "learning_rate" in config:
                    lstm_config.learning_rate = float(config["learning_rate"])
                if "batch_size" in config:
                    lstm_config.batch_size = int(config["batch_size"])
                if "epochs" in config:
                    lstm_config.epochs = int(config["epochs"])
                print_colored(f"🔧 Using custom config: time_steps={lstm_config.time_steps}", "info")
                return model_class(config=lstm_config)
            
            # Return an instance of the model class with default config
            return model_class()
        except ModuleNotFoundError as e:
            raise ValueError(
                f"Model '{model_name}' not found in {self.models_dir}. Error: {str(e)}"
            ) from e
        except AttributeError as e:
            model_class_name = snake_to_camel(model_name) + "Model"
            raise ValueError(
                f"Model class '{model_class_name}' not found in {model_name}.model. Error: {str(e)}"
            ) from e
        # pylint: disable=broad-except
        except Exception as e:
            raise ValueError(f"Model {model_name} could not be created. Error: {str(e)}") from e









