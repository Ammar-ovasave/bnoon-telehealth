import { cookies } from "next/headers";
import { getCurrentUser } from "../current-user/_services";
import { getPatient } from "@/services/appointment-services";
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
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;

    if (!baseAPIURL) {
      console.log("---- get-patient error: no branch selected");
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    // ============================================
    // Case 1: Guest user (not authenticated)
    // Return null - no patient data available
    // ============================================
    if (!currentUser) {
      return Response.json(null);
    }

    // ============================================
    // Case 2: Bnoon user
    // Get existing MRN from Firestore branchMappings (DO NOT create)
    // ============================================
    const userId = currentUser.userId;
    const branchId = getBranchIdFromApiUrl(baseAPIURL);

    if (!branchId) {
      console.log("---- get-patient error: invalid branch URL");
      return Response.json({ error: "Invalid branch" }, { status: 400 });
    }

    // Get full user from Firestore
    const bnoonUser = await getUserByPhone(userId);
    if (!bnoonUser) {
      // User not in Firestore yet - return null (no patient data)
      return Response.json(null);
    }

    // Check if user already has an MRN for this branch
    const existingMapping = bnoonUser.branchMappings?.[branchId];
    if (!existingMapping?.mrn) {
      // No patient record for this branch yet - return null
      // Patient will be created when they submit the appointment form
      return Response.json(null);
    }

    const mrn = existingMapping.mrn;
    const patient = await getPatient({ mrn, baseAPIURL });
    if (!patient) {
      console.log("---- get-patient error: patient not found in FertiSmart");
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json(patient);
  } catch (error) {
    console.log("---- error getting patient", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
