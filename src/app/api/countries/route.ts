import { getCountries } from "@/services/bnoon-api";
import { NextResponse } from "next/server";

/**
 * GET /api/countries
 * Get list of countries via bnoon-api
 */
export async function GET() {
  try {
    const result = await getCountries();

    return NextResponse.json(result.countries);
  } catch (error) {
    console.error("--- get countries error", error);
    return NextResponse.json(
      { error: "Failed to get countries" },
      { status: 500 }
    );
  }
}
