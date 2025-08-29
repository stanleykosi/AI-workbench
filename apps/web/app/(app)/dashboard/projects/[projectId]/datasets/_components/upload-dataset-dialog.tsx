/**
 * @description
 * This client component provides a complete workflow for uploading a dataset.
 * It manages a dialog (modal) containing a form that allows users to select a CSV file,
 * securely upload it directly to AWS S3, and create a corresponding record in the database.
 *
 * Key features:
 * - Direct S3 Upload: Uses a presigned URL from a server action to upload the file,
 *   avoiding the need for the server to handle the file stream directly.
 * - State Management: Manages UI state for file selection, upload progress, loading,
 *   and completion using React hooks.
 * - User Feedback: Provides real-time feedback through a progress bar and toast
 *   notifications (via `sonner`) for success and error states.
 * - Error Handling: Implements comprehensive error handling for each step of the process,
 *   from presigned URL generation to the final database record creation.
 *
 * @dependencies
 * - `react`: For state management (`useState`, `useRef`).
 * - `next/navigation`: For `useParams` to get the current `projectId`.
 * - `@radix-ui/react-icons`: For UI icons.
 * - `sonner`: For displaying toast notifications.
 * - `@/components/ui/*`: Imports shadcn/ui components for the dialog, form, and progress bar.
 * - `@/actions/s3/s3-actions`: The server action to generate a presigned S3 URL.
 * - `@/actions/db/datasets-actions`: The server action to create the dataset record in the database.
 */
"use client";

import * as React from "react";
import { PlusIcon, UploadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import { createDatasetRecordAction } from "@/actions/db/datasets-actions";
import { createPresignedUploadUrlAction } from "@/actions/s3/s3-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface UploadDatasetDialogProps {
  projectId: string;
  onDatasetUploaded?: () => void;
}

export function UploadDatasetDialog({ projectId, onDatasetUploaded }: UploadDatasetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Resets the component state, typically after an upload or when the dialog is closed.
   */
  const resetState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation for CSV files
      if (file.type !== "text/csv") {
        toast.error("Invalid file type. Please upload a CSV file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  /**
   * Handles the entire file upload workflow when the form is submitted.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.warning("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get a presigned URL from the server action.
      const presignedUrlResult = await createPresignedUploadUrlAction(
        projectId,
        selectedFile.name,
        selectedFile.type,
      );

      if (!presignedUrlResult.isSuccess || !presignedUrlResult.data) {
        throw new Error(presignedUrlResult.message);
      }

      const { url, key } = presignedUrlResult.data;

      // 2. Upload the file directly to S3 using the presigned URL.
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", selectedFile.type);

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = async () => {
          if (xhr.status === 200) {
            // 3. Create the dataset record in our database.
            const dbResult = await createDatasetRecordAction(
              projectId,
              selectedFile.name,
              key,
            );

            if (dbResult.isSuccess) {
              toast.success("Dataset uploaded and saved successfully!");
              resetState();
              setOpen(false); // Close the dialog on success
              onDatasetUploaded?.(); // Call the callback after successful upload
            } else {
              toast.error(`Database error: ${dbResult.message}`);
            }
            resolve();
          } else {
            reject(new Error(`S3 Upload Failed: Status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during S3 upload."));
        };

        xhr.send(selectedFile);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Upload failed: ${errorMessage}`);
      setIsUploading(false);
    }
  };

  // Close handler to reset state when the dialog is dismissed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-200">
          <PlusIcon className="mr-2 h-4 w-4" />
          Upload Dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload a new Dataset</DialogTitle>
          <DialogDescription className="text-gray-600">
            Select a CSV file from your local machine to upload it to this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="dataset-file" className="text-sm font-medium text-gray-700">CSV File</Label>
            <Input
              id="dataset-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isUploading}
              className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Only .csv files are accepted. Maximum file size: 100MB.
            </p>
          </div>

          {isUploading && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Upload Progress</Label>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {uploadProgress}% Complete
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload and Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
