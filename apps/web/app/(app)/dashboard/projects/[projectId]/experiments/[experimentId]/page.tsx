/**
 * @description
 * This file implements the server page for displaying the details of a single experiment.
 * It fetches the experiment's data and presents it in a structured format. Critically,
 * it provides the "Deploy" action for successfully completed experiments.
 *
 * Key features:
 * - Server-Side Data Fetching: Securely fetches a single experiment's details
 *   using `getExperimentByIdAction`.
 * - Detailed View: Displays key information about the experiment, such as its
 *   status, model configuration, and creation date.
 * - Conditional Actions: The "Deploy" button is only rendered if the experiment's
 *   status is 'completed', ensuring a correct user workflow.
 * - Error Handling: Uses `notFound()` if the experiment doesn't exist or the user
 *   is not authorized to view it.
 *
 * @dependencies
 * - `next/link`: For the "Back to Experiments" link.
 * - `next/navigation`: For `notFound`.
 * - `lucide-react`: For icons.
 * - `@/actions/db/experiments-actions`: The server action to fetch experiment data.
 * - `@/components/ui/*`: Various shadcn/ui components for layout.
 * - `./_components/deploy-button`: The client component that handles the deployment action.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Settings, FileCode, Database } from "lucide-react";

import { getExperimentByIdAction } from "@/actions/db/experiments-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DeployButton } from "./_components/deploy-button";

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'running':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default async function ExperimentDetailsPage({
  params,
}: {
  params: { projectId: string; experimentId: string };
}) {
  const { projectId, experimentId } = params;
  const { data: experiment, isSuccess } =
    await getExperimentByIdAction(experimentId);

  if (!isSuccess || !experiment) {
    notFound();
  }

  const modelName = (experiment.modelConfig as any)?.modelName ?? "N/A";

  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <Link
          href={`/dashboard/projects/${projectId}/experiments`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiments
        </Link>
      </div>

      {/* Main content */}
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        {/* Title and deploy button */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{modelName}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Experiment Details and Configuration
            </p>
          </div>
          {experiment.status === "completed" && (
            <div className="animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-300">
              <DeployButton
                experimentId={experiment.id}
                projectId={experiment.projectId}
              />
            </div>
          )}
        </div>

        {/* Status and metadata card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Experiment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge className={`${getStatusColor(experiment.status)} font-medium`}>
                    {experiment.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(experiment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Time: {new Date(experiment.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model configuration card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCode className="h-5 w-5 text-gray-600" />
              Model Configuration
            </CardTitle>
            <CardDescription>
              Training parameters and model settings for this experiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(experiment.modelConfig, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Model artifact card - only show if exists */}
        {experiment.modelArtifactS3Key && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-600" />
                Model Artifact
              </CardTitle>
              <CardDescription>
                S3 location of the trained model files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <code className="text-sm text-gray-800 break-all font-mono">
                  {experiment.modelArtifactS3Key}
                </code>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
