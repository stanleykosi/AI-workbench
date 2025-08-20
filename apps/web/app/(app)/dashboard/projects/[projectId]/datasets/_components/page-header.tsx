/**
 * @description
 * This component renders the header for the Datasets page within a project.
 * It includes the page title, a brief description, and a primary action button
 * for uploading a new dataset.
 *
 * Key features:
 * - Consistency: Provides a standard header structure for the datasets section.
 * - Call to Action: Includes the main action button for the page.
 *
 * @dependencies
 * - `@/components/ui/button`: The shadcn/ui button component.
 *
 * @notes
 * - The "Upload Dataset" button currently serves as a placeholder. The full
 *   functionality, including the dialog and upload logic, will be implemented
 *   in the next step (Step 17).
 */
"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";

/**
 * Renders the page header for the Datasets page.
 *
 * @returns {JSX.Element} The rendered page header.
 */
export function DatasetsPageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and upload your CSV datasets for model training.
        </p>
      </div>
      {/* Placeholder for the upload dialog, to be implemented in Step 17 */}
      <Button disabled>
        <PlusIcon className="mr-2" />
        Upload Dataset
      </Button>
    </div>
  );
}
