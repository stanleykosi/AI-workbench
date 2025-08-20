/**
 * @description
 * This client component is responsible for rendering the list of projects.
 * It receives the initial project data from a server component and will
 * handle any client-side interactions related to the project list.
 *
 * Key features:
 * - Client-Side Interactivity: Will handle user interactions like clicking on a project.
 * - Prop-based Data: Receives initial data fetched on the server, ensuring fast initial load.
 *
 * @dependencies
 * - `@/db/schema`: For the `SelectProject` type.
 *
 * @notes
 * - This is currently a placeholder and will be fully implemented in the next step.
 *   The full implementation will include rendering project cards and handling navigation.
 */
"use client";

import { type SelectProject } from "@/db/schema";

interface ProjectsListProps {
  initialProjects: SelectProject[];
}

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  // The full implementation will render a grid of project cards.
  // For now, it returns a simple message if there are no projects.
  if (initialProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">No projects found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first project.
        </p>
      </div>
    );
  }

  // Placeholder for the project grid to be implemented in the next step.
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Project cards will be rendered here in the next step */}
      {initialProjects.map((project) => (
        <div key={project.id} className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold">{project.name}</h3>
          <p className="text-sm text-muted-foreground">
            Created on: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
