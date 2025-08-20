/**
 * @description
 * This file initializes and exports a singleton instance of the AWS S3 client.
 * It is configured using environment variables for the AWS region and credentials,
 * ensuring that the application can securely connect to the S3 service.
 *
 * Key features:
 * - Singleton Pattern: Ensures only one instance of the S3 client is created,
 *   improving performance and resource management.
 * - Environment-based Configuration: Securely loads credentials and settings
 *   from environment variables, avoiding hardcoded secrets.
 *
 * @dependencies
 * - `@aws-sdk/client-s3`: The official AWS SDK v3 client for Amazon S3.
 *
 * @notes
 * - The environment variables (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
 *   must be set in the `.env.local` file for this client to be instantiated correctly.
 * - Throws an error on initialization if any of the required environment variables are missing.
 */
"use server";

import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars: (keyof NodeJS.ProcessEnv)[] = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_DATASETS_BUCKET",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `S3 Client Error: Missing required environment variable: ${envVar}`,
    );
  }
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

