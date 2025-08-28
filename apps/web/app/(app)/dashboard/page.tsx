/**
 * @description
 * This file implements the main dashboard page, which serves as the primary landing
 * page for authenticated users. It provides a welcome message and will eventually
 * display a high-level overview of the user's projects, recent activity, and key metrics.
 *
 * Key features:
 * - A clean, modern design with a subtle gradient background matching the public landing page.
 * - Professional typography to welcome the user.
 * - Uses `shadcn/ui` Card components for a structured and modern layout.
 * - Serves as the central hub from which users can navigate to other parts of the application.
 * - Works properly within the sidebar layout structure.
 *
 * @dependencies
 * - @/components/ui/card: Provides styled card components for layout.
 *
 * @notes
 * - Currently, this page is a placeholder. In the future, it will be populated with
 *   dynamic data, such as a summary of projects, recent experiments, or active deployments.
 * - Styling matches the public landing page for consistency.
 * - Fixed to work properly within the sidebar layout.
 */
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChartIcon,
  ArrowRightIcon,
  PlusIcon,
  FileTextIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { DashboardStatsClient } from "./_components/dashboard-stats-client";
import { RecentActivityClient } from "./_components/recent-activity-client";

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

const quickActions = [
  {
    icon: PlusIcon,
    title: "Create Project",
    description: "Start a new AI project",
    href: "/dashboard/projects",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: FileTextIcon,
    title: "Upload Dataset",
    description: "Add training data",
    href: "/dashboard/projects",
    color: "from-green-500 to-green-600"
  },
  {
    icon: BarChartIcon,
    title: "Run Experiment",
    description: "Train a new model",
    href: "/dashboard/projects",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: RocketIcon,
    title: "Deploy Model",
    description: "Deploy to production",
    href: "/dashboard/projects",
    color: "from-orange-500 to-orange-600"
  }
];

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="relative">
      {/* Background gradient matching the public landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-100 rounded-lg" />

      <motion.div
        className="relative z-10 space-y-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div className="space-y-2 text-center" variants={fadeInUp}>
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl md:text-6xl">
            Welcome back to the AI Workbench
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
            You&apos;re signed in! Ready to continue building, testing, and deploying machine learning models for the Allora Network?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeInUp}>
          <DashboardStatsClient />
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          <h2 className="text-2xl font-semibold text-gray-900 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={action.title}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-gray-200 bg-white/80 backdrop-blur-sm"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          <h2 className="text-2xl font-semibold text-gray-900 text-center">Recent Activity</h2>
          <RecentActivityClient />
        </motion.div>
      </motion.div>
    </div>
  );
}
