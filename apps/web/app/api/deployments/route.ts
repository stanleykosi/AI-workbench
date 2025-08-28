import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDeploymentsForProjectAction } from "@/actions/db/deployments-actions";

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

    const deployments = await getDeploymentsForProjectAction(projectId);

    if (!deployments.isSuccess || !deployments.data) {
      console.error("Failed to fetch deployments:", deployments.message);
      return NextResponse.json(
        { error: deployments.message || "Failed to fetch deployments" },
        { status: 500 }
      );
    }

    // Ensure we return an array
    if (!Array.isArray(deployments.data)) {
      console.error("Deployments data is not an array:", typeof deployments.data);
      return NextResponse.json(
        { error: "Invalid data format returned from database" },
        { status: 500 }
      );
    }

    return NextResponse.json(deployments.data);
  } catch (error) {
    console.error("Error fetching deployments:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 }
    );
  }
}
