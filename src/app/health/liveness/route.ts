import { NextResponse } from "next/server";

interface LivenessResponse {
  status: "ok" | "unhealthy";
  timestamp: string;
}

/**
 * GET /health/liveness
 *
 * Kubernetes liveness probe endpoint.
 * Checks if the application process is running and responsive.
 * Should return 200 if the process is alive.
 * If this fails, Kubernetes will restart the container.
 */
export async function GET() {
  const response: LivenessResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 200 });
}
