import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import MinMaxScaler
from torch import nn
from torch.optim.adam import Adam
from torch.utils.data import DataLoader, TensorDataset

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

        if "date" in input_data.columns:
            input_data["date"] = pd.to_datetime(input_data["date"])
            input_data = input_data.set_index("date")

        input_data = input_data.resample(self.config.interval).mean().dropna()
        
        time_steps = self.config.time_steps if time_steps is None else time_steps

        close_prices_scaled = self.scaler.transform(
            input_data["close"].values.astype(float).reshape(-1, 1)
        )

        x_test, _ = self._prepare_data(close_prices_scaled)
        
        if len(x_test) == 0:
            raise ValueError("Not enough data to create sequences for inference.")

        inputs = torch.tensor(x_test, dtype=torch.float32)

        with torch.no_grad():
            predictions_scaled, _ = self.model(inputs)  # Get only the output
        
        predictions = self.scaler.inverse_transform(predictions_scaled.cpu().numpy())
        
        # Align predictions with the correct dates
        prediction_dates = input_data.index[time_steps:]
        
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

        if "date" in last_known_data.columns:
            last_known_data["date"] = pd.to_datetime(last_known_data["date"])
            last_known_data = last_known_data.set_index("date")

        last_known_data = last_known_data.resample(self.config.interval).mean().dropna()

        if len(last_known_data) < self.config.time_steps:
            raise ValueError(
                f"Not enough data to generate a forecast. Required at least {self.config.time_steps} data points."
            )

        close_prices_scaled = self.scaler.transform(
            last_known_data["close"].values.astype(float).reshape(-1, 1)
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
                new_sequence_np = np.append(current_sequence.numpy()[0,1:], [[predicted_scaled.cpu().numpy()[0]]], axis=0)
                current_sequence = torch.tensor(new_sequence_np, dtype=torch.float32).unsqueeze(0)


        predictions_unscaled = self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        
        forecast_dates = pd.date_range(
            start=last_known_data.index[-1] + pd.Timedelta(days=1),
            periods=steps,
            freq=self.config.interval,
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








