"""
@description
This module defines the Temporal workflow for orchestrating the model training process.
A workflow is a durable, fault-tolerant function that coordinates the execution of activities.

Key components:
- `TrainModelWorkflowParams`: A dataclass for type-safe workflow inputs.
- `TrainModelWorkflow`: The main workflow class that defines the sequence of operations:
  1. Call the `train_model_activity` to perform the actual training on Modal.
  2. If training succeeds, call `update_experiment_status_activity` to set the
     experiment status to 'completed' and save the artifact S3 key.
  3. If training fails, call `update_experiment_status_activity` to set the
     status to 'failed'.

This orchestration logic is guaranteed to run to completion by Temporal, even in the
face of worker crashes or infrastructure failures.
"""

import dataclasses
from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

# Import activity stubs. These are type-hinted proxies for the actual activities.
from activities.training_activity import (
    train_model_activity,
    TrainModelActivityParams,
)
from activities.db_update_activity import (
    update_experiment_status_activity,
    UpdateExperimentParams,
)

# Define the input for the workflow in a dataclass for type safety.
@dataclasses.dataclass
class TrainModelWorkflowParams:
    """Input parameters for the TrainModelWorkflow."""

    experiment_id: str
    project_id: str
    user_id: str
    dataset_s3_key: str
    model_config: dict


@workflow.defn
class TrainModelWorkflow:
    """A Temporal Workflow to manage the model training lifecycle."""

    @workflow.run
    async def run(self, params: TrainModelWorkflowParams) -> str:
        """Executes the training workflow."""
        workflow.logger.info(
            f"Starting training workflow for experiment ID: {params.experiment_id}"
        )

        try:
            # Step 1: Execute the model training activity.
            # `workflow.start_activity` schedules the activity to be run by a worker.
            # We provide a timeout and a retry policy. For training, we don't want
            # to retry on failure as it's likely a deterministic issue with the data or code.
            training_result = await workflow.start_activity(
                train_model_activity,
                TrainModelActivityParams(
                    experiment_id=params.experiment_id,
                    project_id=params.project_id,
                    user_id=params.user_id,
                    dataset_s3_key=params.dataset_s3_key,
                    model_config=params.model_config,
                ),
                start_to_close_timeout=timedelta(hours=2),
                retry_policy=RetryPolicy(
                    maximum_attempts=1  # Do not retry training on failure
                ),
            )
            workflow.logger.info(
                f"Training activity completed for experiment: {params.experiment_id}"
            )

            # Step 2: On success, update the experiment status to 'completed'.
            await workflow.start_activity(
                update_experiment_status_activity,
                UpdateExperimentParams(
                    experiment_id=params.experiment_id,
                    status="completed",
                    model_artifact_s3_key=training_result.model_artifact_s3_key,
                ),
                start_to_close_timeout=timedelta(minutes=1),
            )
            workflow.logger.info(
                f"Database updated to 'completed' for experiment: {params.experiment_id}"
            )

            return f"Workflow completed successfully for experiment {params.experiment_id}"

        except Exception as e:
            # Step 3: If the training activity fails, handle the exception.
            workflow.logger.error(
                f"Training workflow failed for experiment {params.experiment_id}: {e}"
            )

            # Update the experiment status to 'failed' in the database.
            await workflow.start_activity(
                update_experiment_status_activity,
                UpdateExperimentParams(
                    experiment_id=params.experiment_id,
                    status="failed",
                ),
                start_to_close_timeout=timedelta(minutes=1),
            )
            workflow.logger.info(
                f"Database updated to 'failed' for experiment: {params.experiment_id}"
            )

            return f"Workflow failed for experiment {params.experiment_id}"
