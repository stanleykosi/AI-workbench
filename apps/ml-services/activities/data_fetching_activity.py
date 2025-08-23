"""
@description
This module defines the Temporal activity for fetching financial data from Tiingo.
It acts as a lightweight wrapper that triggers the execution of the data fetching
and S3 upload logic on a Modal function.

Key components:
- `FetchDataActivityParams`: A dataclass for type-safe input to the activity.
- `fetch_data_activity`: The Temporal activity that is called by a workflow. It
  invokes the Modal function responsible for the actual data fetching.
"""

import dataclasses
from temporalio import activity

# Import the Modal function that contains the core logic
from data_fetcher.tiingo import _fetch_and_upload_tiingo_data

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

    This function is executed by a Temporal worker and offloads the actual
    computation to a Modal function.

    Args:
        params: The parameters for the data fetching job.

    Returns:
        The S3 key of the newly created dataset file.
    """
    activity.heartbeat()

    # Call the Modal function remotely and wait for its result.
    s3_key = await _fetch_and_upload_tiingo_data.remote.aio(params)
    return s3_key
