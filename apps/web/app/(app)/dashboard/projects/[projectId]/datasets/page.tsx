/**
 * @description
 * This file implements the main server page for the "Datasets" section of a project.
 * It is responsible for fetching the list of datasets for the given project and
 * managing the loading state with React Suspense.
 *
 * Key features:
 * - Server Component: Fetches data securely on the server.
 * - Data Fetching: Uses `getDatasetsForProjectAction` to retrieve dataset records.
 * - Suspense for Loading: Wraps the data-fetching component in `<Suspense>` to
 *   show a skeleton loader, improving the user experience.
 * - Component Composition: Orchestrates the `PageHeader` and the `DatasetsFetcher`
 *   component to build the page structure.
 *
 * @dependencies
 * - `react`: For `Suspense`.
 * - `@/actions/db/datasets-actions`: The server action for fetching datasets.
 * - `./_components/page-header`: The header for the datasets page.
 * - `./_components/dataset-list`: The client component to render the list.
 * - `./_components/datasets-skeleton`: The skeleton loader for the fallback UI.
 */
import { Suspense } from "react";
import { getDatasetsForProjectAction } from "@/actions/db/datasets-actions";
import { DatasetsClient } from "./_components/datasets-client";
import { DatasetsSkeleton } from "./_components/datasets-skeleton";

/**
 * An asynchronous component that fetches and prepares dataset data.
 * It's designed to be rendered within a Suspense boundary.
 *
 * @param {{ projectId: string }} props - The component props.
 * @returns {Promise<JSX.Element>} A promise resolving to the DatasetList component.
 */
async function DatasetsFetcher({ projectId }: { projectId: string }) {
  const { data: datasets, message } = await getDatasetsForProjectAction(projectId);
  if (!datasets) {
    return <p className="text-destructive">{message}</p>;
  }
  return <DatasetsClient initialDatasets={datasets} projectId={projectId} />;
}

/**
 * The main server page component for managing datasets within a project.
 *
 * @param {{ params: { projectId: string } }} props - The component props, including URL params.
 * @returns {JSX.Element} The rendered datasets page.
 */
export default function DatasetsPage({ params }: { params: { projectId: string } }) {
  return (
    <Suspense fallback={<DatasetsSkeleton />}>
      <DatasetsFetcher projectId={params.projectId} />
    </Suspense>
  );
}
