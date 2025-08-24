"""
@description
This module defines the Temporal activity for deploying a model as a Modal web endpoint.
It encapsulates the logic for creating a new, named deployment of the generic
inference FastAPI application.

Key components:
- `DeployModelActivityParams` & `DeployModelActivityResult`: Dataclasses for type-safe
  data exchange between the workflow and the activity.
- `deploy_model_activity`: The Temporal activity that triggers the deployment by calling
  a Modal function.
- `_deploy_endpoint`: The Modal function containing the core deployment logic. It imports
  the inference API's Modal App object and calls its `.deploy()` method, creating a
  publicly accessible, persistent web endpoint with a unique URL.

This approach allows for the dynamic creation of inference endpoints on-demand, orchestrated
by a Temporal workflow.
"""
import dataclasses

import modal
from temporalio import activity

# The Modal App object for the inference API is imported. This is the application
# that we want to deploy.
from endpoints.inference_api import app as inference_api_app

# --- Modal Configuration for this Activity ---
app = modal.App("ai-workbench-deployment-activity")

# The image for this activity's execution environment must include all dependencies
# required by the inference_api_app, hence we use the same requirements.txt.
image = modal.Image.from_registry("python:3.12-slim").pip_install_from_requirements(
    "requirements.txt"
)

# Secrets are necessary because the inference_api_app itself requires them.
# The deployment function needs access to these to configure the new deployment.
aws_secret = modal.Secret.from_name("ai-workbench-aws-secret")
supabase_secret = modal.Secret.from_name("ai-workbench-supabase-secret")


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

    This function is executed by a Temporal worker and offloads the actual deployment
    to a Modal function via a `.remote()` call.

    Args:
        params: The input parameters, including the experiment ID to be deployed.

    Returns:
        The result of the deployment, containing the public URL of the new endpoint.
    """
    activity.heartbeat()
    result_url = await _deploy_endpoint.remote.aio(params.experiment_id)
    return DeployModelActivityResult(endpoint_url=result_url)


# --- Modal Function (The actual implementation) ---
@app.function(image=image, secrets=[aws_secret, supabase_secret], timeout=600)
def _deploy_endpoint(experiment_id: str) -> str:
    """
    The core logic for deploying the inference endpoint, executed in a Modal container.
    """
    print(f"Starting deployment for experiment: {experiment_id}")

    # Sanitize the experiment_id (which is a UUID) to be a valid part of a deployment name.
    # Modal deployment names must be DNS-compliant.
    safe_experiment_id = experiment_id.replace("-", "")
    deployment_name = f"inference-ep--{safe_experiment_id}"

    # Programmatically deploy the FastAPI app defined in `inference_api.py`.
    # The `name` parameter makes this a persistent, named deployment.
    # `public=True` makes the deployment's web URL accessible from the internet.
    deployment = inference_api_app.deploy(
        name=deployment_name,
        public=True,
    )

    web_url = deployment.web_url
    print(f"Deployment successful for {experiment_id}. URL: {web_url}")

    return web_url
