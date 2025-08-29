"use client";

import { useState, useEffect, useCallback } from "react";
import { getDatasetsForProjectAction } from "@/actions/db/datasets-actions";
import { DatasetList } from "./dataset-list";
import { FetchTiingoDialog } from "./fetch-tiingo-dialog";
import { toast } from "sonner";
import { type SelectDataset } from "@/db/schema";
import { UploadDatasetDialog } from "./upload-dataset-dialog";

interface DatasetsClientProps {
  projectId: string;
  initialDatasets: SelectDataset[];
}

export function DatasetsClient({ projectId, initialDatasets }: DatasetsClientProps) {
  const [datasets, setDatasets] = useState<SelectDataset[]>(initialDatasets);

  const refreshDatasets = useCallback(async (showToast = false) => {
    try {
      const { data: newDatasets, message } = await getDatasetsForProjectAction(projectId);
      if (newDatasets) {
        // Only update if the data actually changed
        if (JSON.stringify(newDatasets) !== JSON.stringify(datasets)) {
          setDatasets(newDatasets);
          if (showToast) {
            toast.success("📊 Datasets updated");
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh datasets:", error);
      if (showToast) {
        toast.error("Failed to refresh datasets");
      }
    }
  }, [projectId, datasets]);

  // Periodic refresh to check for new datasets
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDatasets(false); // Silent refresh
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [refreshDatasets]);

  const handleDatasetFetched = () => {
    // Refresh datasets after successful fetch with toast
    refreshDatasets(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground">
            Manage your data sources for model training and experimentation.
          </p>
        </div>
        <div className="flex gap-3">
          <UploadDatasetDialog
            projectId={projectId}
            onDatasetUploaded={handleDatasetFetched}
          />
          <FetchTiingoDialog
            projectId={projectId}
            onDatasetFetched={handleDatasetFetched}
          />
        </div>
      </div>

      <DatasetList initialDatasets={datasets} projectId={projectId} />
    </div>
  );
}
