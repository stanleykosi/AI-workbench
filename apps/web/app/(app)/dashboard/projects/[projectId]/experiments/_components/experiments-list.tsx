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
 * - Auto-Refresh: Automatically polls for updates to show real-time status changes.
 *
 * @dependencies
 * - `lucide-react`: For status icons (Clock, Loader, CheckCircle, XCircle).
 * - `@/db/schema`: For the `SelectExperiment` TypeScript type.
 * - `@/components/ui/*`: Imports shadcn/ui components like Card, Table, and Badge.
 * - `@/lib/utils`: The `cn` utility for conditional class naming.
 */
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  Loader,
  MoreHorizontal,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
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
const REFRESH_INTERVAL = 5000; // 5 seconds
const MAX_REFRESH_ATTEMPTS = 60; // 5 minutes max

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
      className={cn("gap-1 border-transparent font-medium", config.className)}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

export function ExperimentsList({ initialExperiments }: ExperimentsListProps) {
  const [experiments, setExperiments] = useState(initialExperiments);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Check if any experiments are still in progress
  const hasActiveExperiments = Array.isArray(experiments) && experiments.some(
    (exp) => exp.status === "pending" || exp.status === "running"
  );

  // Auto-refresh function
  const refreshExperiments = useCallback(async () => {
    if (!hasActiveExperiments || refreshCount >= MAX_REFRESH_ATTEMPTS) {
      return;
    }

    setIsRefreshing(true);
    try {
      // Fetch updated experiments data
      const response = await fetch(`/api/experiments?projectId=${experiments[0]?.projectId}`);
      if (response.ok) {
        const updatedExperiments = await response.json();

        // Ensure we have an array before updating state
        if (Array.isArray(updatedExperiments)) {
          setExperiments(updatedExperiments);

          // Check if any experiments changed status
          const statusChanged = updatedExperiments.some((updated: SelectExperiment, index: number) => {
            return updated.status !== experiments[index]?.status;
          });

          if (statusChanged) {
            console.log("Experiment status updated, refreshing data...");
          }
        } else {
          console.error("API returned non-array data:", updatedExperiments);
        }
      }
    } catch (error) {
      console.error("Failed to refresh experiments:", error);
    } finally {
      setIsRefreshing(false);
      setRefreshCount(prev => prev + 1);
    }
  }, [experiments, hasActiveExperiments, refreshCount]);

  // Set up auto-refresh polling
  useEffect(() => {
    if (!hasActiveExperiments) {
      return;
    }

    const interval = setInterval(refreshExperiments, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshExperiments, hasActiveExperiments]);

  // Manual refresh function
  const handleManualRefresh = () => {
    setRefreshCount(0);
    refreshExperiments();
  };

  // Calculate pagination
  const totalPages = Math.ceil(experiments.length / EXPERIMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EXPERIMENTS_PER_PAGE;
  const endIndex = startIndex + EXPERIMENTS_PER_PAGE;
  const currentExperiments = experiments.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (experiments.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-gray-100 rounded-full mb-4">
            <Loader className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">
            No experiments found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Create your first experiment to start training machine learning models.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Experiments table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Loader className="h-5 w-5 text-blue-600" />
                Recent Experiments
              </CardTitle>
              {hasActiveExperiments && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600 font-medium">Auto-refreshing</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            A list of your recent model training runs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-900">Model</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Created At</TableHead>
                  <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentExperiments.map((experiment) => (
                  <TableRow key={experiment.id} className="border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-900">
                      <Link
                        href={`/dashboard/projects/${experiment.projectId}/experiments/${experiment.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                      >
                        {(experiment.modelConfig as any)?.modelName ?? "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={experiment.status} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(experiment.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, experiments.length)} of {experiments.length} experiments
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
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 w-8 p-0",
                      currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {page}
                  </Button>
                ))}
              </div>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
