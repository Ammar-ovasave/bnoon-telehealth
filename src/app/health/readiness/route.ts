import { NextResponse } from "next/server";

interface ReadinessResponse {
  status: "ok" | "not_ready";
  timestamp: string;
  checks: {
    server: "ok" | "fail";
  };
}

/**
 * GET /health/readiness
 *
 * Kubernetes readiness probe endpoint.
 * Checks if the application is ready to accept traffic.
 * If this fails, Kubernetes will stop routing traffic to this pod.
 *
 * For Next.js frontend, we check:
 * - Server is responding (implicit by handling request)
 *
 * Note: Unlike backend services, Next.js frontend doesn't typically
 * need to check database or external service connections here
 * since those are handled by the API backend.
 */
export async function GET() {
  const checks = {
    server: "ok" as const,
  };

  const allHealthy = Object.values(checks).every((status) => status === "ok");

  const response: ReadinessResponse = {
    status: allHealthy ? "ok" : "not_ready",
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(response, { status: allHealthy ? 200 : 503 });
}
