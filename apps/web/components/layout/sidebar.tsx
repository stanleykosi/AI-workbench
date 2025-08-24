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
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  DashboardIcon,
  RocketIcon,
  BarChartIcon,
  GearIcon,
  FileTextIcon,
  PersonIcon,
  HomeIcon
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: HomeIcon,
    description: "Overview and quick actions"
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: RocketIcon,
    description: "Manage your AI projects"
  }
];

const secondaryNavItems = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: GearIcon,
    description: "Application preferences"
  },
  {
    href: "/user-profile",
    label: "Profile",
    icon: PersonIcon,
    description: "User account settings"
  }
];

/**
 * Renders the main sidebar navigation component.
 *
 * This component provides a list of links to the core sections of the application,
 * such as the dashboard and projects pages.
 *
 * @returns {JSX.Element} The rendered sidebar component.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      className="hidden h-screen w-64 flex-col border-r bg-white/80 backdrop-blur-sm sm:flex"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex h-16 items-center border-b border-gray-200 px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <RocketIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-lg text-gray-900">AI Workbench</span>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main
            </h3>
            <ul className="space-y-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
                    key={item.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50",
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-colors duration-200",
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          {/* Secondary Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account
            </h3>
            <ul className="space-y-1">
              {secondaryNavItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
                    key={item.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50",
                        isActive
                          ? "bg-gray-50 text-gray-900 border border-gray-200"
                          : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-colors duration-200",
                        isActive
                          ? "bg-gray-200 text-gray-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <motion.div
        className="border-t border-gray-200 p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <RocketIcon className="h-3 w-3 text-blue-600" />
            </div>
            <div className="text-xs">
              <div className="font-medium text-blue-900">AI Workbench</div>
              <div className="text-blue-700">v2.0 Beta</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}


