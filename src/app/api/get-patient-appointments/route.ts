import { cookies } from "next/headers";
import { getCurrentUser } from "../current-user/_services";
import { getPatientAppointments } from "@/services/appointment-services";
import { getUserByPhone } from "@/firestore/users";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";

/**
 * Get branchId from the API URL
 */
function getBranchIdFromApiUrl(apiUrl: string): ClinicBranchID | null {
  const clinic = clinicLocations.find((c) => c.apiUrl === apiUrl);
  return clinic?.id ?? null;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.userId) {
      return Response.error();
    }
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    if (!baseAPIURL) {
      return Response.error();
    }

    const branchId = getBranchIdFromApiUrl(baseAPIURL);
    if (!branchId) {
      return Response.error();
    }

    // Get user's MRN for this branch from Firestore
    const user = await getUserByPhone(currentUser.userId);
    const userMrn = user?.branchMappings?.[branchId]?.mrn;
    if (!userMrn) {
      // User doesn't have an MRN for this branch yet - return empty array
      return Response.json([]);
    }

    const appointments = await getPatientAppointments({ mrn: userMrn, baseAPIURL: baseAPIURL });
    if (!appointments) {
      return Response.error();
    }
    return Response.json(appointments);
  } catch (error) {
    console.log("---- error getting patient appointments", error);
    return Response.error();
  }
}
