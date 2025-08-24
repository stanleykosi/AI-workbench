"""
Configuration module for Modal inference endpoint settings.
Handles environment variables with sensible defaults.
"""

import os
from typing import Optional


class ModalConfig:
    """Configuration class for Modal inference endpoint settings."""
    
    def __init__(self):
        # Base warm time in seconds (default: 15 minutes)
        self.base_warm_time = int(os.getenv("MODAL_BASE_WARM_TIME", "900"))
        
        # Extension time in seconds when there's recent activity (default: 15 minutes)
        self.extension_time = int(os.getenv("MODAL_EXTENSION_TIME", "900"))
        
        # Maximum number of concurrent containers
        self.max_containers = int(os.getenv("MODAL_MAX_CONTAINERS", "10"))
        
        # Activity tracking window in seconds (default: 5 minutes)
        self.activity_window = int(os.getenv("MODAL_ACTIVITY_WINDOW", "300"))
    
    def get_scaledown_window(self, has_recent_activity: bool = False) -> int:
        """
        Get the scaledown window based on recent activity.
        
        Args:
            has_recent_activity: Whether there's been recent activity
            
        Returns:
            Scaledown window in seconds
        """
        if has_recent_activity:
            return self.base_warm_time + self.extension_time
        return self.base_warm_time
    
    def __repr__(self) -> str:
        return (
            f"ModalConfig("
            f"base_warm_time={self.base_warm_time}s, "
            f"extension_time={self.extension_time}s, "
            f"max_containers={self.max_containers}, "
            f"activity_window={self.activity_window}s"
            f")"
        )


# Global configuration instance
modal_config = ModalConfig()
