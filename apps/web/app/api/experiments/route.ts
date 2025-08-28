import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getExperimentsForProjectAction } from "@/actions/db/experiments-actions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const experiments = await getExperimentsForProjectAction(projectId);

    if (!experiments.isSuccess || !experiments.data) {
      console.error("Failed to fetch experiments:", experiments.message);
      return NextResponse.json(
        { error: experiments.message || "Failed to fetch experiments" },
        { status: 500 }
      );
    }

    // Ensure we return an array
    if (!Array.isArray(experiments.data)) {
      console.error("Experiments data is not an array:", typeof experiments.data);
      return NextResponse.json(
        { error: "Invalid data format returned from database" },
        { status: 500 }
      );
    }

    return NextResponse.json(experiments.data);
  } catch (error) {
    console.error("Error fetching experiments:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}
