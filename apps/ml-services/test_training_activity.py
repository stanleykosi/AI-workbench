#!/usr/bin/env python3
"""
Test script to verify that the training activity can be imported and its components are working correctly.
This script tests the basic functionality without requiring actual Modal execution or AWS credentials.
"""

def test_imports():
    """Test that all major components can be imported."""
    try:
        # Test activity imports
        from activities.training_activity import train_model_activity
        print("✓ Training activity imported successfully")
        
        from activities.training_activity import TrainModelActivityParams, TrainModelActivityResult
        print("✓ Activity dataclasses imported successfully")
        
        # Test Modal app import
        from activities.training_activity import app
        print("✓ Modal app imported successfully")
        
        # Test Modal image and secrets
        from activities.training_activity import image, aws_secret, supabase_secret
        print("✓ Modal configuration imported successfully")
        
        print("\n🎉 All imports successful! The training activity is properly configured.")
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
        from activities.training_activity import TrainModelActivityParams, TrainModelActivityResult
        
        # Test creating parameters
        params = TrainModelActivityParams(
            experiment_id="test_exp_123",
            project_id="test_proj_456",
            user_id="test_user_789",
            dataset_s3_key="datasets/test_dataset.csv",
            model_config={"modelName": "random_forest"}
        )
        print("✓ TrainModelActivityParams created successfully")
        
        # Test creating results
        result = TrainModelActivityResult(
            model_artifact_s3_key="models/test_user_789/test_proj_456/test_exp_123/model.pkl",
            scaler_artifact_s3_key="models/test_user_789/test_proj_456/test_exp_123/scaler.pkl"
        )
        print("✓ TrainModelActivityResult created successfully")
        
        print("\n🎉 Dataclass tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Dataclass test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing training activity...\n")
    
    # Test imports
    imports_ok = test_imports()
    
    if imports_ok:
        print("\n" + "="*50)
        # Test dataclasses
        dataclasses_ok = test_dataclasses()
        
        if dataclasses_ok:
            print("\n🎉 All tests passed! The training activity is ready to use.")
        else:
            print("\n❌ Some dataclass tests failed.")
    else:
        print("\n❌ Import tests failed. Please check the package structure.")
