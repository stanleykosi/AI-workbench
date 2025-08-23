/**
 * @description
 * This file implements the main server page for the "Experiments" section of a project.
 * It is responsible for fetching the list of experiments and displaying them, while
 * managing loading states with React Suspense.
 *
 * Key features:
 * - Server Component: Fetches data securely on the server for improved performance.
 * - Data Fetching: Uses `getExperimentsForProjectAction` to retrieve experiment records.
 * - Suspense for Loading: Wraps the data-fetching component in `<Suspense>` to
 *   show a skeleton loader, enhancing the user experience during data loads.
 * - Component Composition: Orchestrates the page header and the `ExperimentsFetcher`
 *   to build the complete page structure.
 *
 * @dependencies
 * - `react`: For `Suspense`.
 * - `next/link`: For the "New Experiment" button link.
 * - `lucide-react`: For the icon on the "New Experiment" button.
 * - `@/components/ui/button`: The shadcn/ui button component.
 * - `@/actions/db/experiments-actions`: The server action for fetching experiments.
 * - `./_components/experiments-list`: The client component to render the list.
 * - `./_components/experiments-skeleton`: The skeleton loader for the fallback UI.
 */
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getExperimentsForProjectAction } from "@/actions/db/experiments-actions";
import { Button } from "@/components/ui/button";
import { ExperimentsList } from "./_components/experiments-list";
import { ExperimentsSkeleton } from "./_components/experiments-skeleton";

/**
 * An asynchronous component that fetches experiment data. It is designed to be
 * rendered within a Suspense boundary.
 *
 * @param {{ projectId: string }} props - The component props.
 * @returns {Promise<JSX.Element>} A promise resolving to the ExperimentsList component.
 */
async function ExperimentsFetcher({ projectId }: { projectId: string }) {
  const { data: experiments, message } =
    await getExperimentsForProjectAction(projectId);

  if (!experiments) {
    return <p className="text-destructive">{message}</p>;
  }

  return <ExperimentsList initialExperiments={experiments} />;
}

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

      <Suspense fallback={<ExperimentsSkeleton />}>
        <ExperimentsFetcher projectId={params.projectId} />
      </Suspense>
    </div>
  );
}


