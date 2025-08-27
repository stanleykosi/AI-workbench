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

    # Use a single shared inference endpoint that dynamically loads by experiment_id.
    app_name = "ai-workbench-inference-endpoint"
    print(f"🔧 Ensuring shared inference app '{app_name}' is deployed")

    # Try to look up the existing deployment; if not found, deploy once.
    from modal import Function
    try:
        fn = Function.from_name(app_name, "inference_endpoint")
    except Exception:
        print("ℹ️ Inference app not found; deploying base inference app once...")
        from endpoints.inference_api import app as inference_api_app  # deferred import
        inference_api_app.deploy()
        fn = Function.from_name(app_name, "inference_endpoint")
    # Prefer new API; falls back to older property if needed
    endpoint_url = None
    if hasattr(fn, "get_web_url"):
        try:
            endpoint_url = fn.get_web_url()
        except Exception:
            endpoint_url = None
    if not endpoint_url:
        endpoint_url = getattr(fn, "web_url", None)
    if not endpoint_url:
        raise RuntimeError(
            "Failed to resolve web endpoint URL after deployment; function has no web_url."
        )
    print(f"✅ Deployment successful! Endpoint URL: {endpoint_url}")

    return DeployModelActivityResult(endpoint_url=endpoint_url)
