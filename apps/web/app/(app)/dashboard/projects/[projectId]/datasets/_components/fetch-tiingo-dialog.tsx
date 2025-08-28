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
    <Button type="submit" disabled={pending} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
      {pending && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {pending ? "Fetching Data..." : "Fetch Data"}
    </Button>
  );
}

export function FetchTiingoDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  const [formKey, setFormKey] = React.useState(Date.now()); // To reset the form
  const [dataType, setDataType] = React.useState<string>("");
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
      setDataType(""); // Reset data type
    }
    setOpen(isOpen);
  };

  const getHelperText = () => {
    switch (dataType) {
      case "stock":
        return {
          symbol: "Use ticker symbols like AAPL, MSFT, GOOGL, TSLA, AMZN",
          frequency: "Stocks only support: daily, weekly, monthly (no intraday data)"
        };
      case "crypto":
        return {
          symbol: "Use trading pairs like btcusd, ethusd, solusd, btceur",
          frequency: "Supports: daily, weekly, monthly, 1min, 5min, 15min, 30min, 1hour"
        };
      case "forex":
        return {
          symbol: "Use currency pairs like EURUSD, GBPUSD, USDJPY, AUDCAD",
          frequency: "Supports: daily, weekly, monthly, 1min, 5min, 15min, 30min, 1hour"
        };
      case "iex":
        return {
          symbol: "Use ticker symbols like AAPL, MSFT, GOOGL (real-time data)",
          frequency: "Supports: daily, weekly, monthly, 1min, 5min, 15min, 30min, 1hour"
        };
      default:
        return {
          symbol: "Select a data type first to see symbol examples",
          frequency: "Select a data type first to see frequency options"
        };
    }
  };

  const helperText = getHelperText();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Fetch from Tiingo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Fetch Data from Tiingo</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the details for the financial data you want to fetch from Tiingo&apos;s API.
          </DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />

          <div className="space-y-2">
            <Label htmlFor="dataType" className="text-sm font-medium text-gray-700">Data Type</Label>
            <Select name="dataType" required onValueChange={setDataType}>
              <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Cryptocurrency (supports intraday)</SelectItem>
                <SelectItem value="stock">Stock Market (daily/weekly/monthly only)</SelectItem>
                <SelectItem value="forex">Forex (supports intraday)</SelectItem>
                <SelectItem value="iex">IEX Real-time (supports intraday)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol" className="text-sm font-medium text-gray-700">Symbol</Label>
            <Input
              name="symbol"
              placeholder="e.g., btcusd or AAPL"
              required
              className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>{helperText.symbol}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
              <Input
                name="startDate"
                type="date"
                required
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
              <Input
                name="endDate"
                type="date"
                required
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">Frequency</Label>
            <Input
              name="frequency"
              placeholder="e.g., 1day or daily"
              required
              className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-medium">Supported:</span> {helperText.frequency}</p>
              {dataType === "stock" && (
                <p className="text-amber-600 font-medium">⚠️ Note: Stocks only support daily, weekly, monthly frequencies</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
