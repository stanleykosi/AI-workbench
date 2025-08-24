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
      className: "bg-blue-100 text-blue-800",
    },
    active: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Active",
      className: "bg-green-100 text-green-800",
    },
    inactive: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Inactive",
      className: "bg-gray-100 text-gray-800",
    },
    error: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Error",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status] ?? statusConfig.inactive;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-transparent font-normal", config.className)}
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

interface DeploymentsListProps {
  initialDeployments: DeploymentWithExperiment[];
}

export function DeploymentsList({ initialDeployments }: DeploymentsListProps) {
  if (initialDeployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">
          No deployments found
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Deploy a completed experiment to create your first inference endpoint.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Endpoints</CardTitle>
        <CardDescription>
          A list of your deployed model inference endpoints.
        </CardDescription>
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
            {initialDeployments.map((dep) => (
              <TableRow key={dep.id}>
                <TableCell className="font-medium">
                  {(dep.experiment?.modelConfig as any)?.modelName ?? "N/A"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={dep.status} />
                </TableCell>
                <TableCell>
                  {dep.modalEndpointUrl ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={dep.modalEndpointUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm text-blue-600 hover:underline"
                        title={dep.modalEndpointUrl}
                      >
                        {dep.modalEndpointUrl}
                      </a>
                      <CopyButton textToCopy={dep.modalEndpointUrl} />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Generating...</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(dep.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
