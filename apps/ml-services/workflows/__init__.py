"""
This file marks the 'workflows' directory as a Python package and exports
the workflow definitions for easy discovery by the Temporal worker.

This allows for the structured import of Temporal workflows defined within this
directory.
"""
from .training_workflow import TrainModelWorkflow
from .data_fetching_workflow import FetchDataWorkflow
