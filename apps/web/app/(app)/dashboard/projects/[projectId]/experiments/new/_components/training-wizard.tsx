/**
 * @description
 * This client component implements the multi-step guided model training wizard.
 * It manages the user's journey through selecting a dataset, choosing a model,
 * configuring parameters, and starting the training workflow.
 *
 * Key features:
 * - State Management: Uses `useState` to manage the current step of the wizard
 *   and the user's selections (dataset, model, configuration).
 * - Dynamic Forms: Renders model-specific configuration fields dynamically based
 *   on the `AVAILABLE_MODELS` configuration.
 * - Server Action Integration: Calls the `startTrainingAction` to initiate the
 *   backend training workflow via Temporal.
 * - User Feedback: Provides clear feedback on the training initiation process
 *   using `toast` notifications and redirects the user upon success.
 * - Professional UI: Enterprise-grade styling with consistent design system.
 *
 * @dependencies
 * - `react`: For state management hooks.
 * - `next/navigation`: For `useRouter` to handle redirection.
 * - `sonner`: For displaying toast notifications.
 * - `@/db/schema`: For the `SelectDataset` TypeScript type.
 * - `@/actions/workflow/training-actions`: The server action to start the training.
 * - `@/components/ui/*`: Various shadcn/ui components for building the form.
 * - `./model-configs`: The centralized model configuration definitions.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { startTrainingAction } from "@/actions/workflow/training-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { type SelectDataset } from "@/db/schema";
import { AVAILABLE_MODELS, type ModelConfig } from "./model-configs";

interface TrainingWizardProps {
  projectId: string;
  datasets: SelectDataset[];
}

export function TrainingWizard({ projectId, datasets }: TrainingWizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [selectedDatasetId, setSelectedDatasetId] = React.useState<
    string | null
  >(null);
  const [selectedModelName, setSelectedModelName] = React.useState<string | null>(
    null,
  );
  const [modelConfig, setModelConfig] = React.useState<Record<string, any>>({});

  const selectedModel = React.useMemo(
    () => AVAILABLE_MODELS.find((m) => m.name === selectedModelName),
    [selectedModelName],
  );

  const handleNextStep = () => {
    if (step === 1 && !selectedDatasetId) {
      toast.warning("Please select a dataset.");
      return;
    }
    if (step === 2 && !selectedModelName) {
      toast.warning("Please select a model.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => setStep((prev) => prev - 1);

  const handleModelConfigChange = (name: string, value: any) => {
    setModelConfig((prev) => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    if (selectedModel) {
      const defaultConfig = selectedModel.parameters.reduce(
        (acc, param) => {
          acc[param.name] = param.defaultValue;
          return acc;
        },
        {} as Record<string, any>,
      );
      setModelConfig(defaultConfig);
    }
  }, [selectedModel]);

  const handleSubmit = async () => {
    if (!selectedDatasetId || !selectedModelName) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await startTrainingAction({
        projectId,
        datasetId: selectedDatasetId,
        modelConfig: {
          modelName: selectedModelName,
          ...modelConfig,
        },
      });

      if (result.isSuccess) {
        toast.success("Training started successfully!");
        router.push(`/dashboard/projects/${projectId}/experiments`);
      } else {
        toast.error(result.message || "Failed to start training.");
      }
    } catch (error) {
      console.error("Training error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-gray-200 shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <CardTitle className="text-2xl font-bold text-gray-900">Model Training Wizard</CardTitle>
        <CardDescription className="text-gray-600 text-base">
          Step {step} of 4: {getStepTitle(step)}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        {/* Step 1: Dataset Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-900">Select Dataset</Label>
              <p className="text-gray-600">
                Choose the dataset you want to use for training your model.
              </p>
            </div>
            <div className="grid gap-4">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedDatasetId === dataset.id
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  onClick={() => setSelectedDatasetId(dataset.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                      <p className="text-sm text-gray-600">
                        Uploaded on {new Date(dataset.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedDatasetId === dataset.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Model Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-900">Select Model</Label>
              <p className="text-gray-600">
                Choose the machine learning model you want to train.
              </p>
            </div>
            <div className="grid gap-4">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.name}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedModelName === model.name
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  onClick={() => setSelectedModelName(model.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{model.displayName}</h3>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </div>
                    {selectedModelName === model.name && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Parameter Configuration */}
        {step === 3 && selectedModel && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-900">Configure Parameters</Label>
              <p className="text-gray-600">
                Customize the parameters for your {selectedModel.displayName} model.
              </p>
            </div>
            <div className="grid gap-6">
              {selectedModel.parameters.map((param) => (
                <div key={param.name} className="space-y-3">
                  <Label htmlFor={param.name} className="text-sm font-medium text-gray-700">
                    {param.label}
                  </Label>
                  {param.type === "select" ? (
                    <Select
                      value={String(modelConfig[param.name] ?? param.defaultValue)}
                      onValueChange={(value) => handleModelConfigChange(param.name, value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder={param.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={param.name}
                      type={param.type === "number" ? "number" : "text"}
                      value={modelConfig[param.name] ?? param.defaultValue}
                      onChange={(e) => handleModelConfigChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                  <p className="text-xs text-gray-500">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review and Start */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-900">Review Configuration</Label>
              <p className="text-gray-600">
                Review your selections before starting the training process.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Dataset</Label>
                  <p className="text-gray-900">
                    {datasets.find(d => d.id === selectedDatasetId)?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Model</Label>
                  <p className="text-gray-900">{selectedModel?.displayName}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-gray-600">Parameters</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(modelConfig).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-6">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 1}
          className="border-gray-300 hover:bg-gray-50"
        >
          Previous
        </Button>
        {step < 4 ? (
          <Button
            onClick={handleNextStep}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Starting Training...
              </>
            ) : (
              "Start Training"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "Select Dataset";
    case 2:
      return "Select Model";
    case 3:
      return "Configure Parameters";
    case 4:
      return "Review and Start";
    default:
      return "";
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 1:
      return "Choose the dataset you want to use for training.";
    case 2:
      return "Select the machine learning model type.";
    case 3:
      return "Configure the model parameters.";
    case 4:
      return "Review your configuration and start training.";
    default:
      return "";
  }
}
