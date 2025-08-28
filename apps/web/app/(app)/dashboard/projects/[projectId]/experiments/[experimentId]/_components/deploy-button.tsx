/**
 * @description
 * This client component renders a "Deploy" button and handles the logic for
 * initiating the model deployment workflow. It manages its own loading state
 * and provides user feedback via toast notifications.
 *
 * Key features:
 * - Client-Side Interactivity: Handles the `onClick` event to trigger the deployment.
 * - Server Action Integration: Calls the `startDeploymentAction` server action.
 * - State Management: Uses `useState` and `useTransition` to manage the loading
 *   state, preventing multiple clicks and providing visual feedback.
 * - User Feedback: Uses `sonner` to display success or error toast notifications.
 * - Redirection: Redirects the user to the project's deployments page upon successfully
 *   starting the workflow.
 *
 * @dependencies
 * - `react`: For `useState` and `useTransition`.
 * - `next/navigation`: For `useRouter` to handle redirection.
 * - `lucide-react`: For the button icon.
 * - `sonner`: For displaying toast notifications.
 * - `@/components/ui/button`: The shadcn/ui button component.
 * - `@/actions/workflow/deployment-actions`: The server action to start the deployment.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { toast } from "sonner";

import { startDeploymentAction } from "@/actions/workflow/deployment-actions";
import { Button } from "@/components/ui/button";

interface DeployButtonProps {
  experimentId: string;
  projectId: string;
}

export function DeployButton({ experimentId, projectId }: DeployButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleDeploy = () => {
    startTransition(async () => {
      const result = await startDeploymentAction(experimentId);
      if (result.isSuccess) {
        toast.success(result.message);
        router.push(`/dashboard/projects/${projectId}/deployments`);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      onClick={handleDeploy}
      disabled={isPending}
      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 text-white border-0"
    >
      <Rocket className="mr-2 h-4 w-4" />
      {isPending ? "Deploying..." : "Deploy"}
    </Button>
  );
}
