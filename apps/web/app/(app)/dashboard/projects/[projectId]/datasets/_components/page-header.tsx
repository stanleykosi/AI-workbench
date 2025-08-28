/**
 * @description
 * This component renders the header for the Datasets page within a project.
 * It includes the page title, a brief description, and primary action buttons
 * for uploading a local CSV or fetching data from Tiingo.
 *
 * Key features:
 * - Consistency: Provides a standard header structure for the datasets section.
 * - Multiple Actions: Integrates both the `UploadDatasetDialog` and `FetchTiingoDialog`
 *   to offer users comprehensive data source options.
 * - Design System: Uses consistent button styling that matches the app's design language.
 *
 * @dependencies
 * - `./upload-dataset-dialog`: The client component for the local file upload modal.
 * - `./fetch-tiingo-dialog`: The client component for the Tiingo data fetch modal.
 */
"use client";

import { motion } from "framer-motion";
import { FetchTiingoDialog } from "./fetch-tiingo-dialog";
import { UploadDatasetDialog } from "./upload-dataset-dialog";

interface DatasetsPageHeaderProps {
  projectId: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

/**
 * Renders the page header for the Datasets page.
 *
 * @param {DatasetsPageHeaderProps} props - The component props.
 * @returns {JSX.Element} The rendered page header.
 */
export function DatasetsPageHeader({ projectId }: DatasetsPageHeaderProps) {
  return (
    <motion.div
      className="flex items-center justify-between"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your data sources for model training.
        </p>
      </div>
      <motion.div
        className="flex items-center gap-3"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <FetchTiingoDialog projectId={projectId} />
        <UploadDatasetDialog projectId={projectId} />
      </motion.div>
    </motion.div>
  );
}
