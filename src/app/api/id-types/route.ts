import { getIdTypes } from "@/services/bnoon-api";
import { NextResponse } from "next/server";

/**
 * GET /api/id-types
 * Get list of ID types via bnoon-api
 */
export async function GET() {
  try {
    const result = await getIdTypes();

    return NextResponse.json(result.idTypes);
  } catch (error) {
    console.error("--- get id-types error", error);
    return NextResponse.json(
      { error: "Failed to get ID types" },
      { status: 500 }
    );
  }
}
