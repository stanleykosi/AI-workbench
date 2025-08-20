/**
 * @description
 * This component renders a standardized header for pages within the dashboard.
 * It typically includes the page title and a primary action button, such as a
 * "Create New" button.
 *
 * Key features:
 * - Consistency: Provides a consistent layout for page headers across the application.
 * - Separation of Concerns: Decouples the page layout from the header content.
 * - Action-Oriented: Includes a slot for a primary call-to-action button.
 *
 * @dependencies
 * - ./create-project-dialog: The dialog component for creating a new project (to be created).
 *
 * @notes
 * - This component is designed to be used at the top of main page components within
 *   the dashboard layout.
 */
"use client";

// The CreateProjectDialog will be a client component that handles the dialog state.
// We will create this in the next step. For now, we import a placeholder.
import { CreateProjectDialog } from "./create-project-dialog";

/**
 * Renders the page header for the Projects page.
 *
 * @returns {JSX.Element} The rendered page header.
 */
export function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="mt-1 text-muted-foreground">
          Organize your models and datasets into projects.
        </p>
      </div>
      <CreateProjectDialog />
    </div>
  );
}
