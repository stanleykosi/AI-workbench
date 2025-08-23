/**
 * @description
 * This file implements the main server page for the "Experiments" section of a project.
 * Currently, it serves as a placeholder that provides the main entry point for users
 * to view their experiments and initiate new training runs.
 *
 * Key features:
 * - Provides a clear header with a title and description for the experiments section.
 * - Includes a "New Experiment" button that links to the guided training wizard.
 * - Establishes the foundational page for the experiment tracking feature.
 *
 * @dependencies
 * - `next/link`: For client-side navigation to the new experiment page.
 * - `lucide-react`: For the icon on the "New Experiment" button.
 * - `@/components/ui/button`: The shadcn/ui button component.
 *
 * @notes
 * - The actual list of experiments will be fetched and displayed in a future step.
 *   This page will be updated to include a <Suspense> boundary and data fetching logic.
 */
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExperimentsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="mt-1 text-muted-foreground">
            Track and compare your model training runs.
          </p>
        </div>
        <Button asChild>
          <Link
            href={`/dashboard/projects/${params.projectId}/experiments/new`}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Experiment
          </Link>
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">
          No experiments yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Click &quot;New Experiment&quot; to start your first training run.
        </p>
      </div>
    </div>
  );
}


