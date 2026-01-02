import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force dynamic rendering - prevents static caching of health endpoint
export const dynamic = "force-dynamic";

/**
 * Build information loaded from build-info.json (created during Docker build)
 */
interface BuildInfoFile {
  version?: string;
  commit?: string;
  branch?: string;
  buildDate?: string;
  buildNumber?: string;
}

/**
 * Standard health endpoint response format
 * Based on MicroProfile Health spec and Kubernetes best practices
 * @see https://microprofile.io/specifications/microprofile-health/
 */
interface HealthResponse {
  status: "ok" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  build: {
    version: string;
    tag: string;
    date: string;
    number: string;
    git: {
      commit: string;
      shortCommit: string;
      branch: string;
    };
  };
}

// Cache the build info after first read (lazy initialization at runtime)
let cachedBuildInfo: BuildInfoFile | undefined;

/**
 * Load build info at runtime (not build time)
 * This ensures we read build-info.json that's created during Docker build
 */
function getBuildInfo(): BuildInfoFile {
  if (cachedBuildInfo !== undefined) {
    return cachedBuildInfo;
  }

  let buildInfo: BuildInfoFile = {};
  try {
    const buildInfoPath = path.join(process.cwd(), ".next", "build-info.json");
    if (fs.existsSync(buildInfoPath)) {
      buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf-8"));
    }
  } catch {
    // Use empty default on error
  }

  cachedBuildInfo = buildInfo;
  return buildInfo;
}

/**
 * GET /health
 *
 * Main health endpoint that provides comprehensive service status.
 * Used by monitoring systems, load balancers, and deployment verification.
 *
 * Response format follows industry standards (MicroProfile Health, Kubernetes)
 * and is compatible with the CI/CD verify-deployment job.
 */
export async function GET() {
  const buildInfo = getBuildInfo();

  const version = buildInfo.version || process.env.APP_VERSION || "unknown";
  const commit = buildInfo.commit || process.env.GIT_COMMIT || "unknown";
  const branch = buildInfo.branch || process.env.GIT_BRANCH || "unknown";
  const buildDate = buildInfo.buildDate || process.env.BUILD_DATE || "unknown";
  const buildNumber = buildInfo.buildNumber || "unknown";

  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    build: {
      version,
      tag: version, // tag equals version for deployment verification
      date: buildDate,
      number: buildNumber,
      git: {
        commit,
        shortCommit: commit.length > 7 ? commit.substring(0, 7) : commit,
        branch,
      },
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
