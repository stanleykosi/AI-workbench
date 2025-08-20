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

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type SelectDataset } from "@/db/schema";

interface DatasetListProps {
  initialDatasets: SelectDataset[];
}

/**
 * Renders a list of dataset cards or an empty state message.
 *
 * @param {DatasetListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of datasets.
 */
export function DatasetList({ initialDatasets }: DatasetListProps) {
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initialDatasets.map((dataset) => (
        <Card key={dataset.id}>
          <CardHeader>
            <CardTitle className="truncate">{dataset.name}</CardTitle>
            <CardDescription>
              Uploaded on:{" "}
              {new Date(dataset.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
