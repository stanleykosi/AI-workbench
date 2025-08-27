/**
 * @description
 * This component displays projects with real-time statistics fetched from the database.
 * It replaces the hardcoded "0 Datasets" and "0 Experiments" with actual counts.
 *
 * Key features:
 * - Real-time project statistics
 * - React Query caching for performance
 * - Loading states and error handling
 * - Responsive grid layout
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RocketIcon,
  ArrowRightIcon,
  CalendarIcon,
  FileIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useMultipleProjectStats } from "@/hooks/use-project-stats";
import { type SelectProject } from "@/db/schema";

interface ProjectsListWithStatsProps {
  initialProjects: SelectProject[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function ProjectCard({ project, stats, index }: {
  project: SelectProject;
  stats?: { datasets: number; experiments: number };
  index: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/dashboard/projects/${project.id}/datasets`}
        className="block group"
      >
        <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-blue-200 border-2 border-transparent overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <RocketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardDescription className="px-6 pb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Created {new Date(project.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>{stats?.datasets ?? 0} Datasets</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>{stats?.experiments ?? 0} Experiments</span>
                </div>
              </div>
            </div>
          </CardDescription>
        </Card>
      </Link>
    </motion.div>
  );
}

function ProjectCardSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </CardHeader>
      <CardDescription className="px-6 pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </CardDescription>
    </Card>
  );
}

export function ProjectsListWithStats({ initialProjects }: ProjectsListWithStatsProps) {
  // Extract project IDs for the query
  const projectIds = initialProjects.map(project => project.id);

  // Fetch statistics for all projects
  const { data: projectStats, isLoading, error } = useMultipleProjectStats(projectIds);

  // If there are no projects, display a helpful empty state message.
  if (initialProjects.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="mb-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
            <FileIcon className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          No projects found
        </h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Get started by creating your first project to organize your AI models, datasets, and experiments.
        </p>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <PlusIcon className="h-5 w-5" />
          Create Your First Project
        </Link>
      </motion.div>
    );
  }

  // Render a grid of project cards.
  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Your Projects ({initialProjects.length})
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={fadeInUp}
      >
        {initialProjects.map((project, index) => {
          // Find stats for this specific project
          const projectStat = projectStats?.find(stat => stat.projectId === project.id);

          if (isLoading) {
            return <ProjectCardSkeleton key={project.id} />;
          }

          return (
            <ProjectCard
              key={project.id}
              project={project}
              stats={projectStat}
              index={index}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}
