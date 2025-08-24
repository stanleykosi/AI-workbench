/**
 * @description
 * This component provides a skeleton loading state for the deployments list.
 * It is intended to be used as a fallback UI in a React Suspense boundary,
 * giving users a visual indication that data is being loaded.
 *
 * Key features:
 * - Visual Placeholder: Mimics the final table-based layout of the deployment list,
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
 * Renders a skeleton row for the deployments table.
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
        <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
      </TableCell>
    </TableRow>
  );
}

/**
 * Renders a skeleton table to represent the loading state of the deployments list.
 */
export function DeploymentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Endpoint URL</TableHead>
              <TableHead>Created At</TableHead>
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
