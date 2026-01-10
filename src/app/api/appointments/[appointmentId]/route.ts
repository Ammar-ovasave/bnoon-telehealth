import {
  getAppointmentByUuid,
  rescheduleAppointment,
  cancelAppointment,
} from "@/services/bnoon-api";
import { getAuthToken } from "@/lib/getAuthToken";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import type { ClinicBranchID } from "@/models/ClinicModel";

interface RouteParams {
  params: Promise<{
    appointmentId: string;
  }>;
}

/**
 * GET /api/appointments/:appointmentId
 * Get a specific appointment by UUID (via bnoon-api)
 * Syncs status with FertiSmart and returns localized details
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { appointmentId: uuid } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get language from Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    const language = acceptLanguage?.startsWith("en") ? "en" : "ar";

    // Fetch appointment by UUID from bnoon-api (syncs status with FertiSmart)
    const result = await getAppointmentByUuid(uuid, token, language);

    return NextResponse.json(result.appointment);
  } catch (error) {
    console.error("--- get appointment error", error);

    // Handle axios error responses
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || "Failed to get appointment";
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json({ error: "Failed to get appointment" }, { status: 500 });
  }
}

interface UpdateAppointmentPayload {
  type: "reschedule" | "cancel";
  startTime?: string;
  endTime?: string;
}

/**
 * PATCH /api/appointments/:appointmentId
 * Update (reschedule or cancel) an appointment via bnoon-api
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { appointmentId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookiesStore = await cookies();
    const branchId = cookiesStore.get("branchId")?.value as ClinicBranchID | undefined;
    if (!branchId) {
      return NextResponse.json({ error: "No branch selected" }, { status: 400 });
    }

    const payload: UpdateAppointmentPayload = await request.json();

    if (payload.type === "reschedule") {
      if (!payload.startTime || !payload.endTime) {
        return NextResponse.json(
          { error: "startTime and endTime are required for reschedule" },
          { status: 400 }
        );
      }

      const result = await rescheduleAppointment(
        branchId,
        parseInt(appointmentId, 10),
        {
          startTime: payload.startTime,
          endTime: payload.endTime,
        },
        token
      );

      return NextResponse.json(result.appointment);
    } else if (payload.type === "cancel") {
      const result = await cancelAppointment(
        branchId,
        parseInt(appointmentId, 10),
        token
      );

      return NextResponse.json(result.appointment);
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (error) {
    console.error("--- update appointment error", error);

    // Handle axios error responses
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || "Failed to update appointment";
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
