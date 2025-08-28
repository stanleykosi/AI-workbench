"""
@description
This module defines the Temporal workflow for orchestrating the Tiingo data fetching process.
A workflow is a durable function that coordinates the execution of activities.

Key components:
- `FetchDataWorkflowParams`: A dataclass for type-safe workflow inputs.
- `FetchDataWorkflow`: The main workflow class that defines the sequence of operations:
  1. Call the `fetch_data_activity` to perform data fetching from Tiingo and upload to S3.
  2. If fetching succeeds, call `create_dataset_record_activity` to save the new
     dataset's metadata to the database.
  3. If any step fails, the workflow will fail, and the failure can be observed in the
     Temporal UI for debugging.
"""
import dataclasses
from typing import Any, Dict
from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

# Import activity stubs for type-hinted proxies
from activities.data_fetching_activity import (
    fetch_data_activity,
    FetchDataActivityParams,
)
from activities.db_update_activity import (
    create_dataset_record_activity,
    CreateDatasetRecordParams,
    create_tiingo_fetch_record_activity,
    CreateTiingoFetchRecordParams,
)

# Define the input for the workflow in a dataclass for type safety.
@dataclasses.dataclass
class FetchDataWorkflowParams:
    """Input parameters for the FetchDataWorkflow."""
    project_id: str
    user_id: str
    data_type: str
    symbol: str
    start_date: str
    end_date: str
    frequency: str

@workflow.defn
class FetchDataWorkflow:
    """A Temporal Workflow to manage the Tiingo data fetching lifecycle."""

    @workflow.run
    async def run(self, params: Dict[str, Any]) -> str:
        """Executes the data fetching workflow."""
        # Accept both snake_case and camelCase inputs
        def get(keys: list[str]):
            for k in keys:
                if k in params:
                    return params[k]
            raise KeyError(keys[0])

        project_id = get(["project_id", "projectId"])
        user_id = get(["user_id", "userId"])
        data_type = get(["data_type", "dataType"])
        symbol = get(["symbol"])  # symbol key is consistent across UI
        start_date = get(["start_date", "startDate"])
        end_date = get(["end_date", "endDate"])
        frequency = get(["frequency"])

        workflow.logger.info(f"Starting data fetching workflow for symbol: {symbol}")

        try:
            # Step 1: Execute the data fetching and S3 upload activity.
            s3_key = await workflow.start_activity(
                fetch_data_activity,
                FetchDataActivityParams(
                    project_id=project_id,
                    user_id=user_id,
                    data_type=data_type,
                    symbol=symbol,
                    start_date=start_date,
                    end_date=end_date,
                    frequency=frequency,
                    dataset_name=f"{symbol}_{start_date}_to_{end_date}.csv",
                ),
                start_to_close_timeout=timedelta(minutes=10),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            workflow.logger.info(f"Data fetching activity completed. S3 Key: {s3_key}")

            # Step 2: Create the Tiingo fetch record to store fetch details
            tiingo_fetch_id = await workflow.start_activity(
                create_tiingo_fetch_record_activity,
                CreateTiingoFetchRecordParams(
                    project_id=project_id,
                    user_id=user_id,
                    data_type=data_type,
                    symbol=symbol,
                    start_date=start_date,
                    end_date=end_date,
                    frequency=frequency,
                ),
                start_to_close_timeout=timedelta(minutes=1),
            )
            workflow.logger.info(f"Tiingo fetch record created with ID: {tiingo_fetch_id}")

            # Step 3: Create the dataset record in the database with reference to the fetch record
            await workflow.start_activity(
                create_dataset_record_activity,
                CreateDatasetRecordParams(
                    project_id=project_id,
                    name=f"{symbol} ({frequency})",
                    s3_key=s3_key,
                    status="ready",
                    source="tiingo",
                    tiingo_fetch_id=tiingo_fetch_id,
                ),
                start_to_close_timeout=timedelta(minutes=1),
            )
            workflow.logger.info(f"Database record created for new dataset.")

            return "Workflow completed successfully."

        except Exception as e:
            workflow.logger.error(f"Data fetching workflow failed: {e}")
            raise # Re-raise the exception to make the workflow fail
