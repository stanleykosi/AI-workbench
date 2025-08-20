/**
 * @description
 * This file implements the main dashboard page, which serves as the primary landing
 * page for authenticated users. It provides a welcome message and will eventually
 * display a high-level overview of the user's projects, recent activity, and key metrics.
 *
 * Key features:
 * - A clear and welcoming header for the user.
 * - Uses `shadcn/ui` Card components for a structured and modern layout.
 * - Serves as the central hub from which users can navigate to other parts of the application.
 *
 * @dependencies
 * - @/components/ui/card: Provides styled card components for layout.
 *
 * @notes
 * - Currently, this page is a placeholder. In the future, it will be populated with
 *   dynamic data, such as a summary of projects, recent experiments, or active deployments.
 */
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Renders the main dashboard page for authenticated users.
 *
 * @returns {JSX.Element} The rendered dashboard page component.
 */
export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI Workbench. Here&apos;s a summary of your work.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            This is your central hub for managing AI models for the Allora Network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You can create a new project to get started, or select an existing one
            from the sidebar to manage datasets, experiments, and deployments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
