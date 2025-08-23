"""
@description
This module provides the core logic for fetching financial data from the Tiingo API
and uploading it as a CSV to AWS S3. The entire process is encapsulated within a
Modal function, ensuring it runs in a secure, isolated, and scalable environment.

Key components:
- `FetchDataParams`: A dataclass for type-safe input parameters.
- `_fetch_and_upload_tiingo_data`: The main Modal function that:
  1. Authenticates with Tiingo and AWS S3 using Modal secrets.
  2. Constructs the appropriate API request for either stock or crypto data.
  3. Fetches the data, normalizes it into a pandas DataFrame.
  4. Saves the DataFrame as a CSV to a temporary local file.
  5. Uploads the CSV file to the specified S3 bucket.
  6. Returns the unique S3 key for the newly created dataset file.
"""

import dataclasses
import os
import tempfile
from pathlib import Path

import boto3
import modal
import pandas as pd
import requests

# --- Modal Configuration ---
app = modal.App("ai-workbench-data-fetcher")

# Define a consistent image with necessary dependencies.
image = modal.Image.from_registry("python:3.12-slim").pip_install(
    "pandas", "requests", "boto3"
)

# Define Modal secrets for secure access to API keys and credentials.
aws_secret = modal.Secret.from_name("ai-workbench-aws-secret")
tiingo_secret = modal.Secret.from_name("ai-workbench-tiingo-secret")

# --- Dataclass for Type Safety ---
@dataclasses.dataclass
class FetchDataParams:
    """Input parameters for the data fetching function."""
    data_type: str  # "stock" or "crypto"
    symbol: str
    start_date: str
    end_date: str
    frequency: str
    user_id: str
    project_id: str
    dataset_name: str


# --- Data Fetching and Normalization Logic (Adapted from MDK) ---
BASE_APIURL = "https://api.tiingo.com"

def _normalize_tiingo_data(data, asset_name):
    """Normalize Tiingo data to match the required schema."""
    if not data:
        print(f"No data available for {asset_name}")
        return pd.DataFrame()

    try:
        normalized_data = pd.DataFrame(data)
    except ValueError as e:
        print(f"Error in processing data for {asset_name}: {e}")
        return pd.DataFrame()

    normalized_data["date"] = pd.to_datetime(normalized_data["date"], errors="coerce")
    return normalized_data[["date", "open", "high", "low", "close", "volume"]]


# --- Modal Function for Core Logic ---
@app.function(image=image, secrets=[aws_secret, tiingo_secret], timeout=600)
def _fetch_and_upload_tiingo_data(params: FetchDataParams) -> str:
    """
    Fetches data from Tiingo API, saves it as a CSV, and uploads to S3.
    Returns the S3 key of the uploaded file.
    """
    print(f"Starting Tiingo data fetch for symbol: {params.symbol}")

    tiingo_api_key = os.environ["TIINGO_API_KEY"]
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {tiingo_api_key}",
    }

    # Clean and validate symbol format
    clean_symbol = params.symbol.strip().lower()
    if not clean_symbol.replace('_', '').isalnum():
        raise ValueError(f"Invalid symbol format: {params.symbol}. Use only letters, numbers, and underscores.")
    
    if params.data_type == "stock":
        # For stocks, ensure it's a valid ticker format (typically 1-5 characters)
        if len(clean_symbol) > 10:
            raise ValueError(f"Stock symbol too long: {clean_symbol}. Maximum 10 characters allowed.")
        
        url = f"{BASE_APIURL}/tiingo/daily/{clean_symbol}/prices"
        api_params = {
            "startDate": params.start_date,
            "endDate": params.end_date,
            "resampleFreq": params.frequency,
        }
    elif params.data_type == "crypto":
        # For crypto, ensure it's a valid trading pair format
        if len(clean_symbol) < 6 or len(clean_symbol) > 10:
            raise ValueError(f"Crypto symbol format invalid: {clean_symbol}. Should be 6-10 characters (e.g., btcusd)")
        
        url = f"{BASE_APIURL}/tiingo/crypto/prices"
        api_params = {
            "tickers": clean_symbol,
            "startDate": params.start_date,
            "endDate": params.end_date,
            "resampleFreq": params.frequency,
        }
    else:
        raise ValueError(f"Unsupported data type: {params.data_type}")

    try:
        response = requests.get(url, headers=headers, params=api_params, timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        if response.status_code == 404:
            raise ValueError(f"Symbol '{clean_symbol}' not found. Please check the symbol and try again.")
        elif response.status_code == 401:
            raise ValueError("Invalid API key. Please check your Tiingo API configuration.")
        elif response.status_code == 429:
            raise ValueError("Rate limit exceeded. Please wait a moment and try again.")
        else:
            raise ValueError(f"API request failed: {e}")
    
    try:
        raw_data = response.json()
    except ValueError:
        raise ValueError("Invalid response from Tiingo API. Please try again later.")
    
    if params.data_type == "crypto":
        if not raw_data or "priceData" not in raw_data[0]:
            raise ValueError(f"No crypto data found for {clean_symbol}. Please check the symbol format (e.g., btcusd)")
        price_data = raw_data[0]["priceData"]
    else:
        price_data = raw_data

    df = _normalize_tiingo_data(price_data, params.symbol)
    if df.empty:
        raise ValueError("Fetched data is empty or could not be normalized.")

    # --- S3 Upload Logic ---
    with tempfile.TemporaryDirectory() as temp_dir:
        local_csv_path = Path(temp_dir) / f"{params.symbol}.csv"
        df.to_csv(local_csv_path, index=False)

        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
            region_name=os.environ["AWS_REGION"],
        )
        datasets_bucket = os.environ["S3_DATASETS_BUCKET"]

        # Use the user-provided name for the S3 object
        s3_key = f"{params.user_id}/{params.project_id}/{params.dataset_name}"

        print(f"Uploading dataset to s3://{datasets_bucket}/{s3_key}")
        s3_client.upload_file(str(local_csv_path), datasets_bucket, s3_key)

        return s3_key
