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
 *
 * @dependencies
 * - `lucide-react`: For status icons (Clock, Loader, CheckCircle, XCircle).
 * - `@/db/schema`: For the `SelectExperiment` TypeScript type.
 * - `@/components/ui/*`: Imports shadcn/ui components like Card, Table, and Badge.
 * - `@/lib/utils`: The `cn` utility for conditional class naming.
 */
"use client";

import {
  CheckCircle2,
  Clock,
  Loader,
  MoreHorizontal,
  XCircle,
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
      className: "bg-gray-100 text-gray-800",
    },
    running: {
      icon: <Loader className="h-3 w-3 animate-spin" />,
      label: "Running",
      className: "bg-blue-100 text-blue-800",
    },
    completed: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Completed",
      className: "bg-green-100 text-green-800",
    },
    failed: {
      icon: <XCircle className="h-3 w-3" />,
      label: "Failed",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status] ?? statusConfig.pending;

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
 * Renders a list of experiments in a table or an empty state message.
 *
 * @param {ExperimentsListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of experiments.
 */
export function ExperimentsList({ initialExperiments }: ExperimentsListProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Experiments</CardTitle>
        <CardDescription>
          A list of your recent model training runs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialExperiments.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-medium">
                  {(exp.modelConfig as any)?.modelName ?? "N/A"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={exp.status} />
                </TableCell>
                <TableCell>
                  {new Date(exp.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
