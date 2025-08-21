# ML Services - MDK Core Package

This directory contains the `mdk_core` package, which is an adapted version of the Allora Model Development Kit (MDK) transformed into a non-interactive Python library suitable for backend services.

## Overview

The `mdk_core` package provides a comprehensive machine learning framework for financial time series forecasting, featuring:

- **Multiple Model Types**: ARIMA, LSTM, Prophet, Random Forest, XGBoost, and Linear Regression
- **Time Series Variants**: Both standard and time-series versions of regression models
- **Financial Metrics**: Comprehensive set of risk and performance metrics
- **Factory Pattern**: Dynamic model and metric instantiation
- **Non-Interactive Training**: Programmatic training pipeline via `run_training` function

## Package Structure

```
mdk_core/
├── __init__.py                 # Package initialization
├── configs.py                  # Global configuration (models, metrics)
├── trainer.py                  # Core training function
├── data/                       # Data handling utilities
│   ├── __init__.py
│   ├── csv_loader.py          # CSV data loading
│   └── utils/                 # Data preprocessing utilities
│       ├── __init__.py
│       ├── csv_standardizer.py
│       └── data_preprocessing.py
├── metrics/                    # Financial metrics
│   ├── __init__.py
│   ├── base_metric.py         # Abstract base class
│   ├── metric_factory.py      # Metric factory
│   └── [metric_name]/         # Individual metric implementations
│       ├── configs.py         # Metric-specific configuration
│       └── metric.py          # Metric implementation
├── models/                     # Machine learning models
│   ├── __init__.py
│   ├── base_model.py          # Abstract base class
│   ├── model_factory.py       # Model factory
│   └── [model_name]/          # Individual model implementations
│       ├── configs.py         # Model-specific configuration
│       └── model.py           # Model implementation
└── utils/                      # Utility functions
    ├── __init__.py
    ├── common.py              # General utilities
    └── model_commons.py       # ML-specific utilities
```

## Key Features

### 1. Non-Interactive Training
The `run_training` function in `trainer.py` provides a programmatic interface for model training:

```python
from mdk_core.trainer import run_training
import pandas as pd

# Prepare your data (must have columns: open, high, low, volume, close)
data = pd.DataFrame(...)

# Train a model
result = run_training(
    model_name="lstm",
    data=data,
    output_dir="/path/to/output"
)

# Result contains paths to saved artifacts
print(f"Model saved at: {result['model_artifact_path']}")
print(f"Scaler saved at: {result['scaler_artifact_path']}")
```

### 2. Dynamic Model Creation
Use the `ModelFactory` to create models dynamically:

```python
from mdk_core.models.model_factory import ModelFactory

factory = ModelFactory()
model = factory.create_model("arima")  # Creates ARIMA model
model = factory.create_model("lstm")   # Creates LSTM model
```

### 3. Financial Metrics
Calculate various financial performance metrics:

```python
from mdk_core.metrics.metric_factory import MetricFactory

metric_factory = MetricFactory()
sharpe_metric = metric_factory.create_metric("sharpe_ratio")
sharpe_value = sharpe_metric.calculate(data)
```

## Available Models

| Model | Type | Description |
|-------|------|-------------|
| `arima` | Time Series | ARIMA model for univariate time series |
| `lstm` | Neural Network | PyTorch-based LSTM for sequence prediction |
| `prophet` | Time Series | Facebook Prophet for trend forecasting |
| `regression` | Regression | Linear regression on OHLCV features |
| `regression_time_series` | Regression | Linear regression with lag features |
| `random_forest` | Regression | Random Forest on OHLCV features |
| `random_forest_time_series` | Regression | Random Forest with lag features |
| `xgboost` | Regression | XGBoost on OHLCV features |
| `xgboost_time_series` | Regression | XGBoost with lag features |

## Available Metrics

| Metric | Description |
|--------|-------------|
| `sharpe_ratio` | Risk-adjusted return measure |
| `sortino_ratio` | Downside risk-adjusted return |
| `calmar_ratio` | Return vs maximum drawdown |
| `maximum_drawdown` | Maximum loss from peak |
| `mdd_duration` | Duration of maximum drawdown |
| `cagr` | Compound annual growth rate |
| `volatility` | Standard deviation of returns |
| `value_at_risk` | Maximum potential loss |
| `expected_shortfall` | Expected loss beyond VaR |

## Installation

1. Navigate to the `ml-services` directory:
   ```bash
   cd apps/ml-services
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Testing

Run the test script to verify the package is working correctly:

```bash
python test_mdk_core.py
```

## Usage Example

```python
import pandas as pd
from mdk_core.trainer import run_training

# Load your financial data
data = pd.read_csv("financial_data.csv")

# Ensure required columns exist
required_columns = ["open", "high", "low", "volume", "close"]
assert all(col in data.columns for col in required_columns)

# Train an LSTM model
training_result = run_training(
    model_name="lstm",
    data=data,
    output_dir="./trained_models"
)

print(f"Training completed! Model saved at: {training_result['model_artifact_path']}")
```

## Dependencies

The package requires the following key dependencies:
- `pandas` - Data manipulation
- `scikit-learn` - Traditional ML models
- `torch` - PyTorch for LSTM
- `statsmodels` - ARIMA models
- `prophet` - Facebook Prophet
- `xgboost` - Gradient boosting
- `temporalio` - Workflow orchestration
- `modal` - Serverless execution
- `boto3` - AWS integration
- `fastapi` - API endpoints

## Next Steps

This package is designed to integrate with:
1. **Temporal workflows** for orchestrated training
2. **Modal** for serverless model training
3. **FastAPI** for inference endpoints
4. **AWS S3** for model artifact storage

The modular design makes it easy to extend with new models, metrics, and data processing utilities.
