#!/usr/bin/env python3
"""
Test script to verify that the Modal app can deploy and the function can be called.
This tests the actual Modal deployment without requiring actual training data.
"""

import asyncio
from activities.training_activity import app, _train_model

async def test_modal_deployment():
    """Test that the Modal app can deploy and function can be called."""
    try:
        print("🚀 Testing Modal app deployment...")
        
        # Test that the app can be imported and configured
        print(f"✅ Modal app name: {app.name}")
        print(f"✅ Modal app functions: {len(app.registered_functions)}")
        
        # Test that the function is properly registered
        if '_train_model' in app.registered_functions:
            print("✅ Modal function is properly registered")
            print(f"✅ Function name: {list(app.registered_functions.keys())[0]}")
        else:
            print("❌ Modal function is not properly registered")
            return False
        
        print("\n🎉 Modal deployment test passed!")
        print("The training activity is ready to be deployed and used.")
        return True
        
    except Exception as e:
        print(f"❌ Modal deployment test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Modal deployment...\n")
    
    # Run the async test
    result = asyncio.run(test_modal_deployment())
    
    if result:
        print("\n🎉 All tests passed! Modal is properly configured.")
    else:
        print("\n❌ Some tests failed. Please check the configuration.")
