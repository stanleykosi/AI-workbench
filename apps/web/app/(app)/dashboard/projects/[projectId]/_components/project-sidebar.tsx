/**
 * @description
 * This client component renders the navigation sidebar for a specific project.
 * It provides links to the key sections of a project, such as Datasets,
 * Experiments, Deployments, and Settings. The sidebar is collapsible to
 * provide more space on the page when needed.
 *
 * Key features:
 * - Client-Side Interactivity: Uses the `usePathname` hook to determine the active
 *   route and apply specific styling to the corresponding navigation link.
 * - Collapsible Design: Includes a subtle toggle button to slide the sidebar in/out.
 * - Dynamic Links: Constructs URLs using the `projectId` prop, ensuring navigation
 *   is always within the context of the current project.
 * - Clear Navigation: Displays the project name and provides an organized list of
 *   links with icons for a clear and intuitive user experience.
 * - Smooth Animations: Uses Framer Motion for professional sliding transitions.
 *
 * @dependencies
 * - `next/link`: For client-side navigation.
 * - `next/navigation`: For the `usePathname` hook.
 * - `framer-motion`: For smooth animations and transitions.
 * - `@radix-ui/react-icons`: For the icons used in navigation links.
 * - `@/lib/utils`: The `cn` utility for conditional class naming.
 *
 * @notes
 * - The component receives `projectId` and `projectName` as props from the parent
 *   server layout, which fetches this data.
 * - When collapsed, only icons are shown to maintain functionality while saving space.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FileTextIcon,
  GearIcon,
  HomeIcon,
  RocketIcon,
  BarChartIcon,
  ArrowLeftIcon,
  FileIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectSidebarProps {
  projectId: string;
  projectName: string;
}

const projectNavItems = [
  {
    href: "datasets",
    label: "Datasets",
    icon: FileTextIcon,
    description: "Manage training data",
    color: "from-green-500 to-green-600"
  },
  {
    href: "experiments",
    icon: BarChartIcon,
    label: "Experiments",
    description: "Track model training",
    color: "from-purple-500 to-purple-600"
  },
  {
    href: "deployments",
    icon: RocketIcon,
    label: "Deployments",
    description: "Production endpoints",
    color: "from-orange-500 to-orange-600"
  },
  {
    href: "settings",
    icon: GearIcon,
    label: "Settings",
    description: "Project configuration",
    color: "from-gray-500 to-gray-600"
  },
];

/**
 * Renders the navigation sidebar for a single project view.
 *
 * @param {ProjectSidebarProps} props - The component props.
 * @returns {JSX.Element} The rendered project sidebar.
 */
export function ProjectSidebar({ projectId, projectName }: ProjectSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative">
      {/* Toggle Button - Positioned outside the sidebar for better visibility */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-4 top-6 z-20 h-10 w-10 rounded-full border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
          "hover:border-blue-300 hover:bg-blue-50",
          isCollapsed ? "rotate-180" : ""
        )}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </Button>

      {/* Main Sidebar */}
      <motion.nav
        className={cn(
          "relative bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-80"
        )}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "p-4" : "p-6"
        )}>
          {/* Project Header */}
          <motion.div
            className="space-y-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Back to Projects */}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
                  >
                    <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Projects</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Project Info */}
            <div className="space-y-3">
              <div className={cn(
                "flex items-center gap-3",
                isCollapsed ? "justify-center" : ""
              )}>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-white" />
                </div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-0"
                    >
                      <h2 className="text-lg font-semibold text-gray-900 truncate">{projectName}</h2>
                      <p className="text-sm text-gray-500">Project Navigation</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <motion.div
            className="space-y-2 mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {projectNavItems.map((item, index) => {
              const fullHref = `/dashboard/projects/${projectId}/${item.href}`;
              const isActive = pathname === fullHref;

              return (
                <motion.div
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    href={fullHref}
                    className={cn(
                      "group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                      isCollapsed ? "justify-center px-2" : "",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 flex-shrink-0",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : `bg-gradient-to-r ${item.color} text-white group-hover:scale-110 group-hover:shadow-md`
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 min-w-0"
                        >
                          <div className="font-semibold truncate">{item.label}</div>
                          <div className="text-xs text-gray-500 truncate">{item.description}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && isActive && (
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Project Stats */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                className="pt-6 border-t border-gray-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-500">Datasets</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-500">Experiments</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  );
}
