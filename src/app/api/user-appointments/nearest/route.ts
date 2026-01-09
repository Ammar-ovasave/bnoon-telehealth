import { getCurrentUser } from "../../current-user/_services";
import { getNearestUpcomingAppointmentByPhone } from "@/firestore/appointments";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";

/**
 * Map baseAPIURL to ClinicBranchID
 */
function getBranchIdFromApiUrl(apiUrl: string): ClinicBranchID | null {
  const clinic = clinicLocations.find((c) => c.apiUrl === apiUrl);
  return clinic?.id ?? null;
}

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
 * Returns the user's nearest upcoming appointment from Firestore
 * Used for auto-selecting branch on manage-appointments page
 */
export async function GET(): Promise<Response> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query Firestore for nearest upcoming appointment
    const appointment = await getNearestUpcomingAppointmentByPhone(currentUser.userId);

    if (!appointment) {
      return Response.json({ appointment: null } satisfies NearestAppointmentResponse);
    }

    // Map baseAPIURL to ClinicBranchID
    const branchId = getBranchIdFromApiUrl(appointment.baseAPIURL);

    if (!branchId) {
      // Branch not found (shouldn't happen, but handle gracefully)
      console.log("--- Branch not found for API URL:", appointment.baseAPIURL);
      return Response.json({ appointment: null } satisfies NearestAppointmentResponse);
    }

    return Response.json({
      appointment: {
        appointmentId: appointment.id,
        branchId,
        startTime: appointment.startTime,
      },
    } satisfies NearestAppointmentResponse);
  } catch (error) {
    console.log("--- GET /api/user-appointments/nearest error", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
