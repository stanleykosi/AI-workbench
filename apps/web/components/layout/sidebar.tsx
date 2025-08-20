/**
 * @description
 * This component implements the main navigation sidebar for the AI Workbench application.
 * It is displayed within the authenticated dashboard layout and provides users with
 * consistent access to the application's key sections.
 *
 * Key features:
 * - A fixed-width, vertical layout for clear navigation.
 * - A styled list of navigation links with icons and text labels.
 * - An application logo or title at the top for branding.
 * - Uses Radix Icons for iconography, adhering to the project's design system.
 *
 * @dependencies
 * - @radix-ui/react-icons: Provides the icon set for navigation links.
 * - next/link: For client-side navigation between pages.
 * - @/lib/utils: The `cn` utility for conditional class naming.
 *
 * @notes
 * - The navigation links are currently placeholders and will be expanded as new
 *   features and pages are added to the application.
 * - The active link styling is not yet implemented and can be added later using `usePathname`.
 */
"use client";

import React from "react";
import Link from "next/link";
import { DashboardIcon, RocketIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

/**
 * Renders the main sidebar navigation component.
 *
 * This component provides a list of links to the core sections of the application,
 * such as the dashboard and projects pages.
 *
 * @returns {JSX.Element} The rendered sidebar component.
 */
export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <RocketIcon className="h-6 w-6" />
          <span>AI Workbench</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                // TODO: Add active link styling based on pathname
                "bg-muted text-primary",
              )}
            >
              <DashboardIcon className="h-4 w-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/projects"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                // TODO: Add active link styling based on pathname
              )}
            >
              <RocketIcon className="h-4 w-4" />
              Projects
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
