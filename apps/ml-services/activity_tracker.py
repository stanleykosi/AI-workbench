"""
Activity tracking system for Modal inference endpoints.
Tracks recent activity to determine optimal scaling behavior.
"""

import time
from collections import defaultdict
from typing import Dict, Set
from config import modal_config


class ActivityTracker:
    """
    Tracks recent activity for inference endpoints to optimize scaling.
    """
    
    def __init__(self):
        self._activity_timestamps: Dict[str, float] = {}
        self._recent_requests: Set[str] = set()
        self._last_cleanup = time.time()
    
    def record_activity(self, experiment_id: str) -> None:
        """
        Record activity for a specific experiment.
        
        Args:
            experiment_id: The experiment ID that received a request
        """
        current_time = time.time()
        self._activity_timestamps[experiment_id] = current_time
        self._recent_requests.add(experiment_id)
        
        # Clean up old entries periodically
        if current_time - self._last_cleanup > modal_config.activity_window:
            self._cleanup_old_entries()
    
    def has_recent_activity(self, experiment_id: str = None) -> bool:
        """
        Check if there's been recent activity.
        
        Args:
            experiment_id: Specific experiment to check, or None for any activity
            
        Returns:
            True if there's recent activity, False otherwise
        """
        current_time = time.time()
        
        if experiment_id:
            # Check specific experiment
            if experiment_id in self._activity_timestamps:
                return (current_time - self._activity_timestamps[experiment_id]) < modal_config.activity_window
            return False
        else:
            # Check any recent activity
            return any(
                (current_time - timestamp) < modal_config.activity_window
                for timestamp in self._activity_timestamps.values()
            )
    
    def get_active_experiments(self) -> Set[str]:
        """
        Get set of experiments with recent activity.
        
        Returns:
            Set of experiment IDs with recent activity
        """
        current_time = time.time()
        active = set()
        
        for exp_id, timestamp in self._activity_timestamps.items():
            if (current_time - timestamp) < modal_config.activity_window:
                active.add(exp_id)
        
        return active
    
    def _cleanup_old_entries(self) -> None:
        """Remove old activity entries to prevent memory leaks."""
        current_time = time.time()
        cutoff_time = current_time - modal_config.activity_window
        
        # Remove old timestamps
        expired_experiments = [
            exp_id for exp_id, timestamp in self._activity_timestamps.items()
            if timestamp < cutoff_time
        ]
        
        for exp_id in expired_experiments:
            del self._activity_timestamps[exp_id]
            self._recent_requests.discard(exp_id)
        
        self._last_cleanup = current_time
    
    def get_stats(self) -> Dict:
        """
        Get current activity statistics.
        
        Returns:
            Dictionary with activity statistics
        """
        current_time = time.time()
        active_count = len(self.get_active_experiments())
        total_tracked = len(self._activity_timestamps)
        
        return {
            "active_experiments": active_count,
            "total_tracked": total_tracked,
            "last_cleanup": self._last_cleanup,
            "activity_window": modal_config.activity_window,
            "base_warm_time": modal_config.base_warm_time,
            "extension_time": modal_config.extension_time,
        }


# Global activity tracker instance
activity_tracker = ActivityTracker()
