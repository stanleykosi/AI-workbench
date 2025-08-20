/**
 * @description
 * This client component renders the navigation sidebar for a specific project.
 * It provides links to the key sections of a project, such as Datasets,
 * Experiments, Deployments, and Settings.
 *
 * Key features:
 * - Client-Side Interactivity: Uses the `usePathname` hook to determine the active
 *   route and apply specific styling to the corresponding navigation link.
 * - Dynamic Links: Constructs URLs using the `projectId` prop, ensuring navigation
 *   is always within the context of the current project.
 * - Clear Navigation: Displays the project name and provides an organized list of
 *   links with icons for a clear and intuitive user experience.
 *
 * @dependencies
 * - `next/link`: For client-side navigation.
 * - `next/navigation`: For the `usePathname` hook.
 * - `@radix-ui/react-icons`: For the icons used in navigation links.
 * - `@/lib/utils`: The `cn` utility for conditional class naming.
 *
 * @notes
 * - The component receives `projectId` and `projectName` as props from the parent
 *   server layout, which fetches this data.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  GearIcon,
  HomeIcon,
  RocketIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectSidebarProps {
  projectId: string;
  projectName: string;
}

/**
 * Renders the navigation sidebar for a single project view.
 *
 * @param {ProjectSidebarProps} props - The component props.
 * @returns {JSX.Element} The rendered project sidebar.
 */
export function ProjectSidebar({ projectId, projectName }: ProjectSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/dashboard/projects/${projectId}/datasets`,
      label: "Datasets",
      icon: FileTextIcon,
    },
    {
      href: `/dashboard/projects/${projectId}/experiments`,
      label: "Experiments",
      icon: BarChartIcon,
    },
    {
      href: `/dashboard/projects/${projectId}/deployments`,
      label: "Deployments",
      icon: RocketIcon,
    },
    {
      href: `/dashboard/projects/${projectId}/settings`,
      label: "Settings",
      icon: GearIcon,
    },
  ];

  return (
    <nav className="grid gap-4 text-sm font-medium">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <span>{projectName}</span>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
