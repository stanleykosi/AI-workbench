/**
 * @description
 * This client component is responsible for rendering the list of deployments for a project.
 * It displays the deployments in a data table, including the model name, a visual
 * status indicator, and the unique endpoint URL with a copy button.
 *
 * Key features:
 * - Client-Side Rendering: Manages the display logic on the client.
 * - Data Table Layout: Uses shadcn/ui `Table` components for a structured view.
 * - Dynamic Status Badge: Renders a status badge with an appropriate icon and color
 *   based on the deployment's status (e.g., deploying, active, error).
 * - Copy to Clipboard: Includes a button to easily copy the endpoint URL.
 * - Empty State UI: Provides a clear message to the user if no deployments exist.
 * - Pagination: Shows only 10 deployments per page to improve performance.
 *
 * @dependencies
 * - `react`: For `useState`.
 * - `lucide-react`: For status and action icons.
 * - `sonner`: For toast notifications.
 * - `@/actions/db/deployments-actions`: For the `DeploymentWithExperiment` type.
 * - `@/components/ui/*`: Various shadcn/ui components.
 * - `@/lib/utils`: The `cn` utility for conditional class naming.
 */
"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Loader,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { type DeploymentWithExperiment } from "@/actions/db/deployments-actions";
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
import { cn } from "@/lib/utils";

/**
 * Renders a visual status badge for a deployment.
 */
function StatusBadge({
  status,
}: {
  status: "deploying" | "active" | "inactive" | "error";
}) {
  const statusConfig = {
    deploying: {
      icon: <Loader className="h-3 w-3 animate-spin" />,
      label: "Deploying",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    active: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Active",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    inactive: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Inactive",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    error: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Error",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status] ?? statusConfig.inactive;

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

/**
 * A button component that copies the provided text to the clipboard.
 */
function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success("Endpoint URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
    <Button variant="ghost" size="icon" onClick={onCopy} className="h-7 w-7">
      {copied ? (
        <ClipboardCheck className="h-4 w-4 text-green-500" />
      ) : (
        <Clipboard className="h-4 w-4" />
      )}
      <span className="sr-only">Copy URL</span>
    </Button>
  );
}

/**
 * Shortens a long URL to fit within the table without horizontal scroll.
 */
function shortenUrl(url: string): string {
  if (url.length <= 35) return url;

  // Extract the domain and endpoint ID
  const urlParts = url.split('/');
  const domain = urlParts[2]; // modal.run domain
  const endpointId = urlParts[urlParts.length - 1]; // last part is the ID

  // Return shortened format: domain/.../endpointId
  return `${domain}/.../${endpointId}`;
}

interface DeploymentsListProps {
  initialDeployments: DeploymentWithExperiment[];
}

export function DeploymentsList({ initialDeployments }: DeploymentsListProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const deploymentsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(initialDeployments.length / deploymentsPerPage);
  const startIndex = (currentPage - 1) * deploymentsPerPage;
  const endIndex = startIndex + deploymentsPerPage;
  const currentDeployments = initialDeployments.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (initialDeployments.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-gray-100 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">
            No deployments found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Deploy a completed experiment to create your first inference endpoint.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Deployments table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Active Endpoints
          </CardTitle>
          <CardDescription>
            A list of your deployed model inference endpoints.
          </CardDescription>
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
                {currentDeployments.map((dep) => (
                  <TableRow key={dep.id} className="border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-900">
                      <a
                        href={`/dashboard/projects/${dep.experiment?.projectId}/experiments/${dep.experimentId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                      >
                        {(dep.experiment?.modelConfig as any)?.modelName ?? "N/A"}
                      </a>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={dep.status} />
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {dep.modalEndpointUrl ? (
                        (() => {
                          const predictUrl = `${dep.modalEndpointUrl}/predict/${dep.experimentId}`;
                          const shortenedUrl = shortenUrl(predictUrl);
                          return (
                            <div className="flex items-center gap-2">
                              <a
                                href={predictUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                                title={predictUrl}
                              >
                                {shortenedUrl}
                              </a>
                              <CopyButton textToCopy={predictUrl} />
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-muted-foreground text-sm">Generating...</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 min-w-[140px]">
                      {new Date(dep.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
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
              Showing {startIndex + 1} to {Math.min(endIndex, initialDeployments.length)} of {initialDeployments.length} deployments
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
