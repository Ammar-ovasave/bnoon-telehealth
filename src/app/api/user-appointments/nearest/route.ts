import { getNearestAppointment } from "@/services/bnoon-api";
import { getAuthToken } from "@/lib/getAuthToken";
import type { ClinicBranchID } from "@/models/ClinicModel";

export interface NearestAppointmentResponse {
  appointment: {
    appointmentId: string;
    branchId: ClinicBranchID;
    startTime: string;
  } | null;
}

/**
 * GET /api/user-appointments/nearest
 *
 * Returns the user's nearest upcoming appointment via bnoon-api
 * Used for auto-selecting branch on manage-appointments page
 */
export async function GET(): Promise<Response> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get nearest appointment from bnoon-api
    const result = await getNearestAppointment(token);

    if (!result.hasUpcomingAppointment || !result.nearestAppointment) {
      return Response.json({ appointment: null } satisfies NearestAppointmentResponse);
    }

    return Response.json({
      appointment: {
        appointmentId: result.nearestAppointment.appointmentId.toString(),
        branchId: result.nearestAppointment.branchId as ClinicBranchID,
        startTime: result.nearestAppointment.startTime,
      },
    } satisfies NearestAppointmentResponse);
  } catch (error) {
    console.log("--- GET /api/user-appointments/nearest error", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
