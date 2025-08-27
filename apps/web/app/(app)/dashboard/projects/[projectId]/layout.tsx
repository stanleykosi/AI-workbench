/**
 * @description
 * This file defines the layout for a single project view. It establishes the
 * navigational structure for all pages related to a specific project, such as
 * datasets, experiments, and deployments.
 *
 * Key features:
 * - Server-Side Data Fetching: Fetches the project details on the server to
 *   validate the project's existence and user access before rendering.
 * - Nested Layout: Creates a two-column layout with a dedicated project sidebar
 *   and a main content area for the child pages.
 * - Error Handling: Uses `notFound()` from Next.js to render a 404 page if the
 *   project doesn't exist or the user lacks permission.
 *
 * @dependencies
 * - `next/navigation`: For `notFound` to handle invalid project access.
 * - `@/actions/db/projects-actions`: The server action to fetch project data.
 * - `./_components/project-sidebar`: The navigation component for project sections.
 *
 * @notes
 * - This layout is applied to all routes under `/dashboard/projects/[projectId]`.
 */
import { notFound } from "next/navigation";
import { getProjectByIdAction } from "@/actions/db/projects-actions";
import { ProjectSidebarWithStats } from "./_components/project-sidebar-with-stats";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { projectId: string };
}>) {
  // Fetch project data on the server to ensure it exists and the user has access.
  const { data: project } = await getProjectByIdAction(params.projectId);

  // If the project is not found or user is unauthorized, render a 404 page.
  if (!project) {
    notFound();
  }

  return (
    <div className="grid h-full items-start gap-6 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <ProjectSidebarWithStats projectId={project.id} projectName={project.name} />
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
