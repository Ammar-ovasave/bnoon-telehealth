import { cookies } from "next/headers";
import { getAuthToken } from "@/lib/getAuthToken";
import { getUser } from "@/services/bnoon-api";
import { ClinicBranchID } from "@/models/ClinicModel";

/**
 * GET /api/get-patient
 * Get patient data for the current user.
 * Now returns user data from bnoon-api instead of FertiSmart.
 */
export async function GET() {
  try {
    const cookiesStore = await cookies();
    const branchId = cookiesStore.get("branchId")?.value as ClinicBranchID | undefined;

    if (!branchId) {
      console.log("---- get-patient error: no branch selected");
      return Response.json({ error: "No branch selected" }, { status: 400 });
    }

    const token = await getAuthToken();
    if (!token) {
      // Guest user - no patient data available
      return Response.json(null);
    }

    // Get user data from bnoon-api
    const result = await getUser(token);
    if (!result?.user) {
      return Response.json(null);
    }

    // Get MRN for the selected branch
    const user = result.user;
    let mrn: string | null = null;
    switch (branchId) {
      case "jeddah":
        mrn = user.jeddahMRN;
        break;
      case "al-ahsa":
        mrn = user.alahsaMRN;
        break;
      case "riyadh-granada":
        mrn = user.riyadhGranadaMRN;
        break;
      case "riyadh-king-salman":
        mrn = user.riyadhKingSalmanMRN;
        break;
    }

    // Return patient data in the expected format
    return Response.json({
      mrn: mrn,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
      contactNumber: user.phone,
      email: user.emailAddress,
      sex: user.sex,
      dob: user.dob,
    });
  } catch (error) {
    console.log("---- error getting patient", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
