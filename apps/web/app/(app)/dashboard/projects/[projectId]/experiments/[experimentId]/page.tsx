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
import { ArrowLeft } from "lucide-react";

import { getExperimentByIdAction } from "@/actions/db/experiments-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeployButton } from "./_components/deploy-button";

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
      <Link
        href={`/dashboard/projects/${projectId}/experiments`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiments
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{modelName}</CardTitle>
            <CardDescription>Experiment Details</CardDescription>
          </div>
          {experiment.status === "completed" && (
            <DeployButton
              experimentId={experiment.id}
              projectId={experiment.projectId}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Status</h3>
              <p className="text-muted-foreground">{experiment.status}</p>
            </div>
            <div>
              <h3 className="font-semibold">Created At</h3>
              <p className="text-muted-foreground">
                {new Date(experiment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold">Model Configuration</h3>
            <pre className="mt-2 rounded-md bg-secondary p-4 text-sm">
              {JSON.stringify(experiment.modelConfig, null, 2)}
            </pre>
          </div>
          {experiment.modelArtifactS3Key && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold">Model Artifact</h3>
                <p className="text-muted-foreground break-all">
                  {experiment.modelArtifactS3Key}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
