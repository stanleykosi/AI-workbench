import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler

from mdk_core.models.base_model import Model
from mdk_core.models.regression_time_series.configs import RegressionTimeSeriesConfig
from mdk_core.utils.model_commons import create_lag_features


class RegressionTimeSeriesModel(Model):
    """Linear Regression model for time series forecasting with lag features."""

    def __init__(
        self,
        model_name="regression_time_series",
        config=RegressionTimeSeriesConfig(),
        debug=False,
    ):
        super().__init__(model_name=model_name, debug=debug)
        self.model = LinearRegression()
        self.scaler = MinMaxScaler(
            feature_range=config.scaler_feature_range
        )  # Initialize the scaler with the configured range
        self.n_lags = (
            config.n_lags
        )  # Set the number of lag features based on the config
        self.config = config

    def train(self, data: pd.DataFrame):
        # Create lag features for the 'close' column
        data_with_lags = create_lag_features(data, "close", self.n_lags)

        # Define features and target (lags as features, 'close' as target)
        x = data_with_lags[
            ["open", "high", "low", "volume"]
            + [f"lag_{i}" for i in range(1, self.n_lags + 1)]
        ]
        y = data_with_lags["close"]

        # Normalize the features using MinMaxScaler
        x_scaled = self.scaler.fit_transform(x)

        # Train the linear regression model
        self.model.fit(x_scaled, y)

        # Save the model and scaler
        self.save()

    def inference(self, input_data: pd.DataFrame) -> pd.DataFrame:
        # Create lag features for prediction
        input_data_with_lags = create_lag_features(input_data, "close", self.n_lags)

        # Define features for prediction
        x_test = input_data_with_lags[
            ["open", "high", "low", "volume"]
            + [f"lag_{i}" for i in range(1, self.n_lags + 1)]
        ]

        # Check if there are enough samples for inference
        if len(x_test) == 0:
            raise ValueError(
                f"Not enough data for the model. Expected at least {self.n_lags + 1} rows, but got {len(input_data)}."
            )

        # Use the scaler to normalize the input data
        x_test_scaled = self.scaler.transform(x_test)

        # Predict using the trained model
        predictions = self.model.predict(x_test_scaled)

        # Ensure the predictions have the same index as input_data_with_lags, not input_data
        predictions_df = pd.DataFrame(
            {"prediction": predictions}, index=input_data_with_lags.index
        )

        # Merge the predictions back with the original input_data index, filling NaNs for the initial rows
        result = pd.DataFrame(
            index=input_data.index
        )  # Create a DataFrame with the original input_data index
        result = result.merge(
            predictions_df, left_index=True, right_index=True, how="left"
        )  # Merge on index

        return result

    def forecast(self, steps: int) -> pd.DataFrame:
        """Linear regression models generally don't forecast directly; dummy implementation for now."""
        return pd.DataFrame({"forecast": ["N/A"] * steps})



