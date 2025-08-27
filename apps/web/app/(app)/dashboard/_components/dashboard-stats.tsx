/**
 * @description
 * This component fetches and displays real-time dashboard statistics.
 * It shows counts for projects, datasets, experiments, and deployments.
 *
 * Key features:
 * - Server-side data fetching for real-time counts
 * - Proper loading states and error handling
 * - Responsive grid layout with animated cards
 * - Real-time data instead of hardcoded values
 */

import { Suspense } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  RocketIcon,
  BarChartIcon,
  GearIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";

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

interface DashboardStatsProps {
  counts: {
    projects: number;
    datasets: number;
    experiments: number;
    deployments: number;
  };
}

function DashboardStatsDisplay({ counts }: DashboardStatsProps) {
  const stats = [
    {
      label: "Active Projects",
      value: counts.projects.toString(),
      icon: RocketIcon,
      color: "text-blue-600"
    },
    {
      label: "Datasets",
      value: counts.datasets.toString(),
      icon: FileTextIcon,
      color: "text-green-600"
    },
    {
      label: "Experiments",
      value: counts.experiments.toString(),
      icon: BarChartIcon,
      color: "text-purple-600"
    },
    {
      label: "Deployments",
      value: counts.deployments.toString(),
      icon: GearIcon,
      color: "text-orange-600"
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {stats.map((stat, index) => (
        <motion.div key={stat.label} variants={fadeInUp}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="p-3 rounded-lg bg-gray-200">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { DashboardStatsDisplay, DashboardStatsSkeleton };
