/**
 * @description
 * This file contains the Server Action responsible for initiating a data fetching workflow
 * from the Tiingo API. It connects the Next.js frontend to the Temporal/Python backend.
 *
 * Key features:
 * - `startDataFetchingAction`: A server action that:
 *   1. Authenticates the user with Clerk.
 *   2. Validates the form input using Zod.
 *   3. Starts the `FetchDataWorkflow` in Temporal, passing necessary parameters.
 *   4. Returns a success or error message to the client.
 *
 * @dependencies
 * - `zod`: For validating the incoming form data.
 * - `@clerk/nextjs/server`: For `auth()` to get user session data.
 * - `@repo/types`: The shared `ActionState` type.
 * - `@/lib/temporal`: The singleton Temporal client instance.
 * - `next/cache`: For revalidating the datasets page path on success.
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { type ActionState } from "@repo/types";
import { temporalClient } from "@/lib/temporal";

// Schema for validating the form data for fetching Tiingo data.
const FetchDataSchema = z.object({
  projectId: z.string().uuid("Invalid project ID."),
  dataType: z.enum(["stock", "crypto"], {
    required_error: "Data type is required.",
  }),
  symbol: z
    .string()
    .min(1, "Symbol cannot be empty.")
    .refine((val) => {
      const symbol = val.toLowerCase().trim();
      // Remove any spaces and special characters except alphanumeric
      const cleanSymbol = symbol.replace(/[^a-z0-9]/g, '');
      return cleanSymbol.length >= 1;
    }, "Symbol contains invalid characters. Use only letters and numbers.")
    .transform((val) => val.toLowerCase().trim()),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format.")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date <= today;
    }, "Start date cannot be in the future."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format.")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date <= today;
    }, "End date cannot be in the future."),
  frequency: z.string().min(1, "Frequency cannot be empty.")
    .refine((val) => {
      const freq = val.toLowerCase().trim();
      // Tiingo supports: 1min, 5min, 15min, 30min, 1hour, 1week, 1month
      const validFrequencies = [
        '1min', '5min', '15min', '30min', '1hour', '1week', '1month',
        'daily', 'weekly', 'monthly' // Alternative formats
      ];
      return validFrequencies.includes(freq);
    }, "Invalid frequency. Use: 1min, 5min, 15min, 30min, 1hour, 1week, 1month, daily, weekly, or monthly."),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return startDate <= endDate;
}, {
  message: "Start date must be before or equal to end date.",
  path: ["endDate"], // This will show the error on the endDate field
});

/**
 * Initiates a data fetching workflow from Tiingo.
 *
 * @param prevState - The previous state of the form action.
 * @param formData - The `FormData` object submitted by the form.
 * @returns A promise that resolves to an `ActionState` indicating success or failure.
 */
export async function startDataFetchingAction(
  prevState: any,
  formData: FormData,
): Promise<ActionState<null>> {
  const { userId } = auth();

  // 1. Authentication Check
  if (!userId) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  // 2. Input Validation
  const validatedFields = FetchDataSchema.safeParse({
    projectId: formData.get("projectId"),
    dataType: formData.get("dataType"),
    symbol: formData.get("symbol"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    frequency: formData.get("frequency"),
  });

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      message: validatedFields.error.errors[0]?.message ?? "Invalid input.",
    };
  }
  const { projectId, ...fetchParams } = validatedFields.data;

  try {
    // 3. Start Temporal Workflow
    const workflowId = `fetch-${projectId}-${fetchParams.symbol}-${Date.now()}`;

    await temporalClient.workflow.start("FetchDataWorkflow", {
      taskQueue: "ml-training-task-queue", // Re-using the same task queue for now
      workflowId,
      args: [
        {
          project_id: projectId,
          user_id: userId,
          // Convert camelCase form data to the snake_case expected by Python dataclass
          data_type: fetchParams.dataType,
          symbol: fetchParams.symbol,
          start_date: fetchParams.startDate,
          end_date: fetchParams.endDate,
          frequency: fetchParams.frequency,
        },
      ],
    });

    // 4. Revalidate and respond
    revalidatePath(`/dashboard/projects/${projectId}/datasets`);

    return {
      isSuccess: true,
      message:
        "Data fetching workflow started. The new dataset will appear shortly.",
    };
  } catch (error) {
    console.error("Error starting data fetching workflow:", error);
    return {
      isSuccess: false,
      message: "Failed to start data fetching workflow.",
    };
  }
}
