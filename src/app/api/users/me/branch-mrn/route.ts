import { getUserByPhone } from "@/firestore/users";
import { verifyBnoonToken } from "@/lib/verifyToken";
import { getOrCreateBranchMrn } from "@/services/auth-service";
import { AUTH_TOKEN_NAME } from "@/constants";
import { ClinicBranchID } from "@/models/ClinicModel";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface BranchMrnRequest {
  branchId: ClinicBranchID;
  patientName?: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
}

/**
 * POST /api/users/me/branch-mrn
 * Get or create FertiSmart MRN for a specific branch
 * This implements the lazy patient creation pattern
 */
export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get(AUTH_TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyBnoonToken({
      token,
      secret: process.env.JWT_SECRET ?? "",
    });

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body: BranchMrnRequest = await request.json();

    if (!body.branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 }
      );
    }

    // Get fresh user data from Firestore
    const user = await getUserByPhone(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get or create MRN for the branch
    const result = await getOrCreateBranchMrn(user, body.branchId, body.patientName);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to get or create MRN for branch" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      branchId: body.branchId,
      mrn: result.mrn,
      isNew: result.isNew,
      fertiSmartBranchId: result.fertiSmartBranchId,
    });
  } catch (error) {
    console.error("--- branch-mrn error", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
