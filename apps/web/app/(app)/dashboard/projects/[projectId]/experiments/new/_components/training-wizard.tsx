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
    if (!projectId || !selectedDatasetId || !selectedModelName) {
      toast.error("Missing required information. Please review all steps.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Starting training workflow...");

    const result = await startTrainingAction({
      projectId,
      datasetId: selectedDatasetId,
      modelConfig: {
        modelName: selectedModelName,
        ...modelConfig,
      },
    });

    setIsSubmitting(false);

    if (result.isSuccess) {
      toast.success("Training workflow started successfully!");
      router.push(`/dashboard/projects/${projectId}/experiments`);
    } else {
      toast.error(`Failed to start training: ${result.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step {step}: {getStepTitle(step)}</CardTitle>
        <CardDescription>{getStepDescription(step)}</CardDescription>
      </CardHeader>
      <Separator />

      <CardContent className="py-6">
        {step === 1 && (
          <div className="space-y-4">
            <Label htmlFor="dataset-select">Select a Dataset</Label>
            <Select
              onValueChange={setSelectedDatasetId}
              defaultValue={selectedDatasetId ?? undefined}
            >
              <SelectTrigger id="dataset-select">
                <SelectValue placeholder="Choose a dataset..." />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label>Select a Model</Label>
            <Select
              onValueChange={setSelectedModelName}
              defaultValue={selectedModelName ?? undefined}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{model.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 3 && selectedModel && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Configure {selectedModel.displayName}
            </h3>
            {selectedModel.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name}>{param.label}</Label>
                <Input
                  id={param.name}
                  name={param.name}
                  type={param.type}
                  value={modelConfig[param.name] ?? ""}
                  onChange={(e) =>
                    handleModelConfigChange(param.name, e.target.value)
                  }
                  placeholder={param.placeholder}
                />
                <p className="text-xs text-muted-foreground">
                  {param.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Configuration</h3>
            <div className="space-y-2 rounded-md border p-4">
              <p>
                <strong>Dataset:</strong>{" "}
                {datasets.find((d) => d.id === selectedDatasetId)?.name ?? "N/A"}
              </p>
              <p>
                <strong>Model:</strong> {selectedModel?.displayName ?? "N/A"}
              </p>
              <Separator className="my-2" />
              <h4 className="font-semibold">Parameters:</h4>
              <ul className="list-disc pl-5 text-sm">
                {Object.entries(modelConfig).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevStep} disabled={step === 1}>
          Previous
        </Button>
        {step < 4 ? (
          <Button onClick={handleNextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : "Start Training"}
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
      return "Choose the machine learning model to train.";
    case 3:
      return "Adjust the hyperparameters for the selected model.";
    case 4:
      return "Review your selections and start the training workflow.";
    default:
      return "";
  }
}
