import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import MinMaxScaler
from torch import nn
from torch.optim.adam import Adam
from torch.utils.data import DataLoader, TensorDataset
import os
import joblib

from mdk_core.models.base_model import Model
from mdk_core.models.lstm.configs import LstmConfig


# Define the LSTM architecture
class LSTM(nn.Module):
    """LSTM based model for time series forecasting"""

    # pylint: disable=too-many-arguments
    def __init__(self, input_size, hidden_size, output_size, num_layers, dropout=0.5):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # Define the LSTM layers
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers, batch_first=True, dropout=dropout
        )
        self.fc = nn.Linear(hidden_size, output_size)  # Fully connected layer
        self.batch_norm = nn.BatchNorm1d(hidden_size)  # Batch normalization layer
        self.dropout = nn.Dropout(dropout)  # Dropout layer for regularization

    def forward(self, x, hidden_state=None):
        # Initialize hidden and cell states if not provided
        if hidden_state is None:
            h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            hidden_state = (h0, c0)

        # Forward pass through LSTM
        out, hidden_state = self.lstm(x, hidden_state)

        # Apply batch normalization and dropout on the output
        out = self.batch_norm(out[:, -1, :])  # Normalize across the last time step
        out = self.dropout(out)

        # Fully connected layer to map the hidden state to output
        out = self.fc(out)
        return out, hidden_state


# Define the LSTM model class that integrates with the base model
class LstmModel(Model):
    """LSTM model for time series forecasting"""

    def __init__(self, model_name="lstm", config=LstmConfig(), debug=False):
        super().__init__(model_name=model_name, model_type="pytorch", debug=debug)
        self.config = config  # Use the configuration class
        self.model = LSTM(
            input_size=self.config.input_size,
            hidden_size=self.config.hidden_size,
            output_size=self.config.output_size,
            num_layers=self.config.num_layers,
            dropout=self.config.dropout,
        )
        self.criterion = nn.MSELoss()

        self.optimizer = Adam(
            self.model.parameters(),
            lr=self.config.learning_rate,
        )
        self.scaler = MinMaxScaler(feature_range=(0, 1))

    def load(self):
        """Load the LSTM model and scaler from disk."""
        model_dir = os.path.join(self.save_dir, self.model_name)
        try:
            # Load PyTorch model state dict
            model_path = os.path.join(model_dir, "model.pt")
            if os.path.exists(model_path):
                self.model.load_state_dict(torch.load(model_path))
                print(f"✅ LSTM model loaded from {model_path}")
            else:
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load scaler
            scaler_path = os.path.join(model_dir, "scaler.pkl")
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                print(f"✅ Scaler loaded from {scaler_path}")
            else:
                print("⚠️ No scaler found, model may not work properly")
                
        except Exception as e:
            print(f"❌ Failed to load LSTM model: {e}")
            raise

    def save(self):
        """Save the LSTM model and scaler to disk."""
        model_dir = os.path.join(self.save_dir, self.model_name)
        os.makedirs(model_dir, exist_ok=True)
        
        print(f"🔧 LSTM save() called with save_dir: {self.save_dir}")
        print(f"🔧 Model dir: {model_dir}")
        print(f"🔧 Scaler object: {self.scaler}")
        print(f"🔧 Scaler fitted: {hasattr(self.scaler, 'n_features_in_') if self.scaler else False}")
        
        try:
            # Save PyTorch model state dict
            if self.model is not None:
                model_path = os.path.join(model_dir, "model.pt")
                torch.save(self.model.state_dict(), model_path)
                print(f"✅ LSTM model saved to {model_path}")
                print(f"🔧 Model file exists: {os.path.exists(model_path)}")
            else:
                print("⚠️ No model to save")
            
            # Save scaler
            if self.scaler is not None:
                scaler_path = os.path.join(model_dir, "scaler.pkl")
                joblib.dump(self.scaler, scaler_path)
                print(f"✅ Scaler saved to {scaler_path}")
                print(f"🔧 Scaler file exists: {os.path.exists(scaler_path)}")
                print(f"🔧 Scaler file size: {os.path.getsize(scaler_path) if os.path.exists(scaler_path) else 'N/A'} bytes")
            else:
                print("⚠️ No scaler to save")
                
        except Exception as e:
            print(f"❌ Failed to save LSTM model: {e}")
            raise


    # pylint: disable=too-many-locals,too-many-statements
    def train(self, data: pd.DataFrame):
        # Ensure the 'date' column is a DatetimeIndex for resampling
        if "date" in data.columns:
            data["date"] = pd.to_datetime(data["date"])
            data = data.set_index("date")

        # Select only numeric columns for resampling
        numeric_data = data.select_dtypes(include=[np.number])  # type: ignore

        # Resample the data based on the configured interval
        numeric_data = numeric_data.resample(self.config.interval).mean().dropna()

        # Reattach the non-numeric data (e.g., 'asset' column) after resampling if needed
        if "asset" in data.columns:
            asset_data = data[["asset"]].resample(self.config.interval).first()
            data = numeric_data.join(asset_data)
        else:
            data = numeric_data

        # Normalize the data
        close_prices = data["close"].values.astype(float).reshape(-1, 1)
        scaled_close_prices = self.scaler.fit_transform(close_prices)

        # Prepare data with normalized prices
        x_train, y_train = self._prepare_data(scaled_close_prices)
        
        # Split data into training and validation sets
        val_size = int(len(x_train) * self.config.validation_split)
        x_train, x_val = x_train[:-val_size], x_train[-val_size:]
        y_train, y_val = y_train[:-val_size], y_train[-val_size:]

        # Convert to tensors
        x_train = torch.tensor(x_train, dtype=torch.float32)
        y_train = torch.tensor(y_train, dtype=torch.float32)
        x_val = torch.tensor(x_val, dtype=torch.float32)
        y_val = torch.tensor(y_val, dtype=torch.float32)

        # Create DataLoader for mini-batching
        train_dataset = TensorDataset(x_train, y_train)
        train_loader = DataLoader(
            train_dataset, batch_size=self.config.batch_size, shuffle=True
        )

        best_val_loss = float("inf")
        patience_counter = 0

        self.model.train()
        for epoch in range(self.config.epochs):
            epoch_loss = 0
            for inputs, targets in train_loader:
                outputs, _ = self.model(inputs)  # Get only the output
                loss = self.criterion(outputs, targets)
                self.optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(), max_norm=1.0
                )  # Gradient clipping
                self.optimizer.step()
                epoch_loss += loss.item()

            # Validation
            self.model.eval()
            with torch.no_grad():
                val_outputs, _ = self.model(x_val)  # Get only the output
                val_loss = self.criterion(val_outputs, y_val).item()
            self.model.train()

            if (epoch + 1) % 10 == 0:
                print(
                    f"Epoch [{epoch+1}/{self.config.epochs}], Training Loss: {epoch_loss/len(train_loader):.4f}, Validation Loss: {val_loss:.4f}"
                )

            # Early stopping logic
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                self.save() # Save the best model
            else:
                patience_counter += 1
                if patience_counter >= self.config.early_stopping_patience:
                    print(f"Early stopping triggered at epoch {epoch + 1}")
                    break

    # pylint: disable=too-many-branches,too-many-statements
    def inference(self, input_data: pd.DataFrame, time_steps=None) -> pd.DataFrame:
        self.model.eval()

        # Create a copy to avoid SettingWithCopyWarning
        data_copy = input_data.copy()
        
        if "date" in data_copy.columns:
            data_copy["date"] = pd.to_datetime(data_copy["date"])
            data_copy = data_copy.set_index("date")

        # For inference, preserve the original data frequency instead of aggressive resampling
        # Only resample if the data is very high frequency (e.g., 1min) to avoid memory issues
        if len(data_copy) > 1000:  # If we have too many rows, resample to hourly
            data_copy = data_copy.resample("H").mean().dropna()
            print(f"📊 High frequency data detected, resampling to hourly: {len(data_copy)} rows")
        else:
            # Keep original frequency for inference
            print(f"📊 Keeping original data frequency: {len(data_copy)} rows")
        
        time_steps = self.config.time_steps if time_steps is None else time_steps

        close_prices_scaled = self.scaler.transform(
            data_copy["close"].values.astype(float).reshape(-1, 1)
        )

        x_test, _ = self._prepare_data(close_prices_scaled)
        
        if len(x_test) == 0:
            raise ValueError("Not enough data to create sequences for inference.")

        inputs = torch.tensor(x_test, dtype=torch.float32)

        with torch.no_grad():
            predictions_scaled, _ = self.model(inputs)  # Get only the output
        
        predictions = self.scaler.inverse_transform(predictions_scaled.cpu().numpy())
        
        # Align predictions with the correct dates
        prediction_dates = data_copy.index[time_steps:]
        
        df_predictions = pd.DataFrame(
            {
                "date": prediction_dates,
                "prediction": predictions.flatten(),
            }
        )

        return df_predictions


    def forecast(self, steps: int, last_known_data: pd.DataFrame) -> pd.DataFrame:
        """Forecast future values based on the last known data."""
        self.model.eval()

        # Create a copy to avoid SettingWithCopyWarning
        data_copy = last_known_data.copy()
        
        if "date" in data_copy.columns:
            data_copy["date"] = pd.to_datetime(data_copy["date"])
            data_copy = data_copy.set_index("date")

        # For inference, preserve the original data frequency instead of aggressive resampling
        # Only resample if the data is very high frequency (e.g., 1min) to avoid memory issues
        if len(data_copy) > 1000:  # If we have too many rows, resample to hourly
            data_copy = data_copy.resample("H").mean().dropna()
            print(f"📊 High frequency data detected, resampling to hourly: {len(data_copy)} rows")
        else:
            # Keep original frequency for inference
            print(f"📊 Keeping original data frequency: {len(data_copy)} rows")
        
        print(f"📊 Required time_steps: {self.config.time_steps}")

        if len(data_copy) < self.config.time_steps:
            raise ValueError(
                f"Not enough data to generate a forecast. Required at least {self.config.time_steps} data points, got {len(data_copy)} after processing."
            )

        close_prices_scaled = self.scaler.transform(
            data_copy["close"].values.astype(float).reshape(-1, 1)
        )

        last_sequence = close_prices_scaled[-self.config.time_steps :].reshape(
            1, self.config.time_steps, 1
        )
        predictions = []

        with torch.no_grad():
            current_sequence = torch.tensor(last_sequence, dtype=torch.float32)
            for _ in range(steps):
                predicted_scaled, _ = self.model(current_sequence)  # Get only the output
                predictions.append(predicted_scaled.cpu().numpy().flatten()[0])
                
                # Append prediction and slide window
                # Get the current sequence without the first element
                current_seq_np = current_sequence.numpy()[0, 1:, 0]  # Shape: (time_steps-1,)
                predicted_value = predicted_scaled.cpu().numpy()[0]
                
                print(f"🔧 Debug - current_seq_np shape: {current_seq_np.shape}, predicted_value: {predicted_value}")
                print(f"🔧 Debug - current_seq_np: {current_seq_np}")
                
                # Append the new prediction
                new_sequence_np = np.append(current_seq_np, predicted_value)
                print(f"🔧 Debug - new_sequence_np shape: {new_sequence_np.shape}")
                
                # Reshape to (1, time_steps, 1) for the LSTM
                reshaped_sequence = new_sequence_np.reshape(1, -1, 1)
                print(f"🔧 Debug - reshaped_sequence shape: {reshaped_sequence.shape}")
                
                current_sequence = torch.tensor(reshaped_sequence, dtype=torch.float32)


        predictions_unscaled = self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        
        # Determine the appropriate frequency for forecast dates based on the processed data
        if len(data_copy) > 1000:  # If we resampled to hourly
            forecast_freq = "H"
        else:
            # Infer frequency from the data
            if len(data_copy) > 1:
                time_diff = data_copy.index[1] - data_copy.index[0]
                if time_diff <= pd.Timedelta(minutes=5):
                    forecast_freq = "5T"  # 5 minutes
                elif time_diff <= pd.Timedelta(minutes=15):
                    forecast_freq = "15T"  # 15 minutes
                elif time_diff <= pd.Timedelta(minutes=30):
                    forecast_freq = "30T"  # 30 minutes
                elif time_diff <= pd.Timedelta(hours=1):
                    forecast_freq = "H"  # Hourly
                elif time_diff <= pd.Timedelta(days=1):
                    forecast_freq = "D"  # Daily
                else:
                    forecast_freq = "D"  # Default to daily
            else:
                forecast_freq = "D"  # Default to daily
        
        forecast_dates = pd.date_range(
            start=data_copy.index[-1] + pd.Timedelta(seconds=1),  # Start from next second
            periods=steps,
            freq=forecast_freq,
        )

        df_forecast = pd.DataFrame(
            {
                "date": forecast_dates,
                "Forecasted Close": predictions_unscaled.flatten(),
            }
        )

        return df_forecast

    def _prepare_data(self, data, time_steps=None):
        """Prepare data into sequences for the LSTM."""
        if time_steps is None:
            time_steps = self.config.time_steps
        
        x, y = [], []
        for i in range(len(data) - time_steps):
            x.append(data[i:(i + time_steps)])
            y.append(data[i + time_steps])
        
        return np.array(x), np.array(y)









