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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4 shadow-md">
            <RocketIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your AI Workbench account</p>
        </div>

        {/* Sign In Form */}
        <SignIn
          redirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#111827",
              colorText: "#374151",
              colorTextSecondary: "#6b7280",
              borderRadius: "0.75rem",
              fontFamily: '"Inter", sans-serif'
            },
            elements: {
              rootBox: "w-full",
              card: "w-full bg-white rounded-2xl border border-gray-200 shadow-xl",
              header: "hidden",
              socialButtons: "mb-4",
              socialButtonsBlockButton: "w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-lg py-3 px-4 text-sm font-medium shadow-sm hover:shadow-md",
              dividerRow: "my-4",
              formFieldRow: "mb-4",
              formFieldInput: "w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white",
              formFieldLabel: "text-gray-700 font-medium text-sm mb-2 block",
              formButtonPrimary: "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg border-none",
              footer: "bg-transparent mt-6",
              footerAction: "text-center text-sm",
              footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors",
            },
            layout: {
              socialButtonsPlacement: "top"
            }
          }}
        />
      </motion.div>
    </div>
  );
}
