#!/usr/bin/env python3
"""
Temporal worker script for the AI Workbench ML services.
This worker registers all workflows and activities for model training, data fetching, and deployment.
"""

import asyncio
import os
import modal
from temporalio.client import Client
from temporalio.worker import Worker

# Create Modal app
app = modal.App("ai-workbench-temporal-worker")

# Define the Docker image with local directory mounted
image = (
    modal.Image.from_registry("python:3.12-slim")
    .pip_install_from_requirements("requirements.txt")
    .add_local_dir(".", remote_path="/app")  # Modern way to mount directory
)

@app.function(
    image=image,
    timeout=3600,  # 1 hour timeout
    secrets=[
        modal.Secret.from_name("ai-workbench-aws-secret"),
        modal.Secret.from_name("ai-workbench-supabase-secret"),
        modal.Secret.from_name("ai-workbench-temporal-secret")
    ]
)
async def start_worker():
    """Start the Temporal worker with all workflows and activities."""
    
    # Change to the mounted directory
    os.chdir("/app")
    
    print("🚀 Starting Temporal worker on Modal...")
    print("📁 Using mounted directory: /app")
    
    # Now we can import from the mounted directory
    try:
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
        
        print("✅ Successfully imported all workflows and activities from mounted directory")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Check that the directory is properly mounted")
        raise
    
    # Get Temporal connection details from environment (via Modal secret)
    temporal_host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    temporal_namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    
    print(f"   Host: {temporal_host}")
    print(f"   Namespace: {temporal_namespace}")
    print(f"   Task Queue: ml-training-task-queue")
    
    try:
        # Connect to Temporal
        print(f"🔌 Connecting to Temporal server at {temporal_host}...")
        client = await Client.connect(temporal_host, namespace=temporal_namespace)
        print("✅ Successfully connected to Temporal server!")
        
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
        
        print("✅ Worker created successfully!")
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
        print("\n🔄 Starting worker... (Press Ctrl+C to stop)")
        
        # Start the worker
        await worker.run()
        
    except Exception as e:
        print(f"❌ Worker error: {e}")
        print("💡 Make sure your Temporal server is running and accessible")
        raise

if __name__ == "__main__":
    # For local testing
    asyncio.run(start_worker())
