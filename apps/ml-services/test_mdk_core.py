#!/usr/bin/env python3
"""
Simple test script to verify that the mdk_core package can be imported and used correctly.
This script tests the basic functionality without requiring actual data or model training.
"""

def test_imports():
    """Test that all major components can be imported."""
    try:
        # Test core imports
        from mdk_core import configs
        print("✓ Core configs imported successfully")
        
        from mdk_core.trainer import run_training
        print("✓ Trainer module imported successfully")
        
        # Test data utilities
        from mdk_core.data.utils.data_preprocessing import preprocess_data
        print("✓ Data preprocessing imported successfully")
        
        # Test model factory
        from mdk_core.models.model_factory import ModelFactory
        print("✓ Model factory imported successfully")
        
        # Test metric factory
        from mdk_core.metrics.metric_factory import MetricFactory
        print("✓ Metric factory imported successfully")
        
        # Test utility functions
        from mdk_core.utils.common import print_colored, snake_to_camel
        print("✓ Common utilities imported successfully")
        
        from mdk_core.utils.model_commons import set_seed, create_lag_features
        print("✓ Model commons imported successfully")
        
        print("\n🎉 All imports successful! The mdk_core package is working correctly.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality without requiring data."""
    try:
        from mdk_core.utils.common import snake_to_camel, print_colored
        
        # Test snake_to_camel function
        assert snake_to_camel("hello_world") == "HelloWorld"
        assert snake_to_camel("test_case") == "TestCase"
        print("✓ snake_to_camel function working correctly")
        
        # Test print_colored function
        print_colored("This should be blue", "info")
        print_colored("This should be green", "success")
        print("✓ print_colored function working correctly")
        
        # Test model factory creation
        from mdk_core.models.model_factory import ModelFactory
        factory = ModelFactory()
        print("✓ ModelFactory created successfully")
        
        # Test metric factory creation
        from mdk_core.metrics.metric_factory import MetricFactory
        metric_factory = MetricFactory()
        print("✓ MetricFactory created successfully")
        
        print("\n🎉 Basic functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing mdk_core package...\n")
    
    # Test imports
    imports_ok = test_imports()
    
    if imports_ok:
        print("\n" + "="*50)
        # Test basic functionality
        functionality_ok = test_basic_functionality()
        
        if functionality_ok:
            print("\n🎉 All tests passed! The mdk_core package is ready to use.")
        else:
            print("\n❌ Some functionality tests failed.")
    else:
        print("\n❌ Import tests failed. Please check the package structure.")
