/**
 * @description
 * This component implements the header for the authenticated dashboard layout. It sits
 * at the top of the main content area and contains user-specific controls.
 *
 * Key features:
 * - Integrates Clerk's `<UserButton />` for easy access to user profile and sign-out actions.
 * - A clean, responsive design that adapts to different screen sizes.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `UserButton` component.
 *
 * @notes
 * - The mobile navigation toggle is included but is currently a placeholder; its state
 *   and functionality will be implemented in a future step.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { BellIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";

/**
 * Renders the header component for the authenticated user dashboard.
 *
 * This component provides key user management controls.
 *
 * @returns {JSX.Element} The rendered header component.
 */
export function Header() {
  return (
    <motion.header
      className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar */}
      <motion.div
        className="flex-1 max-w-lg"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, datasets, experiments..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-10 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Right Side Controls */}
      <motion.div
        className="flex items-center gap-4 ml-6"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Notifications */}
        <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 group">
          <BellIcon className="h-5 w-5" />
          <div className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {/* User Button */}
        <div className="flex items-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9",
                userButtonTrigger: "focus:shadow-none hover:shadow-none rounded-full transition-all duration-200 hover:scale-105"
              }
            }}
          />
        </div>
      </motion.div>
    </motion.header>
  );
}
