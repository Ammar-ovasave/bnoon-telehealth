import { cookies } from "next/headers";
import { getAuthToken } from "@/lib/getAuthToken";
import { getAppointments } from "@/services/bnoon-api";
import { ClinicBranchID } from "@/models/ClinicModel";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/get-patient-appointments
 * Get appointments for the current user in the selected branch.
 * Requires branchId query parameter (no cookie fallback).
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // branchId is required as a query parameter
    const branchId = request.nextUrl.searchParams.get("branchId") as ClinicBranchID | null;
    if (!branchId) {
      return NextResponse.json({ error: "branchId query parameter is required" }, { status: 400 });
    }

    // Get language from NEXT_LOCALE cookie or Accept-Language header
    const cookiesStore = await cookies();
    const localeCookie = cookiesStore.get("NEXT_LOCALE")?.value;
    const acceptLanguage = request.headers.get("Accept-Language");
    const language: "ar" | "en" = localeCookie === "en" || acceptLanguage?.startsWith("en") ? "en" : "ar";

    const result = await getAppointments(branchId, token, language);
    return NextResponse.json(result.appointments);
  } catch (error) {
    console.log("---- error getting patient appointments", error);
    return NextResponse.json({ error: "Failed to get appointments" }, { status: 500 });
  }
}
