/**
 * @description
 * This file implements the project settings page. Currently, this page serves
 * as a placeholder indicating that the settings functionality is in development.
 *
 * Key features:
 * - Placeholder UI: Displays a "Coming Soon" message with professional styling.
 * - Consistent Design: Matches the overall application design system.
 * - Navigation: Provides a back link to return to the project overview.
 *
 * @dependencies
 * - `next/link`: For the "Back to Projects" link.
 * - `lucide-react`: For the settings icon.
 * - `@/components/ui/*`: Various shadcn/ui components for layout.
 */
import Link from "next/link";
import { ArrowLeft, Settings, Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <Link
          href={`/dashboard/projects/${params.projectId}/experiments`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiments
        </Link>
      </div>

      {/* Main content */}
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        {/* Title and description */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Project Settings</h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Configure your project settings and preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-gray-200 shadow-sm max-w-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-4 bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Construction className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Coming Soon</CardTitle>
            <CardDescription className="text-base">
              Project settings are currently in development
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-gray-600 mb-6 leading-relaxed">
              We&apos;re working hard to bring you comprehensive project configuration options.
              This will include project metadata, team settings, and advanced configurations.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              In Development
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
