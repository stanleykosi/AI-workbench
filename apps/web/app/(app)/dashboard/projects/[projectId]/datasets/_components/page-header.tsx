/**
 * @description
 * This component renders the header for the Datasets page within a project.
 * It includes the page title, a brief description, and primary action buttons
 * for uploading a local CSV or fetching data from Tiingo.
 *
 * Key features:
 * - Consistency: Provides a standard header structure for the datasets section.
 * - Multiple Actions: Integrates both the `UploadDatasetDialog` and `FetchTiingoDialog`
 *   to offer users comprehensive data source options.
 *
 * @dependencies
 * - `./upload-dataset-dialog`: The client component for the local file upload modal.
 * - `./fetch-tiingo-dialog`: The client component for the Tiingo data fetch modal.
 */
"use client";

import { FetchTiingoDialog } from "./fetch-tiingo-dialog";
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
          Manage your data sources for model training.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <FetchTiingoDialog projectId={projectId} />
        <UploadDatasetDialog projectId={projectId} />
      </div>
    </div>
  );
}
