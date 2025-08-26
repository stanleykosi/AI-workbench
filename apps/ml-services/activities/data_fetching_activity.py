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
    
    if params.data_type == "price":
        url = f"https://api.tiingo.com/tiingo/daily/{params.symbol}/prices"
    elif params.data_type == "fundamentals":
        url = f"https://api.tiingo.com/tiingo/fundamentals/{params.symbol}/daily"
    else:
        raise ValueError(f"Unsupported data type: {params.data_type}")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {tiingo_api_key}"
    }
    
    params_dict = {
        "startDate": params.start_date,
        "endDate": params.end_date,
        "format": "json"
    }
    
    if params.frequency != "daily":
        params_dict["resampleFreq"] = params.frequency

    response = requests.get(url, headers=headers, params=params_dict)
    response.raise_for_status()
    
    data = response.json()
    print(f"📊 Fetched {len(data)} records from Tiingo")

    # Convert to DataFrame and save
    df = pd.DataFrame(data)
    
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
