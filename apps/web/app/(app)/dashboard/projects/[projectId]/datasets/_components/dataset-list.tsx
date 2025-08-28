/**
 * @description
 * This client component is responsible for rendering the list of datasets for a project.
 * It receives an initial list of datasets from a parent server component and handles
 * displaying either the list or an empty state message.
 *
 * Key features:
 * - Client-Side Rendering: Manages the display logic on the client.
 * - Prop-based Data: Takes `initialDatasets` as a prop, making it a "dumb" component
 *   that simply renders the data it's given.
 * - Empty State UI: Provides a clear and user-friendly message when no datasets
 *   have been uploaded, guiding the user on what to do next.
 * - Card-based Layout: Displays each dataset in a `Card` component for a clean,
 *   organized, and consistent look.
 *
 * @dependencies
 * - `@/db/schema`: For the `SelectDataset` TypeScript type.
 * - `@/components/ui/card`: The shadcn/ui component for the display cards.
 *
 * @notes
 * - In the future, this component could be enhanced with client-side filtering,
 *   sorting, or search functionality.
 */
"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DatabaseIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { type SelectDataset } from "@/db/schema";

interface DatasetListProps {
  initialDatasets: SelectDataset[];
  projectId: string;
}

/**
 * Renders a list of dataset cards or an empty state message.
 *
 * @param {DatasetListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of datasets.
 */
export function DatasetList({ initialDatasets, projectId }: DatasetListProps) {
  if (initialDatasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">
          No datasets found
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload your first CSV dataset to begin training a model.
        </p>
      </div>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "tiingo":
        return <ExternalLinkIcon className="h-4 w-4" />;
      case "upload":
        return <FileTextIcon className="h-4 w-4" />;
      default:
        return <DatabaseIcon className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "tiingo":
        return "Tiingo API";
      case "upload":
        return "File Upload";
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initialDatasets.map((dataset) => (
        <Link
          key={dataset.id}
          href={`/dashboard/projects/${projectId}/datasets/${dataset.id}`}
          className="block transition-transform hover:scale-105"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="truncate">{dataset.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(dataset.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(dataset.status)}>
                    {dataset.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getSourceIcon(dataset.source)}
                    {getSourceLabel(dataset.source)}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
