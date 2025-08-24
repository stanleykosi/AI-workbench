/**
 * @description
 * This file implements the main server page for the "Deployments" section of a project.
 * It is responsible for fetching the list of deployed model endpoints and displaying them,
 * while managing loading states with React Suspense.
 *
 * Key features:
 * - Server Component: Fetches data securely on the server for improved performance.
 * - Data Fetching: Uses `getDeploymentsForProjectAction` to retrieve deployment records.
 * - Suspense for Loading: Wraps the data-fetching component in `<Suspense>` to
 *   show a skeleton loader, enhancing the user experience during data loads.
 * - Component Composition: Orchestrates the page header and the `DeploymentsFetcher`
 *   to build the complete page structure.
 *
 * @dependencies
 * - `react`: For `Suspense`.
 * - `@/actions/db/deployments-actions`: The server action for fetching deployments.
 * - `./_components/deployments-list`: The client component to render the list.
 * - `./_components/deployments-skeleton`: The skeleton loader for the fallback UI.
 */
import { Suspense } from "react";
import { getDeploymentsForProjectAction } from "@/actions/db/deployments-actions";
import { DeploymentsList } from "./_components/deployments-list";
import { DeploymentsSkeleton } from "./_components/deployments-skeleton";

/**
 * An asynchronous component that fetches deployment data. It is designed to be
 * rendered within a Suspense boundary.
 *
 * @param {{ projectId: string }} props - The component props.
 * @returns {Promise<JSX.Element>} A promise resolving to the DeploymentsList component.
 */
async function DeploymentsFetcher({ projectId }: { projectId: string }) {
  const { data: deployments, message } =
    await getDeploymentsForProjectAction(projectId);

  if (!deployments) {
    return <p className="text-destructive">{message}</p>;
  }

  return <DeploymentsList initialDeployments={deployments} />;
}

export default function DeploymentsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and monitor your deployed model endpoints.
          </p>
        </div>
      </div>

      <Suspense fallback={<DeploymentsSkeleton />}>
        <DeploymentsFetcher projectId={params.projectId} />
      </Suspense>
    </div>
  );
}
