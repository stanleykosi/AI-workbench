#!/usr/bin/env python3
"""
Temporal worker for Modal deployment.
This worker connects to an external Temporal server and processes ML tasks.
"""

import asyncio
import os
import modal
from temporalio.worker import Worker
from temporalio.client import Client

# Import your workflows and activities
from workflows.training_workflow import TrainModelWorkflow
from workflows.data_fetching_workflow import FetchDataWorkflow
from workflows.deployment_workflow import DeployModelWorkflow

from activities.training_activity import train_model_activity
from activities.data_fetching_activity import fetch_data_activity
from activities.db_update_activity import (
    update_experiment_status_activity,
    create_dataset_record_activity,
    update_deployment_status_activity,
)
from activities.deployment_activity import deploy_model_activity

# Create Modal app
app = modal.App("ai-workbench-temporal-worker")

# Define the Docker image
image = modal.Image.from_registry("python:3.12-slim").pip_install_from_requirements(
    "requirements.txt"
)

@app.function(
    image=image,
    timeout=3600,  # 1 hour timeout
    secrets=[
        modal.Secret.from_name("ai-workbench-aws-secret"),
        modal.Secret.from_name("ai-workbench-supabase-secret")
    ]
)
async def start_worker():
    """Start the Temporal worker that connects to an external Temporal server."""
    
    print("🚀 Starting Temporal worker on Modal...")
    
    # Get Temporal connection details from environment
    temporal_host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    temporal_namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    
    print(f"   Host: {temporal_host}")
    print(f"   Namespace: {temporal_namespace}")
    print(f"   Task Queue: ml-training-task-queue")
    
    try:
        # Connect to external Temporal server
        client = await Client.connect(temporal_host, namespace=temporal_namespace)
        print(f"✅ Connected to Temporal server at {temporal_host}")
        
        # Create and start the worker
        worker = Worker(
            client,
            task_queue="ml-training-task-queue",
            workflows=[
                TrainModelWorkflow,
                FetchDataWorkflow,
                DeployModelWorkflow,
            ],
            activities=[
                train_model_activity,
                fetch_data_activity,
                update_experiment_status_activity,
                create_dataset_record_activity,
                update_deployment_status_activity,
                deploy_model_activity,
            ],
        )
        
        print("✅ Temporal worker created successfully!")
        print("📋 Registered Workflows:")
        print("   - TrainModelWorkflow")
        print("   - FetchDataWorkflow")
        print("   - DeployModelWorkflow")
        print("📋 Registered Activities:")
        print("   - train_model_activity")
        print("   - fetch_data_activity")
        print("   - update_experiment_status_activity")
        print("   - create_dataset_record_activity")
        print("   - update_deployment_status_activity")
        print("   - deploy_model_activity")
        print("\n🔄 Worker is running and ready to receive tasks...")
        
        # Start the worker
        await worker.run()
        
    except Exception as e:
        print(f"❌ Failed to connect to Temporal server: {e}")
        print("💡 Make sure TEMPORAL_HOST environment variable is set correctly")
        raise

if __name__ == "__main__":
    # For local testing
    asyncio.run(start_worker())
