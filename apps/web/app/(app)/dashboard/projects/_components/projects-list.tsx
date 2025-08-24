/**
 * @description
 * This client component is responsible for rendering the list of projects.
 * It receives the initial project data from a server component and displays it
 * in a responsive grid layout. It also handles the empty state when no projects
 * are available.
 *
 * Key features:
 * - Client-Side Rendering: Renders the UI on the client, allowing for future client-side
 *   interactions like sorting or filtering (though currently just displays static props).
 * - Prop-based Data: Receives the initial list of projects fetched on the server, ensuring
 *   a fast initial page load without client-side data fetching.
 * - Interactive Cards: Each project is displayed as a clickable card that navigates
 *   to the detailed project page.
 * - Empty State: Provides a clear and helpful message when the user has no projects.
 *
 * @dependencies
 * - `next/link`: For client-side navigation to individual project pages.
 * - `@/db/schema`: For the `SelectProject` type definition.
 * - `@/components/ui/card`: Provides the styled card component for each project.
 *
 * @notes
 * - The component is architected to be "dumb" in that it only renders the data it's given.
 *   The data fetching logic is handled by a parent server component (`ProjectsPage`).
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type SelectProject } from "@/db/schema";
import { 
  RocketIcon, 
  CalendarIcon, 
  ArrowRightIcon,
  FileIcon,
  PlusIcon
} from "@radix-ui/react-icons";

interface ProjectsListProps {
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

/**
 * Renders a list of projects or an empty state message if no projects exist.
 *
 * @param {ProjectsListProps} props - The component props.
 * @returns {JSX.Element} The rendered project list or empty state.
 */
export function ProjectsList({ initialProjects }: ProjectsListProps) {
  // If there are no projects, display a helpful empty state message.
  if (initialProjects.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50 p-16 text-center"
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
        {initialProjects.map((project, index) => (
          <motion.div
            key={project.id}
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
                        <span>0 Datasets</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>0 Experiments</span>
                      </div>
                    </div>
                  </div>
                </CardDescription>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
