/**
 * @description
 * This file implements the server page for creating a new experiment. It serves
 * as the entry point for the guided model training wizard.
 *
 * Key features:
 * - Server-Side Data Fetching: Fetches the list of available datasets for the
 *   project on the server before rendering the page. This ensures the wizard
 *   is populated with the necessary data from the start.
 * - Component Composition: Renders the main `TrainingWizard` client component,
 *   passing the fetched datasets as props.
 * - Error Handling: Checks if datasets are available and displays an informative
 *   message if none exist, guiding the user to upload a dataset first.
 *
 * @dependencies
 * - `next/link`: For the "Back to Experiments" link.
 * - `lucide-react`: For the arrow icon in the back link.
 * - `@/actions/db/datasets-actions`: Server action to fetch datasets.
 * - `./_components/training-wizard`: The main client component for the wizard UI.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getDatasetsForProjectAction } from "@/actions/db/datasets-actions";
import { getProjectByIdAction } from "@/actions/db/projects-actions";
import { TrainingWizard } from "./_components/training-wizard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewExperimentPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  // Fetch project and datasets concurrently for better performance.
  const [projectResult, datasetsResult] = await Promise.all([
    getProjectByIdAction(projectId),
    getDatasetsForProjectAction(projectId),
  ]);

  // If the project doesn't exist or user lacks access, show a 404 page.
  if (!projectResult.isSuccess || !projectResult.data) {
    notFound();
  }
  const project = projectResult.data;

  // Datasets are required to start a new experiment.
  const datasets = datasetsResult.data ?? [];

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/projects/${projectId}/experiments`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiments
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Experiment</h1>
        <p className="mt-1 text-muted-foreground">
          Create a new training run for project:{" "}
          <span className="font-semibold text-primary">{project.name}</span>
        </p>
      </div>

      {datasets.length > 0 ? (
        <TrainingWizard projectId={projectId} datasets={datasets} />
      ) : (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>No Datasets Found</CardTitle>
            <CardDescription>
              You need to upload at least one dataset before you can start a new
              experiment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/dashboard/projects/${projectId}/datasets`}>
                Go to Datasets
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


