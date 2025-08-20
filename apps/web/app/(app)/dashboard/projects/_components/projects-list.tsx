/**
 * @description
 * This client component is responsible for rendering the list of projects.
 * It receives the initial project data from a server component and displays it
 * in a responsive grid layout. It also handles the empty state when no projects
 * are available.
 *
 * Key features:
 * - Client-Side Rendering: Renders the UI on the client, allowing for future client-side
 *   interactions like sorting or filtering (though currently just displays static props).
 * - Prop-based Data: Receives the initial list of projects fetched on the server, ensuring
 *   a fast initial page load without client-side data fetching.
 * - Interactive Cards: Each project is displayed as a clickable card that navigates
 *   to the detailed project page.
 * - Empty State: Provides a clear and helpful message when the user has no projects.
 *
 * @dependencies
 * - `next/link`: For client-side navigation to individual project pages.
 * - `@/db/schema`: For the `SelectProject` type definition.
 * - `@/components/ui/card`: Provides the styled card component for each project.
 *
 * @notes
 * - The component is architected to be "dumb" in that it only renders the data it's given.
 *   The data fetching logic is handled by a parent server component (`ProjectsPage`).
 */
"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type SelectProject } from "@/db/schema";

interface ProjectsListProps {
  initialProjects: SelectProject[];
}

/**
 * Renders a list of projects or an empty state message if no projects exist.
 *
 * @param {ProjectsListProps} props - The component props.
 * @returns {JSX.Element} The rendered project list or empty state.
 */
export function ProjectsList({ initialProjects }: ProjectsListProps) {
  // If there are no projects, display a helpful empty state message.
  if (initialProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">
          No projects found
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first project.
        </p>
      </div>
    );
  }

  // Render a grid of project cards.
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initialProjects.map((project) => (
        <Link
          href={`/dashboard/projects/${project.id}`}
          key={project.id}
          className="block"
        >
          <Card className="transition-all hover:shadow-md hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="truncate">{project.name}</CardTitle>
              <CardDescription>
                Created on:{" "}
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
