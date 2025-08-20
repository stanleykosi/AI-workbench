/**
 * @description
 * This file contains Server Actions related to AWS S3 operations. The primary function
 * here is to generate secure, presigned URLs that allow the client-side application
 * to upload files directly to a private S3 bucket without exposing AWS credentials.
 *
 * Key features:
 * - `createPresignedUploadUrlAction`: Generates a temporary URL for a `PUT` operation.
 *   This is the cornerstone of our secure, client-side direct upload strategy.
 *
 * @dependencies
 * - `crypto`: Used to generate a random UUID for unique file keys.
 * - `@clerk/nextjs/server`: For `auth()` to get the current user's ID for secure key generation.
 * - `@aws-sdk/client-s3`: Provides the `PutObjectCommand` for specifying the S3 upload operation.
 * - `@aws-sdk/s3-request-presigner`: The utility to create the presigned URL from the command.
 * - `@/lib/s3`: The singleton S3 client instance.
 * - `@repo/types`: The shared `ActionState` type for consistent action responses.
 *
 * @notes
 * - The S3 key is structured as `userId/projectId/randomUUID-fileName` to ensure
 *   files are organized by user and project, and to prevent filename collisions.
 * - The presigned URL has a limited expiration time (`expiresIn`) to enhance security.
 */
"use server";

import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type ActionState } from "@repo/types";
import { s3Client } from "@/lib/s3";

interface PresignedUrlData {
  url: string;
  key: string;
}

/**
 * Creates a presigned URL for uploading a file directly to the S3 datasets bucket.
 *
 * @param projectId - The ID of the project the dataset will belong to.
 * @param fileName - The original name of the file being uploaded.
 * @param fileType - The MIME type of the file (e.g., 'text/csv').
 * @returns A promise that resolves to an `ActionState` containing the presigned URL and the unique S3 key.
 */
export async function createPresignedUploadUrlAction(
  projectId: string,
  fileName: string,
  fileType: string,
): Promise<ActionState<PresignedUrlData>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  // 2. Input Validation (Basic)
  if (!projectId || !fileName || !fileType) {
    return {
      isSuccess: false,
      message: "Invalid input: projectId, fileName, and fileType are required.",
    };
  }

  // 3. Generate a unique key for the S3 object to prevent file collisions.
  // The key structure ensures data is partitioned by user and project.
  const key = `${userId}/${projectId}/${randomUUID()}-${fileName}`;

  try {
    // 4. Create an S3 command for the PutObject operation.
    const command = new PutObjectCommand({
      Bucket: process.env.S3_DATASETS_BUCKET!,
      Key: key,
      ContentType: fileType,
      // You can add other parameters like ACL, Metadata, etc. if needed.
    });

    // 5. Generate the presigned URL, which is valid for 10 minutes (600 seconds).
    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return {
      isSuccess: true,
      message: "Presigned URL created successfully",
      data: { url, key },
    };
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    // This could be due to misconfigured AWS credentials, bucket policies, etc.
    return { isSuccess: false, message: "Failed to create presigned URL." };
  }
}

