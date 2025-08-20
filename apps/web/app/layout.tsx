/**
 * @description
 * This file defines the root layout for the entire Next.js application.
 * It wraps all pages with the base HTML structure, applies global styles,
 * and integrates the ClerkProvider for application-wide authentication.
 *
 * Key features:
 * - Sets up the `<html>` and `<body>` tags.
 * - Imports and applies the global CSS stylesheet (`globals.css`).
 * - Defines default metadata for the application, such as title and description.
 * - Configures the 'Inter' font for the entire application.
 * - Wraps the application in `<ClerkProvider>` to enable global auth state.
 * - Includes Clerk authentication UI components in the header.
 *
 * @dependencies
 * - @clerk/nextjs: For the `ClerkProvider` and authentication components.
 * - next/font/google: For importing and using custom fonts.
 * - ./globals.css: Contains global styles and CSS variables for theming.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Workbench",
  description:
    "A comprehensive platform to build, test, and deploy AI models for the Allora Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">AI Workbench</h1>
              <div className="flex items-center space-x-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
