/**
 * @description
 * This file implements the user sign-up page for the AI Workbench application.
 * It utilizes Clerk's pre-built `<SignUp />` component to offer a seamless and
 * secure user registration flow.
 *
 * Key features:
 * - Renders a complete sign-up form.
 * - Supports various registration methods, including email/password and social providers.
 * - Manages the entire sign-up process, including email verification.
 * - Centered layout for a consistent and user-friendly experience.
 *
 * @dependencies
 * - `@clerk/nextjs`: Provides the `<SignUp />` component for user registration.
 *
 * @notes
 * - The file path `[[...sign-up]]` is a Next.js convention for an optional catch-all route,
 *   which is required by Clerk to correctly handle all parts of the registration flow.
 * - This page belongs to the `(auth)` route group, isolating it with other authentication pages.
 */
"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { RocketIcon } from "@radix-ui/react-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

/**
 * Renders the sign-up page for the application.
 *
 * This component displays Clerk's `SignUp` component, which provides a
 * complete and customizable user registration interface.
 *
 * @returns {JSX.Element} The rendered sign-up page component.
 */
export default function SignUpPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join the AI Workbench platform</p>
        </div>

        {/* Sign Up Form */}
        <SignUp
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
