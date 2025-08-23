/**
 * @description
 * This file centralizes the configuration for all machine learning models
 * available in the AI Workbench frontend. It serves as a TypeScript counterpart
 * to the Python configuration files found in the MDK, enabling the UI to
 * dynamically render form fields for model-specific parameters.
 *
 * Key features:
 * - `ModelParameter`: A type definition for a single configurable parameter.
 * - `ModelConfig`: A type definition for the configuration of a single model.
 * - `AVAILABLE_MODELS`: An array of `ModelConfig` objects, defining all models
 *   that can be selected in the training wizard.
 *
 * @notes
 * - This configuration is essential for the dynamic form generation in the
 *   `TrainingWizard` component.
 * - As new models are added to the MDK and supported by the backend, their
 *   configurations should be added to the `AVAILABLE_MODELS` array here.
 */

// Defines the structure for a single configurable parameter for a model.
export interface ModelParameter {
  name: string;
  label: string;
  type: "number" | "text" | "boolean" | "select";
  defaultValue: string | number | boolean;
  placeholder?: string;
  description: string;
  options?: { value: string; label: string }[]; // For 'select' type
}

// Defines the structure for a single model's configuration.
export interface ModelConfig {
  name: string;
  displayName: string;
  description: string;
  parameters: ModelParameter[];
}

// An array containing the configurations for all available models.
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: "arima",
    displayName: "ARIMA",
    description:
      "Auto-Regressive Integrated Moving Average model for time series forecasting.",
    parameters: [
      {
        name: "p_values",
        label: "P Values (AR order)",
        type: "text",
        defaultValue: "0, 1",
        placeholder: "e.g., 0, 1, 2",
        description:
          "Comma-separated values for the autoregressive order.",
      },
      {
        name: "d_values",
        label: "D Values (Differencing)",
        type: "text",
        defaultValue: "0, 1",
        placeholder: "e.g., 0, 1",
        description:
          "Comma-separated values for the degree of differencing.",
      },
      {
        name: "q_values",
        label: "Q Values (MA order)",
        type: "text",
        defaultValue: "0, 1, 2",
        placeholder: "e.g., 0, 1, 2",
        description:
          "Comma-separated values for the moving average order.",
      },
    ],
  },
  {
    name: "lstm",
    displayName: "LSTM",
    description:
      "Long Short-Term Memory neural network, for capturing long-term dependencies.",
    parameters: [
      {
        name: "learning_rate",
        label: "Learning Rate",
        type: "number",
        defaultValue: 0.0001,
        placeholder: "e.g., 0.001",
        description: "The learning rate for the optimizer.",
      },
      {
        name: "batch_size",
        label: "Batch Size",
        type: "number",
        defaultValue: 32,
        placeholder: "e.g., 32",
        description: "Number of samples per gradient update.",
      },
      {
        name: "epochs",
        label: "Epochs",
        type: "number",
        defaultValue: 100,
        placeholder: "e.g., 100",
        description: "Number of complete passes through the training dataset.",
      },
      {
        name: "time_steps",
        label: "Time Steps",
        type: "number",
        defaultValue: 60,
        placeholder: "e.g., 60",
        description: "Number of time steps for LSTM input sequence.",
      },
    ],
  },
  {
    name: "random_forest",
    displayName: "Random Forest",
    description:
      "Ensemble learning method for regression using multiple decision trees.",
    parameters: [
      {
        name: "n_estimators",
        label: "Number of Estimators",
        type: "number",
        defaultValue: 100,
        placeholder: "e.g., 100",
        description: "The number of trees in the forest.",
      },
      {
        name: "max_depth",
        label: "Max Depth",
        type: "number",
        defaultValue: 10,
        placeholder: "e.g., 10 (or leave blank for None)",
        description:
          "The maximum depth of the tree. Leave blank for no limit.",
      },
    ],
  },
  {
    name: "xgboost",
    displayName: "XGBoost",
    description:
      "Efficient implementation of gradient boosting for regression tasks.",
    parameters: [
      {
        name: "num_boost_round",
        label: "Number of Boosting Rounds",
        type: "number",
        defaultValue: 100,
        placeholder: "e.g., 100",
        description: "Number of boosting rounds to perform.",
      },
      {
        name: "early_stopping_rounds",
        label: "Early Stopping Rounds",
        type: "number",
        defaultValue: 10,
        placeholder: "e.g., 10",
        description:
          "Activates early stopping. Validation metric needs to improve at least once in every X rounds.",
      },
    ],
  },
];


