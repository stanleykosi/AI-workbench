import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { datasetsTable, tiingoFetchesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DatasetDetails } from "./_components/dataset-details";

interface DatasetPageProps {
  params: {
    projectId: string;
    datasetId: string;
  };
}

export async function generateMetadata({
  params,
}: DatasetPageProps): Promise<Metadata> {
  const dataset = await db.query.datasetsTable.findFirst({
    where: eq(datasetsTable.id, params.datasetId),
  });

  if (!dataset) {
    return {
      title: "Dataset Not Found",
    };
  }

  return {
    title: `${dataset.name} - Dataset Details`,
    description: `View details for dataset ${dataset.name}`,
  };
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { userId } = auth();
  if (!userId) {
    notFound();
  }

  // Fetch the dataset
  const dataset = await db.query.datasetsTable.findFirst({
    where: eq(datasetsTable.id, params.datasetId),
  });

  if (!dataset) {
    notFound();
  }

  // If it's a Tiingo dataset, fetch the fetch details manually
  let tiingoFetch = null;
  if (dataset.tiingoFetchId) {
    const fetchData = await db.query.tiingoFetchesTable.findFirst({
      where: eq(tiingoFetchesTable.id, dataset.tiingoFetchId),
    });
    tiingoFetch = fetchData || null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dataset.name}</h1>
          <p className="text-muted-foreground">
            Dataset details and information
          </p>
        </div>
      </div>

      <DatasetDetails dataset={dataset} tiingoFetch={tiingoFetch} />
    </div>
  );
}
