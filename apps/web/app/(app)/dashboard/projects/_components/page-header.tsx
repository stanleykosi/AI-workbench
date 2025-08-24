/**
 * @description
 * This component renders a standardized header for pages within the dashboard.
 * It typically includes the page title and a primary action button, such as a
 * "Create New" button.
 *
 * Key features:
 * - Consistency: Provides a consistent layout for page headers across the application.
 * - Separation of Concerns: Decouples the page layout from the header content.
 * - Action-Oriented: Includes a slot for a primary call-to-action button.
 *
 * @dependencies
 * - ./create-project-dialog: The dialog component for creating a new project (to be created).
 *
 * @notes
 * - This component is designed to be used at the top of main page components within
 *   the dashboard layout.
 */
"use client";

import { motion } from "framer-motion";
import { RocketIcon, PlusIcon } from "@radix-ui/react-icons";

// The CreateProjectDialog will be a client component that handles the dialog state.
// We will create this in the next step. For now, we import a placeholder.
import { CreateProjectDialog } from "./create-project-dialog";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

/**
 * Renders the page header for the Projects page.
 *
 * @returns {JSX.Element} The rendered page header.
 */
export function PageHeader() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
            <RocketIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Projects
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Organize your models and datasets into projects. Create, manage, and collaborate on AI initiatives with ease.
        </p>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CreateProjectDialog />
      </motion.div>
    </motion.div>
  );
}
