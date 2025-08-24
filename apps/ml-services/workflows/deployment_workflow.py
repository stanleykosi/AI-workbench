"""
@description
This module defines the Temporal workflow for orchestrating the model deployment process.
The workflow manages the sequence of activities required to deploy an inference endpoint
and update the application's state in the database.

Key components:
- `DeployModelWorkflowParams`: A dataclass for type-safe workflow inputs.
- `DeployModelWorkflow`: The main workflow class that defines the sequence of operations:
  1. Call the `deploy_model_activity` to create a new, persistent Modal web endpoint.
  2. If deployment succeeds, call `update_deployment_status_activity` to set the deployment
     status to 'active' and store the unique endpoint URL.
  3. If deployment fails, call `update_deployment_status_activity` to set the status to
     'error' for clear feedback in the UI.

This durable function ensures that the deployment process is reliable and resilient to
transient failures.
"""

import dataclasses
from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

# Import activity stubs for type-hinted proxies to the actual activities.
from activities.deployment_activity import (
    deploy_model_activity,
    DeployModelActivityParams,
)
from activities.db_update_activity import (
    update_deployment_status_activity,
    UpdateDeploymentParams,
)


@dataclasses.dataclass
class DeployModelWorkflowParams:
    """Input parameters for the DeployModelWorkflow."""

    deployment_id: str
    experiment_id: str


@workflow.defn
class DeployModelWorkflow:
    """A Temporal Workflow to manage the model deployment lifecycle."""

    @workflow.run
    async def run(self, params: DeployModelWorkflowParams) -> str:
        """Executes the deployment workflow."""
        workflow.logger.info(
            f"Starting deployment workflow for experiment: {params.experiment_id}"
        )

        try:
            # The initial deployment record status is set to 'deploying' by the server action.

            # Step 1: Execute the model deployment activity.
            # This activity calls a Modal function that programmatically deploys the
            # inference API app, which can take several minutes.
            deployment_result = await workflow.start_activity(
                deploy_model_activity,
                DeployModelActivityParams(experiment_id=params.experiment_id),
                start_to_close_timeout=timedelta(minutes=15),
                retry_policy=RetryPolicy(
                    maximum_attempts=1  # Do not retry deployment on failure.
                ),
            )
            workflow.logger.info(
                f"Deployment activity completed. URL: {deployment_result.endpoint_url}"
            )

            # Step 2: On success, update the deployment record to 'active' and save the URL.
            await workflow.start_activity(
                update_deployment_status_activity,
                UpdateDeploymentParams(
                    deployment_id=params.deployment_id,
                    status="active",
                    modal_endpoint_url=deployment_result.endpoint_url,
                ),
                start_to_close_timeout=timedelta(minutes=1),
            )
            workflow.logger.info(
                f"Database updated to 'active' for deployment: {params.deployment_id}"
            )

            return "Workflow completed successfully."

        except Exception as e:
            workflow.logger.error(f"Deployment workflow failed: {e}")

            # Step 3: On failure, update the deployment record to 'error'.
            await workflow.start_activity(
                update_deployment_status_activity,
                UpdateDeploymentParams(
                    deployment_id=params.deployment_id, status="error"
                ),
                start_to_close_timeout=timedelta(minutes=1),
            )
            # Re-raise the exception to ensure the workflow is marked as failed in Temporal.
            raise
