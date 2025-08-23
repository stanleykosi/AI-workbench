"""
@description
This module defines a Temporal activity for updating the status of an experiment
in the Supabase database. It is designed to be called by workflows to reflect the
outcome of a process (e.g., model training).

Key components:
- `UpdateExperimentParams`: A dataclass for type-safe input to the activity.
- `update_experiment_status_activity`: The Temporal activity that triggers the
  database update on Modal.
- `_update_experiment_status`: The Modal function containing the core database
  interaction logic, using `psycopg2` to connect and execute an SQL query.

This separation keeps the workflow deterministic and offloads the database connection
and query execution to a secure, isolated Modal environment.
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
    """Input parameters for the database update activity."""

    experiment_id: str
    status: str  # e.g., "completed", "failed"
    model_artifact_s3_key: str | None = None
    # In a production scenario, you would also pass performance_metrics here:
    # performance_metrics: dict | None = None


# --- Temporal Activity Definition ---
@activity.defn
async def update_experiment_status_activity(params: UpdateExperimentParams) -> None:
    """
    Temporal Activity to update an experiment's status in the database.

    This function is executed by a Temporal worker and offloads the actual
    database write operation to a Modal function.

    Args:
        params: The parameters for the update, including experiment ID and new status.
    """
    activity.heartbeat()
    await _update_experiment_status.remote.aio(params)


# --- Modal Function (The actual implementation) ---
@app.function(image=image, secrets=[supabase_secret], timeout=60)
def _update_experiment_status(params: UpdateExperimentParams) -> None:
    """
    The core logic for updating an experiment record, executed in a Modal container.
    """
    print(f"Updating experiment {params.experiment_id} to status: {params.status}")

    conn = None
    cur = None
    try:
        # Connect to the Supabase database using the connection string from the secret.
        conn = psycopg2.connect(os.environ["SUPABASE_DATABASE_URL"])
        cur = conn.cursor()

        # Build the UPDATE query dynamically based on the provided parameters.
        # This prevents SQL injection by using parameterized queries.
        query_parts = ["UPDATE experiments SET status = %s"]
        query_params = [params.status]

        if params.status == "completed" and params.model_artifact_s3_key:
            query_parts.append(", model_artifact_s3_key = %s")
            query_params.append(params.model_artifact_s3_key)
            # Future enhancement: Update performance metrics as well
            # query_parts.append(", performance_metrics = %s")
            # query_params.append(json.dumps(params.performance_metrics))

        query_parts.append("WHERE id = %s")
        query_params.append(params.experiment_id)

        query = " ".join(query_parts)

        # Execute the query and commit the transaction.
        cur.execute(query, tuple(query_params))
        conn.commit()

        print(f"Successfully updated experiment {params.experiment_id}")

    except Exception as e:
        print(f"Database Error: Failed to update experiment {params.experiment_id}. Error: {e}")
        # Raising an exception will cause the Temporal activity to fail,
        # which can be handled by the calling workflow.
        raise
    finally:
        # Ensure database resources are always released.
        if cur:
            cur.close()
        if conn:
            conn.close()
