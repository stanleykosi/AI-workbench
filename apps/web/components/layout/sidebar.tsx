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
  RocketIcon,
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
        <Link href="/dashboard" className="flex items-center gap-1 font-semibold group">
          <div className="p-2 group-hover:scale-110 transition-transform duration-200">
            <img src="/icon.svg" alt="AI Workbench" className="h-12 w-12" />
          </div>
          <span className="text-lg font-bold text-gray-900">AI Workbench</span>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <ul className="space-y-2">
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
                        "group flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-medium transition-all duration-200 hover:bg-gray-50",
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
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
        <div className="flex justify-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 group"
          >
            <svg
              className="h-6 w-6 group-hover:scale-110 transition-transform duration-200"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 10.012 22 12.017c0-4.425-2.865-8.18-6.839-9.504A10.017 10.017 10.012 2 12.017z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </motion.div>
    </motion.aside>
  );
}


