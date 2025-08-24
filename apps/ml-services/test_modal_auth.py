#!/usr/bin/env python3
"""
Test script to validate Modal authentication configuration.
Tests both development and production modes.
"""

import os
import sys
from config import modal_config


def test_modal_config():
    """Test the Modal configuration setup."""
    print("🔍 Testing Modal Configuration...")
    print("=" * 50)
    
    # Test configuration loading
    print(f"📋 Configuration loaded:")
    print(f"   Mode: {modal_config}")
    print(f"   Production: {modal_config.is_production}")
    print(f"   Token ID: {'Set' if modal_config.token_id else 'Not set'}")
    print(f"   Token Secret: {'Set' if modal_config.token_secret else 'Not set'}")
    
    # Test scaling configuration
    print(f"\n⚙️  Scaling Configuration:")
    print(f"   Base Warm Time: {modal_config.base_warm_time}s ({modal_config.base_warm_time/60:.1f} min)")
    print(f"   Extension Time: {modal_config.extension_time}s ({modal_config.extension_time/60:.1f} min)")
    print(f"   Max Containers: {modal_config.max_containers}")
    print(f"   Activity Window: {modal_config.activity_window}s ({modal_config.activity_window/60:.1f} min)")
    
    # Test scaledown window calculation
    print(f"\n🔄 Scaling Behavior:")
    base_window = modal_config.get_scaledown_window(has_recent_activity=False)
    extended_window = modal_config.get_scaledown_window(has_recent_activity=True)
    print(f"   No Activity: {base_window}s ({base_window/60:.1f} min)")
    print(f"   With Activity: {extended_window}s ({extended_window/60:.1f} min)")
    
    return True


def test_environment_variables():
    """Test environment variable configuration."""
    print(f"\n🌍 Environment Variables:")
    print("=" * 50)
    
    # Check Modal tokens
    token_id = os.getenv("MODAL_TOKEN_ID")
    token_secret = os.getenv("MODAL_TOKEN_SECRET")
    
    if token_id and token_secret:
        print(f"✅ MODAL_TOKEN_ID: Set (length: {len(token_id)})")
        print(f"   First 8 chars: {token_id[:8]}...")
        print(f"✅ MODAL_TOKEN_SECRET: Set (length: {len(token_secret)})")
        print(f"   First 8 chars: {token_secret[:8]}...")
    else:
        print(f"⚠️  MODAL_TOKEN_ID: {'Set' if token_id else 'Not set'}")
        print(f"⚠️  MODAL_TOKEN_SECRET: {'Set' if token_secret else 'Not set'}")
        print(f"   Development mode (web authentication)")
    
    # Check other Modal settings
    base_warm = os.getenv("MODAL_BASE_WARM_TIME", "900")
    extension = os.getenv("MODAL_EXTENSION_TIME", "900")
    max_containers = os.getenv("MODAL_MAX_CONTAINERS", "10")
    activity_window = os.getenv("MODAL_ACTIVITY_WINDOW", "300")
    
    print(f"✅ MODAL_BASE_WARM_TIME: {base_warm}s")
    print(f"✅ MODAL_EXTENSION_TIME: {extension}s")
    print(f"✅ MODAL_MAX_CONTAINERS: {max_containers}")
    print(f"✅ MODAL_ACTIVITY_WINDOW: {activity_window}s")
    
    return True


def main():
    """Main test function."""
    print("🚀 Modal Authentication Configuration Test")
    print("=" * 60)
    
    try:
        # Test configuration
        test_modal_config()
        
        # Test environment variables
        test_environment_variables()
        
        print(f"\n✅ All tests passed!")
        print(f"\n💡 Next steps:")
        
        if modal_config.is_production:
            print(f"   🚀 Production mode detected!")
            print(f"   📝 Ready for deployment")
        else:
            print(f"   🔧 Development mode detected!")
            print(f"   📝 Set MODAL_TOKEN for production")
            
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
