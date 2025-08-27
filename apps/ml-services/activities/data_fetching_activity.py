"""
@description
This module defines the Temporal activity for fetching financial data from Tiingo.
The activity now runs locally within the Temporal worker container on Modal.

Key components:
- `FetchDataActivityParams`: A dataclass for type-safe input to the activity.
- `fetch_data_activity`: The Temporal activity that executes the data fetching
  logic directly within the worker container.
"""

import dataclasses
import os
from pathlib import Path
import tempfile
from datetime import datetime

from temporalio import activity

# --- Dataclass for Type Safety ---

@dataclasses.dataclass
class FetchDataActivityParams:
    """Input parameters for the fetch_data_activity."""
    data_type: str
    symbol: str
    start_date: str
    end_date: str
    frequency: str
    user_id: str
    project_id: str
    dataset_name: str


# --- Temporal Activity Definition ---

@activity.defn
async def fetch_data_activity(params: FetchDataActivityParams) -> str:
    """
    Temporal Activity to fetch data from Tiingo and upload it to S3.

    This function now runs directly within the Temporal worker container on Modal.
    All data fetching logic executes locally.

    Args:
        params: The parameters for the data fetching job.

    Returns:
        The S3 key of the newly created dataset file.
    """
    activity.heartbeat()
    print(f"🚀 Starting data fetch for {params.symbol} ({params.data_type})")

    # Get environment variables
    tiingo_api_key = os.environ.get("TIINGO_API_KEY")
    if not tiingo_api_key:
        raise ValueError("TIINGO_API_KEY environment variable not set")

    # Defer heavy imports to function scope to avoid workflow sandbox issues
    import boto3
    import pandas as pd
    import requests

    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name=os.environ["AWS_REGION"],
    )
    
    datasets_bucket = os.environ["S3_DATASETS_BUCKET"]

    # Fetch data from Tiingo
    print(f"📥 Fetching {params.data_type} data for {params.symbol}")
    
    # Support both legacy types (price/fundamentals) and UI types (stock/crypto)
    if params.data_type in ("stock", "price"):
        url = f"https://api.tiingo.com/tiingo/daily/{params.symbol}/prices"
    elif params.data_type == "fundamentals":
        url = f"https://api.tiingo.com/tiingo/fundamentals/{params.symbol}/daily"
    elif params.data_type == "crypto":
        url = "https://api.tiingo.com/tiingo/crypto/prices"
    else:
        raise ValueError(f"Unsupported data type: {params.data_type}")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {tiingo_api_key}"
    }
    
    params_dict = {
        "startDate": params.start_date,
        "endDate": params.end_date,
        "format": "json",
    }

    # For the crypto endpoint, the symbol must be passed via 'tickers'
    if params.data_type == "crypto":
        params_dict["tickers"] = params.symbol.lower()
    
    if params.frequency != "daily":
        params_dict["resampleFreq"] = params.frequency

    response = requests.get(url, headers=headers, params=params_dict)
    response.raise_for_status()
    
    data = response.json()

    # Normalize Tiingo response into OHLCV schema expected by training
    if params.data_type == "crypto":
        # Crypto returns list with entries containing a nested priceData list
        # Example: [{ ticker, baseCurrency, quoteCurrency, priceData: [{date, open, high, low, close, volume, ...}, ...] }]
        records = []
        if isinstance(data, list) and len(data) > 0:
            first = data[0]
            price_data = first.get("priceData") or first.get("tickerData") or []
            if isinstance(price_data, list):
                records = price_data
        df = pd.DataFrame(records)
    else:
        # Stock/daily prices return a flat list of bars
        df = pd.DataFrame(data)

    print(f"📊 Fetched {len(df)} rows after normalization")

    # Ensure required columns exist; map adjusted fields if only adjusted present
    required_cols = ["open", "high", "low", "close", "volume"]
    alt_map = {
        "open": ["adjOpen", "adj_open"],
        "high": ["adjHigh", "adj_high"],
        "low": ["adjLow", "adj_low"],
        "close": ["adjClose", "adj_close"],
        "volume": ["adjVolume", "adj_volume"],
    }
    for col, alts in alt_map.items():
        if col not in df.columns:
            for alt in alts:
                if alt in df.columns:
                    df[col] = df[alt]
                    break

    # Keep only expected training columns plus date if present
    keep_cols = [c for c in ["date"] + required_cols if c in df.columns]
    df = df[keep_cols]

    # Basic cleaning: coerce numerics and drop rows with missing required fields
    for col in required_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.sort_values("date")
    df = df.dropna(subset=[c for c in required_cols if c in df.columns])

    # Final validation
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(
            f"Fetched data missing required columns after normalization: {', '.join(missing)}"
        )
    
    # Create timestamp for unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{params.symbol}_{params.data_type}_{timestamp}.csv"
    
    # Save to temporary file
    with tempfile.TemporaryDirectory() as temp_dir:
        local_file_path = Path(temp_dir) / filename
        df.to_csv(local_file_path, index=False)
        
        # Upload to S3
        s3_key = f"{params.user_id}/{params.project_id}/datasets/{filename}"
        print(f"📤 Uploading to S3: s3://{datasets_bucket}/{s3_key}")
        
        s3_client.upload_file(str(local_file_path), datasets_bucket, s3_key)
        
        print(f"✅ Data fetch complete! S3 key: {s3_key}")
        return s3_key
