/**
 * @description
 * This file implements the user sign-in page for the AI Workbench application.
 * It leverages Clerk's pre-built `<SignIn />` component to provide a secure and
 * feature-rich authentication experience out of the box.
 *
 * Key features:
 * - Renders a complete sign-in form.
 * - Supports various authentication methods (e.g., email/password, social providers).
 * - Handles all aspects of the sign-in flow, including multi-factor authentication.
 * - Centered layout for a clean and focused user interface.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `<SignIn />` component for user authentication.
 *
 * @notes
 * - The file path `[[...sign-in]]` is a Next.js convention for an optional catch-all route,
 *   which is required by Clerk to handle all authentication-related sub-routes and flows.
 * - This page is part of the `(auth)` route group, which can be used to apply specific
 *   layouts or middleware to authentication-related pages.
 */
"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { RocketIcon } from "@radix-ui/react-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

/**
 * Renders the sign-in page for the application.
 *
 * This component displays Clerk's `SignIn` component, which provides a
 * complete and customizable sign-in user interface.
 *
 * @returns {JSX.Element} The rendered sign-in page component.
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-30 blur-3xl hidden sm:block" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full opacity-30 blur-3xl hidden sm:block" />

      <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 z-10">
          <motion.div
            className="text-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back to AI Workbench
            </h1>
          </motion.div>

          <div className="flex justify-center">
            <SignIn
              redirectUrl="/dashboard"
              signUpUrl="/sign-up"
              appearance={{
                variables: {
                  colorPrimary: "#2563eb",
                  colorBackground: "#ffffff",
                  colorInputBackground: "#ffffff",
                  colorInputText: "#111827",
                  colorText: "#374151",
                  colorTextSecondary: "#6b7280",
                  borderRadius: "0.5rem",
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }
              }}
            />
          </div>


        </div>
      </div>
    </div>
  );
}
