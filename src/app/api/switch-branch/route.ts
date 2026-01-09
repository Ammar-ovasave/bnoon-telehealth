import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";
import { SwitchBranchPayload } from "@/models/SwitchBranchPayload";
import { cookies } from "next/headers";
import { getCurrentUser } from "../current-user/_services";
import { AUTH_TOKEN_NAME } from "@/constants";
import { getOrCreateBranchMrn } from "@/services/auth-service";
import { getUserByPhone } from "@/firestore/users";

export async function POST(request: Request) {
  try {
    const [requestJson, cookieStore, currentUser] = await Promise.all([
      request.json(),
      cookies(),
      getCurrentUser(),
    ]);
    const payload: SwitchBranchPayload = requestJson;
    const clinic = clinicLocations.find((clinic) => clinic.id === payload.branchId);

    if (!payload.branchId) {
      console.log("--- switch branch error: no branch id");
      return Response.error();
    }

    const newBaseAPIURL = clinic?.apiUrl;
    if (!newBaseAPIURL) {
      console.log("--- switch branch error: no matching clinic base url");
      return Response.error();
    }

    // ============================================
    // Case 1: Guest user (not authenticated)
    // Just set the branch cookie
    // ============================================
    if (!currentUser) {
      cookieStore.set("branchAPIURL", newBaseAPIURL);
      return Response.json({});
    }

    // ============================================
    // Case 2: Bnoon user
    // Use lazy patient creation via getOrCreateBranchMrn
    // ============================================
    const userId = currentUser.userId;
    if (!userId) {
      // Invalid token - treat as guest
      console.log("--- switch branch: Invalid token (no userId), treating as guest");
      cookieStore.delete(AUTH_TOKEN_NAME);
      cookieStore.set("branchAPIURL", newBaseAPIURL);
      return Response.json({});
    }

    // Get full user from Firestore
    const bnoonUser = await getUserByPhone(userId);
    if (!bnoonUser) {
      console.log("--- switch branch error: Bnoon user not found in Firestore");
      return Response.error();
    }

    // Get or create FertiSmart patient for this branch
    const branchMrnResult = await getOrCreateBranchMrn(
      bnoonUser,
      payload.branchId as ClinicBranchID
    );

    if (!branchMrnResult) {
      console.log("--- switch branch error: Failed to get/create MRN for branch");
      return Response.error();
    }

    // Set branch cookie and return success
    // Note: We don't update the JWT for Bnoon users - their JWT contains Bnoon data,
    // and FertiSmart MRNs are stored in Firestore branchMappings
    cookieStore.set("branchAPIURL", newBaseAPIURL);
    return Response.json({
      mrn: branchMrnResult.mrn,
      isNew: branchMrnResult.isNew,
    });
  } catch (error) {
    console.log("--- switch branch error", error);
    return Response.error();
  }
}
