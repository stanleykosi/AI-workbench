/**
 * @description
 * This client component is responsible for rendering the list of experiments for a project.
 * It receives an initial list of experiments from a parent server component and displays
 * them in a data table, including a visual status indicator for each run.
 *
 * Key features:
 * - Client-Side Rendering: Manages the display logic on the client.
 * - Data Table Layout: Uses shadcn/ui `Table` components for a structured view.
 * - Dynamic Status Badge: Renders a status badge with an appropriate icon and color
 *   based on the experiment's status (e.g., pending, running, completed, failed).
 * - Empty State UI: Provides a clear message and guides the user to create an
 *   experiment if the list is empty.
 * - Pagination: Shows only 10 experiments at a time with navigation controls.
 * - Professional UI: Enhanced styling for enterprise-grade appearance.
 *
 * @dependencies
 * - `lucide-react`: For status icons (Clock, Loader, CheckCircle, XCircle).
 * - `@/db/schema`: For the `SelectExperiment` TypeScript type.
 * - `@/components/ui/*`: Imports shadcn/ui components like Card, Table, and Badge.
 * - `@/lib/utils`: The `cn` utility for conditional class naming.
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader,
  MoreHorizontal,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { type SelectExperiment } from "@/db/schema";
import { cn } from "@/lib/utils";

interface ExperimentsListProps {
  initialExperiments: SelectExperiment[];
}

const EXPERIMENTS_PER_PAGE = 10;

/**
 * Renders a visual status badge for an experiment.
 * @param {object} props - The component props.
 * @param {string} props.status - The status of the experiment.
 * @returns {JSX.Element} The rendered status badge.
 */
function StatusBadge({
  status,
}: {
  status: "pending" | "running" | "completed" | "failed";
}) {
  const statusConfig = {
    pending: {
      icon: <Clock className="h-3 w-3" />,
      label: "Pending",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    running: {
      icon: <Loader className="h-3 w-3 animate-spin" />,
      label: "Running",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    completed: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    failed: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Failed",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border font-medium", config.className)}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

/**
 * Renders a list of experiments in a table or an empty state message.
 *
 * @param {ExperimentsListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of experiments.
 */
export function ExperimentsList({ initialExperiments }: ExperimentsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (initialExperiments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">
          No experiments found
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Click &quot;New Experiment&quot; to start your first training run.
        </p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(initialExperiments.length / EXPERIMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EXPERIMENTS_PER_PAGE;
  const endIndex = startIndex + EXPERIMENTS_PER_PAGE;
  const currentExperiments = initialExperiments.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50">
        <CardTitle className="text-xl font-semibold text-gray-900">Recent Experiments</CardTitle>
        <CardDescription className="text-gray-600">
          A list of your recent model training runs. Showing {startIndex + 1}-{Math.min(endIndex, initialExperiments.length)} of {initialExperiments.length} experiments.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/30">
              <TableHead className="font-semibold text-gray-700">Model</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Created At</TableHead>
              <TableHead className="font-semibold text-gray-700">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExperiments.map((exp) => (
              <TableRow key={exp.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/projects/${exp.projectId}/experiments/${exp.id}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    {(exp.modelConfig as any)?.modelName ?? "N/A"}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={exp.status} />
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(exp.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" disabled className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/30 px-6 py-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
