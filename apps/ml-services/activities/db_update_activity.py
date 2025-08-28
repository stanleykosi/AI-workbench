"""
@description
This module defines Temporal activities for database update operations.
The activities now run locally within the Temporal worker container on Modal.

Key components:
- `UpdateExperimentParams`, `CreateDatasetRecordParams`, `UpdateDeploymentParams`: Dataclasses
  for type-safe inputs.
- `update_experiment_status_activity`, `create_dataset_record_activity`, `update_deployment_status_activity`:
  Temporal activities that execute database updates directly within the worker.
"""

import dataclasses
import os
import psycopg2
from temporalio import activity

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
    source: str | None = None
    tiingo_fetch_id: str | None = None

@dataclasses.dataclass
class UpdateDeploymentParams:
    """Input parameters for updating a deployment."""
    deployment_id: str
    status: str
    modal_endpoint_url: str | None = None

@dataclasses.dataclass
class CreateTiingoFetchRecordParams:
    """Input parameters for creating a new Tiingo fetch record."""
    project_id: str
    user_id: str
    data_type: str
    symbol: str
    start_date: str
    end_date: str
    frequency: str


# --- Temporal Activity Definitions ---

@activity.defn
async def update_experiment_status_activity(params: UpdateExperimentParams) -> None:
    """
    Temporal Activity to update an experiment's status in the database.
    Executes the database write operation directly within the worker.
    """
    activity.heartbeat()
    print(f"🔄 Updating experiment {params.experiment_id} to status: {params.status}")

    conn = None
    try:
        # Connect to the Supabase database using the connection string from environment
        database_url = os.environ["SUPABASE_DATABASE_URL"]
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # Update the experiment status (no updated_at column in schema)
        if params.model_artifact_s3_key:
            cursor.execute(
                """
                UPDATE experiments 
                SET status = %s, model_artifact_s3_key = %s
                WHERE id = %s
                """,
                (params.status, params.model_artifact_s3_key, params.experiment_id)
            )
        else:
            cursor.execute(
                """
                UPDATE experiments 
                SET status = %s
                WHERE id = %s
                """,
                (params.status, params.experiment_id)
            )

        conn.commit()
        print(f"✅ Successfully updated experiment {params.experiment_id}")

    except Exception as e:
        print(f"❌ Error updating experiment: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

@activity.defn
async def create_dataset_record_activity(params: CreateDatasetRecordParams) -> None:
    """
    Temporal Activity to create a new dataset record in the database.
    Executes the database insert operation directly within the worker.
    """
    activity.heartbeat()
    print(f"📝 Creating dataset record: {params.name}")

    conn = None
    try:
        # Connect to the Supabase database
        database_url = os.environ["SUPABASE_DATABASE_URL"]
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # Insert the new dataset record with optional Tiingo fetch reference
        cursor.execute(
            """
            INSERT INTO datasets (project_id, name, s3_key, status, source, tiingo_fetch_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (params.project_id, params.name, params.s3_key, params.status, params.source, params.tiingo_fetch_id)
        )

        conn.commit()
        print(f"✅ Successfully created dataset record: {params.name}")

    except Exception as e:
        print(f"❌ Error creating dataset record: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

@activity.defn
async def create_tiingo_fetch_record_activity(params: CreateTiingoFetchRecordParams) -> str:
    """
    Temporal Activity to create a new Tiingo fetch record in the database.
    Returns the ID of the created fetch record.
    """
    activity.heartbeat()
    print(f"📝 Creating Tiingo fetch record for {params.symbol}")

    conn = None
    try:
        # Connect to the Supabase database
        database_url = os.environ["SUPABASE_DATABASE_URL"]
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # Insert the new Tiingo fetch record
        cursor.execute(
            """
            INSERT INTO tiingo_fetches (project_id, user_id, data_type, symbol, start_date, end_date, frequency)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (params.project_id, params.user_id, params.data_type, params.symbol, params.start_date, params.end_date, params.frequency)
        )

        # Get the ID of the created record
        fetch_id = cursor.fetchone()[0]
        
        conn.commit()
        print(f"✅ Successfully created Tiingo fetch record: {fetch_id}")

        return str(fetch_id)

    except Exception as e:
        print(f"❌ Error creating Tiingo fetch record: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

@activity.defn
async def update_deployment_status_activity(params: UpdateDeploymentParams) -> None:
    """
    Temporal Activity to update a deployment's status in the database.
    Executes the database write operation directly within the worker.
    """
    activity.heartbeat()
    print(f"🔄 Updating deployment {params.deployment_id} to status: {params.status}")

    conn = None
    try:
        # Connect to the Supabase database
        database_url = os.environ["SUPABASE_DATABASE_URL"]
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # Update the deployment status (no updated_at column in schema)
        if params.modal_endpoint_url:
            cursor.execute(
                """
                UPDATE deployments 
                SET status = %s, modal_endpoint_url = %s
                WHERE id = %s
                """,
                (params.status, params.modal_endpoint_url, params.deployment_id)
            )
        else:
            cursor.execute(
                """
                UPDATE deployments 
                SET status = %s
                WHERE id = %s
                """,
                (params.status, params.deployment_id)
            )

        conn.commit()
        print(f"✅ Successfully updated deployment {params.deployment_id}")

    except Exception as e:
        print(f"❌ Error updating deployment: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()
