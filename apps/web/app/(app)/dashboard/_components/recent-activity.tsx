/**
 * @description
 * This component displays recent activity items in a timeline format.
 * It shows projects, datasets, experiments, and deployments with proper styling.
 *
 * Key features:
 * - Timeline layout for activity items
 * - Type-specific icons and colors
 * - Relative timestamps
 * - Status indicators
 * - Project context for each activity
 */

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
  ClockIcon,
} from "@radix-ui/react-icons";
import { type ActivityItem } from "@/actions/db";

interface RecentActivityProps {
  activities: ActivityItem[];
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

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'project':
      return RocketIcon;
    case 'dataset':
      return FileTextIcon;
    case 'experiment':
      return BarChartIcon;
    case 'deployment':
      return GearIcon;
    default:
      return ClockIcon;
  }
}

function getActivityColor(type: ActivityItem['type']) {
  switch (type) {
    case 'project':
      return 'text-blue-600 bg-blue-50';
    case 'dataset':
      return 'text-green-600 bg-green-50';
    case 'experiment':
      return 'text-purple-600 bg-purple-50';
    case 'deployment':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

function getStatusColor(status?: string) {
  if (!status) return 'text-gray-500';

  switch (status.toLowerCase()) {
    case 'completed':
    case 'deployed':
      return 'text-green-600';
    case 'running':
    case 'deploying':
      return 'text-blue-600';
    case 'failed':
      return 'text-red-600';
    case 'pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-500';
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function RecentActivityItem({ activity, index }: { activity: ActivityItem; index: number }) {
  const Icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);
  const statusColor = getStatusColor(activity.status);

  return (
    <motion.div
      variants={fadeInUp}
      className="flex items-start space-x-4 relative"
    >
      {/* Timeline connector */}
      {index < 9 && (
        <div className="absolute left-6 top-8 w-0.5 h-12 bg-gray-200" />
      )}

      {/* Activity icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {activity.title}
          </h4>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1">
          {activity.description}
          {activity.status && (
            <span className={`ml-2 font-medium ${statusColor}`}>
              • {activity.status}
            </span>
          )}
        </p>

        {activity.projectName && (
          <p className="text-xs text-gray-500 mt-1">
            Project: {activity.projectName}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function RecentActivityDisplay({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <BarChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No recent activity</p>
            <p className="text-sm">Your projects and experiments will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <RecentActivityItem
              key={`${activity.type}-${activity.id}`}
              activity={activity}
              index={index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-4 animate-pulse">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
