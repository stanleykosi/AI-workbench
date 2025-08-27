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
 * - Includes the `<Toaster />` for global notifications.
 *
 * @dependencies
 * - @clerk/nextjs: For the `ClerkProvider` and authentication components.
 * - next/font/google: For importing and using custom fonts.
 * - @/components/ui/sonner: For the global toast notification system.
 * - ./globals.css: Contains global styles and CSS variables for theming.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Workbench",
  description:
    "A comprehensive platform to build, test, and deploy AI models for the Allora Network.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
            </QueryProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
