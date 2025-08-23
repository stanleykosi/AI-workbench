/**
 * @description
 * This client component provides a dialog with a form for users to fetch financial data
 * directly from the Tiingo API. It manages the UI state for the form, handles submission
 * via a server action, and provides user feedback.
 *
 * Key features:
 * - A dialog-based form for entering Tiingo API parameters (symbol, date range, etc.).
 * - Uses `useFormState` and `useFormStatus` for seamless integration with server actions,
 *   providing loading states and displaying validation or server errors.
 * - Closes the dialog and shows a success toast notification upon successful workflow initiation.
 *
 * @dependencies
 * - `react`: For `useState` and `useEffect`.
 * - `react-dom`: For `useFormState` and `useFormStatus`.
 * - `lucide-react`: For UI icons.
 * - `sonner`: For displaying toast notifications.
 * - `@/components/ui/*`: Various shadcn/ui components for building the form.
 * - `@/actions/workflow/data-fetching-actions`: The server action to start the workflow.
 */
"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { startDataFetchingAction } from "@/actions/workflow/data-fetching-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <DownloadIcon className="mr-2 animate-spin" />}
      {pending ? "Fetching..." : "Fetch Data"}
    </Button>
  );
}

export function FetchTiingoDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [formKey, setFormKey] = React.useState(Date.now()); // To reset the form
  const [state, formAction] = useFormState(startDataFetchingAction, {
    isSuccess: false,
    message: "",
  });

  React.useEffect(() => {
    if (state?.isSuccess) {
      toast.success(state.message);
      setOpen(false);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormKey(Date.now()); // Reset form state on close
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DownloadIcon className="mr-2" />
          Fetch from Tiingo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fetch Data from Tiingo</DialogTitle>
          <DialogDescription>
            Enter the details for the financial data you want to fetch.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />

          <div className="space-y-2">
            <Label htmlFor="dataType">Data Type</Label>
            <Select name="dataType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              name="symbol"
              placeholder="e.g., btcusd or AAPL"
              required
            />
            <p className="text-xs text-muted-foreground">
              <strong>Stocks:</strong> Use ticker symbols like AAPL, MSFT, GOOGL<br />
              <strong>Crypto:</strong> Use trading pairs like btcusd, ethusd, btceur
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input name="endDate" type="date" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Input name="frequency" placeholder="e.g., 1day or daily" required />
            <p className="text-xs text-muted-foreground">
              <strong>Supported:</strong> 1min, 5min, 15min, 30min, 1hour, 1day, 1week, 1month<br />
              <strong>Alternative:</strong> daily, weekly, monthly
            </p>
          </div>

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
