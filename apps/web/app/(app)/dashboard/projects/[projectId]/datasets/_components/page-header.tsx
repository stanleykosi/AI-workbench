/**
 * @description
 * This component renders the header for the Datasets page within a project.
 * It includes the page title, a brief description, and the primary action button
 * which triggers the dataset upload dialog.
 *
 * Key features:
 * - Consistency: Provides a standard header structure for the datasets section.
 * - Call to Action: Integrates the `UploadDatasetDialog` component to handle the
 *   file upload workflow.
 *
 * @dependencies
 * - `./upload-dataset-dialog`: The client component that manages the upload modal.
 *
 * @notes
 * - This component now requires a `projectId` to pass to the upload dialog,
 *   ensuring uploads are associated with the correct project.
 */
"use client";

import { UploadDatasetDialog } from "./upload-dataset-dialog";

interface DatasetsPageHeaderProps {
  projectId: string;
}

/**
 * Renders the page header for the Datasets page.
 *
 * @param {DatasetsPageHeaderProps} props - The component props.
 * @returns {JSX.Element} The rendered page header.
 */
export function DatasetsPageHeader({ projectId }: DatasetsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and upload your CSV datasets for model training.
        </p>
      </div>
      <UploadDatasetDialog projectId={projectId} />
    </div>
  );
}
