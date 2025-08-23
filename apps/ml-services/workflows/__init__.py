"""
This file marks the 'workflows' directory as a Python package.

This allows for the structured import of Temporal workflows defined within this
directory. For example, the Temporal worker will be able to discover and register
workflows like:
`from workflows.training_workflow import TrainModelWorkflow`
"""
