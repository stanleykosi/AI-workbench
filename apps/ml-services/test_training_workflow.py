#!/usr/bin/env python3
"""
Test script to verify that the training workflow can be imported and its components are working correctly.
This script tests the basic functionality without requiring a live Temporal worker.
"""

def test_imports():
    """Test that all major components can be imported."""
    try:
        # Test workflow imports
        from workflows.training_workflow import TrainModelWorkflow, TrainModelWorkflowParams
        print("✓ Training workflow and params imported successfully")
        
        # Test activity imports that the workflow depends on
        from activities.training_activity import train_model_activity
        print("✓ Training activity imported successfully")
        
        from activities.db_update_activity import update_experiment_status_activity
        print("✓ DB update activity imported successfully")
        
        print("\n🎉 All imports successful! The training workflow is properly configured.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_dataclasses():
    """Test that the dataclasses can be instantiated."""
    try:
        from workflows.training_workflow import TrainModelWorkflowParams
        
        # Test creating workflow parameters
        params = TrainModelWorkflowParams(
            experiment_id="test_exp_123",
            project_id="test_proj_456",
            user_id="test_user_789",
            dataset_s3_key="datasets/test_dataset.csv",
            model_config={"modelName": "random_forest"}
        )
        print("✓ TrainModelWorkflowParams created successfully")
        
        print("\n🎉 Dataclass tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Dataclass test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing training workflow...\n")
    
    # Test imports
    imports_ok = test_imports()
    
    if imports_ok:
        print("\n" + "="*50)
        # Test dataclasses
        dataclasses_ok = test_dataclasses()
        
        if dataclasses_ok:
            print("\n🎉 All tests passed! The training workflow is ready to use.")
        else:
            print("\n❌ Some dataclass tests failed.")
    else:
        print("\n❌ Import tests failed. Please check the package structure.")
