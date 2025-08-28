"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadIcon, CalendarIcon, DatabaseIcon, FileTextIcon, ExternalLinkIcon } from "lucide-react";
import { type SelectDataset, type SelectTiingoFetch } from "@/db/schema";

interface DatasetDetailsProps {
  dataset: SelectDataset;
  tiingoFetch: SelectTiingoFetch | null;
}

export function DatasetDetails({ dataset, tiingoFetch }: DatasetDetailsProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "tiingo":
        return <ExternalLinkIcon className="h-4 w-4" />;
      case "upload":
        return <FileTextIcon className="h-4 w-4" />;
      default:
        return <DatabaseIcon className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "tiingo":
        return "Tiingo API";
      case "upload":
        return "File Upload";
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Dataset Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Dataset Information
          </CardTitle>
          <CardDescription>
            Basic details about this dataset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold">{dataset.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(dataset.status)}>
                  {dataset.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Source</label>
              <div className="flex items-center gap-2 mt-1">
                {getSourceIcon(dataset.source)}
                <span>{getSourceLabel(dataset.source)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <div className="flex items-center gap-2 mt-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(dataset.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiingo Fetch Details */}
      {tiingoFetch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLinkIcon className="h-5 w-5" />
              Tiingo API Fetch Details
            </CardTitle>
            <CardDescription>
              Parameters used to fetch this data from Tiingo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data Type</label>
                <p className="text-lg font-semibold capitalize">{tiingoFetch.dataType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Symbol</label>
                <p className="text-lg font-semibold">{tiingoFetch.symbol}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-lg">{tiingoFetch.startDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-lg">{tiingoFetch.endDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                <p className="text-lg">{tiingoFetch.frequency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fetched On</label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(tiingoFetch.createdAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            Download Dataset
          </CardTitle>
          <CardDescription>
            Download this dataset to your local machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download Dataset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
