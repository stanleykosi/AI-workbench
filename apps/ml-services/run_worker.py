#!/usr/bin/env python3
"""
Temporal worker script for the AI Workbench ML services.
This worker registers all workflows and activities for model training, data fetching, and deployment.
"""

import asyncio
import os
import sys
from pathlib import Path
import modal
from temporalio.client import Client, TLSConfig
from temporalio.worker import Worker

# Create Modal app
app = modal.App("ai-workbench-temporal-worker")

# Resolve absolute path to this file's directory (apps/ml-services)
BASE_DIR = Path(__file__).resolve().parent

# Define the Docker image with the ML services directory mounted into the container at /app
image = (
    modal.Image.from_registry("python:3.12-slim")
    .pip_install_from_requirements(str(BASE_DIR / "requirements.txt"))
    .add_local_dir(
        str(BASE_DIR),
        remote_path="/app",
        ignore=[
            # Python environments and caches
            "venv",
            ".venv",
            "__pycache__",
            "*.pyc",
            "*.pyo",
            "*.pyd",
            ".mypy_cache",
            ".pytest_cache",
            ".pytype",

            # VCS and node
            ".git",
            "node_modules",

            # Data and large artifacts
            "data",
            "datasets",
            "artifacts",
            "checkpoints",
            "models",
            "mlruns",
            "wandb",
            "notebooks",
            "*.ipynb",

            # Builds and logs
            "build",
            "dist",
            "*.log",

            # Local-only files and tests
            "temporal_server.py",
            "test_*.py",
        ],
    )  # Mount only apps/ml-services, excluding heavy/local folders
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
    
    # Change to the mounted directory and ensure Python can import from it
    os.chdir("/app")
    if "/app" not in sys.path:
        sys.path.insert(0, "/app")
    
    print("🚀 Starting Temporal worker on Modal...")
    print("📁 Using mounted directory: /app")
    
    # Debug: verify contents of the mounted directory
    try:
        print("📂 /app contains:", os.listdir("/app"))
        print("📂 /app/workflows exists:", os.path.isdir("/app/workflows"))
    except Exception as e:
        print("⚠️ Could not list /app:", e)

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
    temporal_host = os.getenv("TEMPORAL_HOST", "localhost:7233").strip()
    temporal_namespace = os.getenv("TEMPORAL_NAMESPACE", "default").strip()
    temporal_tls_enabled = os.getenv("TEMPORAL_TLS_ENABLED", "false").lower() in ("1", "true", "yes")
    temporal_api_key = os.getenv("TEMPORAL_API_KEY", "").strip()
    # Optional TLS params for Temporal Cloud (mTLS)
    temporal_tls_client_cert = os.getenv("TEMPORAL_TLS_CLIENT_CERT", "")
    temporal_tls_client_key = os.getenv("TEMPORAL_TLS_CLIENT_KEY", "")
    temporal_tls_server_name = os.getenv("TEMPORAL_TLS_SERVER_NAME", "").strip()
    temporal_tls_server_root_ca = os.getenv("TEMPORAL_TLS_SERVER_ROOT_CA", "")
    
    print(f"   Host: {temporal_host}")
    print(f"   Namespace: {temporal_namespace}")
    print(f"   Task Queue: ml-training-task-queue")
    auth_mode = "api_key" if temporal_api_key else ("mtls" if temporal_tls_enabled else "none")
    print(f"   TLS: {temporal_tls_enabled}")
    print(f"   Auth mode: {auth_mode}")
    
    try:
        # Connect to Temporal
        print(f"🔌 Connecting to Temporal server at {temporal_host}...")
        if temporal_api_key:
            # Temporal Cloud API key auth (TLS required, certs not needed)
            client = await Client.connect(
                temporal_host,
                namespace=temporal_namespace,
                api_key=temporal_api_key,
                tls=True,
            )
        else:
            tls_config = None
            if temporal_tls_enabled:
                # Build TLS config for Temporal Cloud mTLS
                client_cert_bytes = temporal_tls_client_cert.encode("utf-8") if temporal_tls_client_cert else None
                client_key_bytes = temporal_tls_client_key.encode("utf-8") if temporal_tls_client_key else None
                root_ca_bytes = temporal_tls_server_root_ca.encode("utf-8") if temporal_tls_server_root_ca else None
                # Derive server name from host if not explicitly provided
                derived_server_name = temporal_host.split(":", 1)[0]
                server_name = temporal_tls_server_name or derived_server_name
                tls_config = TLSConfig(
                    client_cert=client_cert_bytes,
                    client_private_key=client_key_bytes,
                    server_name=server_name,
                    server_root_ca_cert=root_ca_bytes,
                )
            client = await Client.connect(
                temporal_host,
                namespace=temporal_namespace,
                tls=tls_config,
            )
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
