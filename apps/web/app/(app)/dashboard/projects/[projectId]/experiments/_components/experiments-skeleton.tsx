/**
 * @description
 * This component provides a skeleton loading state for the experiments list.
 * It is intended to be used as a fallback UI in a React Suspense boundary,
 * giving users a visual indication that data is being loaded.
 *
 * Key features:
 * - Visual Placeholder: Mimics the final table-based layout of the experiment list,
 *   preventing layout shift when the real data loads.
 * - CSS Animations: Uses a subtle pulse animation on placeholder elements to
 *   clearly indicate a loading state.
 * - Consistency: Uses the same `Card` and `Table` components as the final list
 *   to ensure visual consistency.
 *
 * @dependencies
 * - @/components/ui/card: Used for the main container card.
 * - @/components/ui/table: Provides the structure for the skeleton table.
 */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Renders a skeleton row for the experiments table.
 * @returns {JSX.Element} The skeleton table row.
 */
function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
      </TableCell>
    </TableRow>
  );
}

/**
 * Renders a skeleton table to represent the loading state of the experiments list.
 *
 * @returns {JSX.Element} A card containing the skeleton table.
 */
export function ExperimentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Experiments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
