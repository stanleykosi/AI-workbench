"""
@description
This module defines Temporal activities for database update operations.
It is designed to be called by workflows to reflect the outcome of various processes
(e.g., model training, data fetching) in the Supabase database.

Key components:
- `UpdateExperimentParams`, `CreateDatasetRecordParams`, `UpdateDeploymentParams`: Dataclasses
  for type-safe inputs.
- `update_experiment_status_activity`, `create_dataset_record_activity`, `update_deployment_status_activity`:
  Temporal activities that trigger database updates on Modal.
- `_update_experiment_status`, `_create_dataset_record`, `_update_deployment_status`: Modal functions
  containing the core database interaction logic using `psycopg2`.

This separation keeps workflows deterministic and offloads database interactions
to a secure, isolated Modal environment.
"""
import dataclasses
import os
import psycopg2
from temporalio import activity
import modal

# --- Modal Configuration ---
app = modal.App("ai-workbench-db-update-activity")

# Reuse the same image as the training activity for consistency. It already
# contains all necessary dependencies, including psycopg2-binary.
image = modal.Image.from_registry("python:3.12-slim").pip_install_from_requirements(
    "requirements.txt"
)
supabase_secret = modal.Secret.from_name("ai-workbench-supabase-secret")


# --- Dataclass Definitions for Type Safety ---

@dataclasses.dataclass
class UpdateExperimentParams:
    """Input parameters for updating an experiment."""
    experiment_id: str
    status: str
    model_artifact_s3_key: str | None = None

@dataclasses.dataclass
class CreateDatasetRecordParams:
    """Input parameters for creating a new dataset record."""
    project_id: str
    name: str
    s3_key: str
    status: str = "ready"

@dataclasses.dataclass
class UpdateDeploymentParams:
    """Input parameters for updating a deployment."""
    deployment_id: str
    status: str
    modal_endpoint_url: str | None = None


# --- Temporal Activity Definitions ---

@activity.defn
async def update_experiment_status_activity(params: UpdateExperimentParams) -> None:
    """
    Temporal Activity to update an experiment's status in the database.
    Offloads the actual database write operation to a Modal function.
    """
    activity.heartbeat()
    await _update_experiment_status.remote.aio(params)

@activity.defn
async def create_dataset_record_activity(params: CreateDatasetRecordParams) -> None:
    """
    Temporal Activity to create a new dataset record in the database.
    Offloads the actual database insert operation to a Modal function.
    """
    activity.heartbeat()
    await _create_dataset_record.remote.aio(params)

@activity.defn
async def update_deployment_status_activity(params: UpdateDeploymentParams) -> None:
    """
    Temporal Activity to update a deployment's status in the database.
    Offloads the actual database write operation to a Modal function.
    """
    activity.heartbeat()
    await _update_deployment_status.remote.aio(params)


# --- Modal Function (The actual implementation) ---
@app.function(image=image, secrets=[supabase_secret], timeout=60)
def _update_experiment_status(params: UpdateExperimentParams) -> None:
    """
    The core logic for updating an experiment record, executed in a Modal container.
    """
    print(f"Updating experiment {params.experiment_id} to status: {params.status}")

    conn = None
    try:
        # Connect to the Supabase database using the connection string from the secret.
        conn = psycopg2.connect(os.environ["SUPABASE_DATABASE_URL"])
        with conn.cursor() as cur:
            # Build the UPDATE query dynamically based on the provided parameters.
            # This prevents SQL injection by using parameterized queries.
            query_parts = ["UPDATE experiments SET status = %s"]
            query_params = [params.status]

            if params.status == "completed" and params.model_artifact_s3_key:
                query_parts.append(", model_artifact_s3_key = %s")
                query_params.append(params.model_artifact_s3_key)

            query_parts.append("WHERE id = %s")
            query_params.append(params.experiment_id)

            query = " ".join(query_parts)
            cur.execute(query, tuple(query_params))
            conn.commit()
        print(f"Successfully updated experiment {params.experiment_id}")

    except Exception as e:
        print(f"Database Error: Failed to update experiment {params.experiment_id}. Error: {e}")
        raise
    finally:
        if conn:
            conn.close()

@app.function(image=image, secrets=[supabase_secret], timeout=60)
def _create_dataset_record(params: CreateDatasetRecordParams) -> None:
    """The core logic for creating a new dataset record, executed in a Modal container."""
    print(f"Creating dataset record for project: {params.project_id}, name: {params.name}")
    conn = None
    try:
        conn = psycopg2.connect(os.environ["SUPABASE_DATABASE_URL"])
        with conn.cursor() as cur:
            query = """
                INSERT INTO datasets (project_id, name, s3_key, status)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(query, (params.project_id, params.name, params.s3_key, params.status))
            conn.commit()
        print(f"Successfully created dataset record: {params.name}")
    except Exception as e:
        print(f"Database Error: Failed to create dataset record for {params.name}. Error: {e}")
        raise
    finally:
        if conn:
            conn.close()

@app.function(image=image, secrets=[supabase_secret], timeout=60)
def _update_deployment_status(params: UpdateDeploymentParams) -> None:
    """The core logic for updating a deployment record, executed in a Modal container."""
    print(f"Updating deployment {params.deployment_id} to status {params.status}")
    conn = None
    try:
        conn = psycopg2.connect(os.environ["SUPABASE_DATABASE_URL"])
        with conn.cursor() as cur:
            query_parts = ["UPDATE deployments SET status = %s"]
            query_params = [params.status]

            if params.modal_endpoint_url:
                query_parts.append(", modal_endpoint_url = %s")
                query_params.append(params.modal_endpoint_url)

            query_parts.append("WHERE id = %s")
            query_params.append(params.deployment_id)

            query = " ".join(query_parts)
            cur.execute(query, tuple(query_params))
            conn.commit()
        print(f"Successfully updated deployment {params.deployment_id} to status {params.status}")
    except Exception as e:
        print(f"Database Error: Failed to update deployment {params.deployment_id}. Error: {e}")
        raise
    finally:
        if conn:
            conn.close()
