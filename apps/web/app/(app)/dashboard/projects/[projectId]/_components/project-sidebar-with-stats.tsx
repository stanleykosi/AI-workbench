/**
 * @description
 * This component renders the navigation sidebar for a single project view with real-time statistics.
 * It shows the project overview with actual dataset and experiment counts instead of hardcoded zeros.
 *
 * Key features:
 * - Real-time project statistics
 * - React Query caching for performance
 * - Loading states and error handling
 * - Responsive navigation with active states
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  GearIcon,
  RocketIcon,
  BarChartIcon,
  ArrowLeftIcon,
  FileIcon
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useProjectStats } from "@/hooks/use-project-stats";

interface ProjectSidebarWithStatsProps {
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

function ProjectStatsDisplay({ stats }: { stats: { datasets: number; experiments: number } }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-lg font-bold text-gray-900">{stats.datasets}</div>
        <div className="text-xs text-gray-500">Datasets</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-lg font-bold text-gray-900">{stats.experiments}</div>
        <div className="text-xs text-gray-500">Experiments</div>
      </div>
    </div>
  );
}

function ProjectStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="text-lg font-bold text-gray-900 bg-gray-200 rounded h-6 w-8 mx-auto"></div>
        <div className="text-xs text-gray-500 mt-1">Datasets</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="text-lg font-bold text-gray-900 bg-gray-200 rounded h-6 w-8 mx-auto"></div>
        <div className="text-xs text-gray-500 mt-1">Experiments</div>
      </div>
    </div>
  );
}

/**
 * Renders the navigation sidebar for a single project view with real-time statistics.
 *
 * @param {ProjectSidebarWithStatsProps} props - The component props.
 * @returns {JSX.Element} The rendered project sidebar.
 */
export function ProjectSidebarWithStats({ projectId, projectName }: ProjectSidebarWithStatsProps) {
  const pathname = usePathname();

  // Fetch real-time project statistics
  const { data: projectStats, isLoading, error } = useProjectStats(projectId);

  return (
    <motion.nav
      className="space-y-6 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Projects</span>
        </Link>

        {/* Project Header */}
        <motion.div
          className="space-y-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FileIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate">{projectName}</h2>
              <p className="text-sm text-gray-500">Project Navigation</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation Items */}
      <motion.div
        className="space-y-2"
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
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : `bg-gradient-to-r ${item.color} text-white group-hover:scale-110 group-hover:shadow-md`
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
                {isActive && (
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Project Stats */}
      <motion.div
        className="pt-6 border-t border-gray-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Project Overview
          </h3>

          {isLoading ? (
            <ProjectStatsSkeleton />
          ) : error ? (
            // Fallback to showing 0s if there's an error
            <ProjectStatsDisplay stats={{ datasets: 0, experiments: 0 }} />
          ) : projectStats ? (
            <ProjectStatsDisplay stats={projectStats} />
          ) : (
            <ProjectStatsDisplay stats={{ datasets: 0, experiments: 0 }} />
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}
