"""
@description
This module defines the Temporal activity for deploying a model as a Modal web endpoint.
The activity now runs locally within the Temporal worker container on Modal.

Key components:
- `DeployModelActivityParams` & `DeployModelActivityResult`: Dataclasses for type-safe
  data exchange between the workflow and the activity.
- `deploy_model_activity`: The Temporal activity that executes the deployment logic
  directly within the worker container.
"""

import dataclasses
import os
from temporalio import activity

# --- Dataclass Definitions for Type Safety ---

@dataclasses.dataclass
class DeployModelActivityParams:
    """Input parameters for the deploy_model_activity."""

    experiment_id: str


@dataclasses.dataclass
class DeployModelActivityResult:
    """Result of the deploy_model_activity."""

    endpoint_url: str


# --- Temporal Activity Definition ---

@activity.defn
async def deploy_model_activity(
    params: DeployModelActivityParams,
) -> DeployModelActivityResult:
    """
    Temporal Activity to deploy an ML model as a Modal web endpoint.

    This function now runs directly within the Temporal worker container on Modal.
    All deployment logic executes locally.

    Args:
        params: The input parameters, including the experiment ID to be deployed.

    Returns:
        The result of the deployment, containing the public URL of the new endpoint.
    """
    activity.heartbeat()
    print(f"🚀 Starting deployment for experiment: {params.experiment_id}")

    # Sanitize the experiment_id (which is a UUID) to be a valid part of a deployment name.
    # Modal deployment names must be DNS-compliant.
    safe_experiment_id = params.experiment_id.replace("-", "")
    deployment_name = f"inference-ep--{safe_experiment_id}"

    print(f"🔧 Creating deployment with name: {deployment_name}")

    # Defer import to avoid pulling Modal/ASGI app into workflow sandbox
    from endpoints.inference_api import app as inference_api_app

    # Programmatically deploy the FastAPI app defined in `inference_api.py`.
    # The `name` parameter makes this a persistent, named deployment.
    # `public=True` makes the deployment's web URL accessible from the internet.
    deployment = inference_api_app.deploy(
        name=deployment_name,
        public=True,
    )

    # Get the public URL of the deployment
    endpoint_url = deployment.url
    print(f"✅ Deployment successful! Endpoint URL: {endpoint_url}")

    return DeployModelActivityResult(endpoint_url=endpoint_url)
