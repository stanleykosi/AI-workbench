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

import { CheckCircle2 } from "lucide-react";
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
    <TableRow className="border-gray-100">
      <TableCell>
        <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200" />
      </TableCell>
      <TableCell>
        <div className="h-6 w-28 animate-pulse rounded-full bg-gray-200" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-200" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 animate-pulse rounded-md bg-gray-200" />
      </TableCell>
    </TableRow>
  );
}

/**
 * Renders a skeleton table to represent the loading state of the deployments list.
 */
export function DeploymentsSkeleton() {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Active Endpoints
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="font-semibold text-gray-900">Model</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Predict URL</TableHead>
                <TableHead className="font-semibold text-gray-900">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
