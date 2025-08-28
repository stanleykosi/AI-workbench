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

    # Validate dates before proceeding
    try:
        start_dt = datetime.strptime(params.start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(params.end_date, "%Y-%m-%d")
        current_date = datetime.now().date()
        
        # Check if start date is after end date
        if start_dt > end_dt:
            raise ValueError(f"Start date ({params.start_date}) cannot be after end date ({params.end_date})")
        
        # Check if end date is in the future (allow same day)
        if end_dt.date() > current_date:
            raise ValueError(f"End date ({params.end_date}) cannot be in the future")
            
        # Check if start date is too far in the past (more than 10 years)
        if start_dt.year < current_date.year - 10:
            raise ValueError(f"Start date ({params.start_date}) is too far in the past (more than 10 years)")
            
        # Log the date validation for debugging
        print(f"📅 Date validation passed: {params.start_date} to {params.end_date} (current date: {current_date})")
            
    except ValueError as e:
        if "cannot be" in str(e):
            raise e
        else:
            raise ValueError(f"Invalid date format. Expected YYYY-MM-DD, got start_date: {params.start_date}, end_date: {params.end_date}")

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
    
    # Support different data types with correct endpoints based on Tiingo documentation
    if params.data_type in ("stock", "price"):
        # Stocks only support daily, weekly, monthly - NO intraday
        if params.frequency in ("1min", "5min", "15min", "30min", "1hour"):
            raise ValueError(f"Intraday frequencies ({params.frequency}) are not supported for stocks. Stocks only support: daily, weekly, monthly")
        
        # For stocks, always use the daily endpoint
        url = f"https://api.tiingo.com/tiingo/daily/{params.symbol}/prices"
        print(f"🔗 Using daily endpoint for stock {params.symbol} with {params.frequency} frequency")
        
    elif params.data_type == "crypto":
        # Crypto supports intraday frequencies
        url = "https://api.tiingo.com/tiingo/crypto/prices"
        print(f"🔗 Using crypto endpoint for {params.symbol} with {params.frequency} frequency")
        
    elif params.data_type == "forex":
        # Forex supports intraday frequencies
        url = f"https://api.tiingo.com/tiingo/fx/{params.symbol}/prices"
        print(f"🔗 Using forex endpoint for {params.symbol} with {params.frequency} frequency")
        
    elif params.data_type == "iex":
        # IEX supports intraday frequencies
        url = f"https://api.tiingo.com/tiingo/iex/{params.symbol}/prices"
        print(f"🔗 Using IEX endpoint for {params.symbol} with {params.frequency} frequency")
        
    elif params.data_type == "fundamentals":
        url = f"https://api.tiingo.com/tiingo/fundamentals/{params.symbol}/daily"
        print(f"🔗 Using fundamentals endpoint for {params.symbol}")
        
    else:
        raise ValueError(f"Unsupported data type: {params.data_type}. Supported types: stock, crypto, forex, iex, fundamentals")

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
        
        # Common crypto symbol mappings for user-friendly suggestions
        crypto_symbol_mappings = {
            "sol": ["solusd", "solusdt", "solbtc"],
            "bitcoin": ["btcusd", "btcusdt", "btcbtc"],
            "btc": ["btcusd", "btcusdt", "btcbtc"],
            "ethereum": ["ethusd", "ethusdt", "ethbtc"],
            "eth": ["ethusd", "ethusdt", "ethbtc"],
            "cardano": ["adausd", "adausdt", "adabtc"],
            "ada": ["adausd", "adausdt", "adabtc"],
            "polkadot": ["dotusd", "dotusdt", "dotbtc"],
            "dot": ["dotusd", "dotusdt", "dotbtc"]
        }
        
        # Check if we need to suggest alternative symbols
        base_symbol = params.symbol.lower().replace("usd", "").replace("usdt", "").replace("btc", "")
        if base_symbol in crypto_symbol_mappings:
            print(f"💡 If '{params.symbol}' doesn't work, try these alternatives:")
            for alt in crypto_symbol_mappings[base_symbol]:
                print(f"💡   - {alt}")
    
    # Validate and handle frequency parameter based on data type capabilities
    if params.data_type in ("stock", "price"):
        # Stocks only support daily, weekly, monthly (no intraday)
        supported_frequencies = ["daily", "weekly", "monthly"]
        if params.frequency not in supported_frequencies:
            raise ValueError(f"Unsupported frequency '{params.frequency}' for stocks. Stocks only support: {', '.join(supported_frequencies)}")
        
        # Map frontend frequencies to Tiingo API values
        freq_mapping = {
            "daily": "daily",
            "weekly": "1week", 
            "monthly": "1month"
        }
        api_frequency = freq_mapping.get(params.frequency, params.frequency)
        if api_frequency != "daily":
            params_dict["resampleFreq"] = api_frequency
            print(f"📊 Added resampleFreq: {api_frequency}")
            
    elif params.data_type in ("crypto", "forex", "iex"):
        # Crypto, Forex, and IEX support intraday frequencies
        supported_frequencies = ["daily", "1min", "5min", "15min", "30min", "1hour", "weekly", "monthly"]
        if params.frequency not in supported_frequencies:
            raise ValueError(f"Unsupported frequency '{params.frequency}' for {params.data_type}. Supported: {', '.join(supported_frequencies)}")
        
        # Map frontend frequencies to Tiingo API values
        freq_mapping = {
            "daily": "daily",
            "weekly": "1week",
            "monthly": "1month",
            "1min": "1min",
            "5min": "5min", 
            "15min": "15min",
            "30min": "30min",
            "1hour": "1hour"
        }
        api_frequency = freq_mapping.get(params.frequency, params.frequency)
        if api_frequency != "daily":
            params_dict["resampleFreq"] = api_frequency
            print(f"📊 Added resampleFreq: {api_frequency}")
            
    else:
        # For other data types (fundamentals), just add the frequency if it's not daily
        if params.frequency != "daily":
            params_dict["resampleFreq"] = params.frequency

    # Log the API request details for debugging
    print(f"🔗 Making request to: {url}")
    print(f"📋 Request parameters: {params_dict}")
    
    response = requests.get(url, headers=headers, params=params_dict)
    response.raise_for_status()
    
    data = response.json()

    # Normalize Tiingo response into OHLCV schema expected by training
    if params.data_type == "crypto":
        # Based on Tiingo documentation: crypto API returns [{ticker, baseCurrency, quoteCurrency, priceData: [...]}]
        records = []
        print(f"🔍 Crypto API response structure: {type(data)}")
        
        if isinstance(data, list):
            print(f"🔍 Crypto response is a list with {len(data)} items")
            if len(data) > 0:
                first = data[0]
                print(f"🔍 First item keys: {list(first.keys()) if isinstance(first, dict) else 'Not a dict'}")
                
                # According to Tiingo docs, the price data is in the 'priceData' field
                if "priceData" in first and isinstance(first["priceData"], list):
                    records = first["priceData"]
                    print(f"🔍 Found price data in 'priceData' field with {len(records)} records")
                    
                    # Log the structure of the first price record if available
                    if len(records) > 0:
                        print(f"🔍 First price record keys: {list(records[0].keys()) if isinstance(records[0], dict) else 'Not a dict'}")
                else:
                    print(f"❌ No 'priceData' field found in response")
                    print(f"🔍 Available fields: {list(first.keys()) if isinstance(first, dict) else 'Not a dict'}")
                    
                    # Check if this might be a different response format
                    if "ticker" in first:
                        print(f"🔍 Found ticker: {first['ticker']}")
                        if "baseCurrency" in first:
                            print(f"🔍 Base currency: {first['baseCurrency']}")
                        if "quoteCurrency" in first:
                            print(f"🔍 Quote currency: {first['quoteCurrency']}")
        elif isinstance(data, dict):
            print(f"🔍 Crypto response is a dict with keys: {list(data.keys())}")
            # Handle case where response is a single dict instead of list
            if "priceData" in data and isinstance(data["priceData"], list):
                records = data["priceData"]
                print(f"🔍 Found price data in 'priceData' field with {len(records)} records")
        
        print(f"🔍 Final records to process: {len(records)}")
        if len(records) > 0:
            print(f"🔍 Sample record structure: {records[0] if isinstance(records[0], dict) else 'Not a dict'}")
        
        df = pd.DataFrame(records)
    else:
        # Stock/daily prices return a flat list of bars
        df = pd.DataFrame(data)

    print(f"📊 Fetched {len(df)} rows after normalization")

    # Check if we got any data at all
    if len(df) == 0:
        print(f"❌ No data returned from Tiingo API for {params.symbol}")
        print(f"🔍 API Response: {data}")
        
        # Provide helpful suggestions for crypto symbols
        if params.data_type == "crypto":
            print(f"💡 For crypto symbols, try common formats like:")
            print(f"   - 'btcusd' (Bitcoin/USD)")
            print(f"   - 'ethusd' (Ethereum/USD)")
            print(f"   - 'solusd' or 'solusdt' (Solana/USD or Solana/USDT)")
            print(f"   - Check available symbols at: https://api.tiingo.com/tiingo/crypto")
        
        raise ValueError(f"No data returned from Tiingo API for {params.symbol}. This could be due to invalid symbol, date range, or API response format.")

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
