/**
 * @description
 * This file implements the main server page for the "Projects" section of the dashboard.
 * It is responsible for orchestrating the data fetching process for the projects list
 * and managing the loading state using React Suspense.
 *
 * Key features:
 * - Server Component: All data fetching occurs on the server, improving performance and security.
 * - Suspense for Loading: Implements a `<Suspense>` boundary to show a skeleton loader
 *   while the project data is being fetched, preventing a blank screen and improving perceived performance.
 * - Component Composition: It composes the `PageHeader` for the title and action button,
 *   and a dedicated `ProjectsFetcher` component to encapsulate the data fetching logic.
 *
 * @dependencies
 * - `react`: For `Suspense`.
 * - `./_components/page-header`: The header component for the page title and "Create Project" button.
 * - `./_components/projects-skeleton`: The skeleton loader component for the Suspense fallback.
 * - `./_components/projects-list`: The client component that will render the list of projects (to be created).
 * - `@/actions/db/projects-actions`: The server action used to fetch project data.
 *
 * @notes
 * - This pattern of a main page component orchestrating a separate async data-fetching
 *   component inside a Suspense boundary is a core architectural pattern for this application.
 */

import { Suspense } from "react";
import { getProjectsAction } from "@/actions/db/projects-actions";
import { PageHeader } from "./_components/page-header";
import { ProjectsListWithStats } from "./_components/projects-list-with-stats";
import { ProjectsSkeleton } from "./_components/projects-skeleton";

/**
 * An asynchronous component responsible for fetching the project data.
 * This component is rendered within the Suspense boundary.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the `ProjectsList` component
 * populated with the fetched data.
 */
async function ProjectsFetcher() {
  const { data: projects, message } = await getProjectsAction();

  // Although getProjectsAction has its own error handling, we can add another layer here if needed.
  if (!projects) {
    // This could render an error component instead of just a paragraph.
    return <p className="text-red-500">{message}</p>;
  }

  // Pass the fetched projects to the client component for rendering and interaction.
  return <ProjectsListWithStats initialProjects={projects} />;
}

/**
 * The main component for the Projects page.
 * It sets up the page layout and wraps the data-dependent part in a Suspense boundary.
 *
 * @returns {JSX.Element} The rendered projects page.
 */
export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsFetcher />
      </Suspense>
    </div>
  );
}
