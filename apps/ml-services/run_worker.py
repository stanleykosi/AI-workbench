#!/usr/bin/env python3
"""
Temporal worker script for the AI Workbench ML services.
This worker registers all workflows and activities for model training, data fetching, and deployment.
"""

import asyncio
import os
from temporalio.client import Client
from temporalio.worker import Worker

# Import all workflows
from workflows.training_workflow import TrainModelWorkflow
from workflows.data_fetching_workflow import FetchDataWorkflow
from workflows.deployment_workflow import DeployModelWorkflow

# Import all activities
from activities.training_activity import train_model_activity
from activities.data_fetching_activity import fetch_data_activity
from activities.db_update_activity import (
    update_experiment_status_activity,
    create_dataset_record_activity,
    update_deployment_status_activity,
)
from activities.deployment_activity import deploy_model_activity


async def main():
    """Start the Temporal worker with all workflows and activities."""
    
    # Get Temporal connection details from environment
    temporal_host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    temporal_namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    
    print(f"🚀 Starting Temporal worker...")
    print(f"   Host: {temporal_host}")
    print(f"   Namespace: {temporal_namespace}")
    print(f"   Task Queue: ml-training-task-queue")
    
    # Connect to Temporal
    client = await Client.connect(temporal_host, namespace=temporal_namespace)
    
    # Create and start the worker
    worker = Worker(
        client,
        task_queue="ml-training-task-queue",
        workflows=[
            TrainModelWorkflow,
            FetchDataWorkflow,
            DeployModelWorkflow,  # New deployment workflow
        ],
        activities=[
            train_model_activity,
            fetch_data_activity,
            update_experiment_status_activity,
            create_dataset_record_activity,
            update_deployment_status_activity,  # New deployment status activity
            deploy_model_activity,  # New deployment activity
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
    
    try:
        await worker.run()
    except KeyboardInterrupt:
        print("\n⏹️  Worker stopped by user")
    except Exception as e:
        print(f"❌ Worker error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
