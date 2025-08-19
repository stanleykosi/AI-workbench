/**
 * @description
 * This file defines the root layout for the entire Next.js application.
 * It wraps all pages with the base HTML structure and applies global styles.
 *
 * Key features:
 * - Sets up the `<html>` and `<body>` tags.
 * - Imports and applies the global CSS stylesheet (`globals.css`).
 * - Defines default metadata for the application, such as title and description.
 * - Configures the 'Inter' font for the entire application.
 *
 * @dependencies
 * - next/font/google: For importing and using custom fonts.
 * - ./globals.css: Contains global styles and CSS variables for theming.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
