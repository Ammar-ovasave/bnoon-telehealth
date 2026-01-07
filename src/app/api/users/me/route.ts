import { isProfileComplete, UpdateBnoonUserPayload } from "@/models/BnoonUser";
import { getUserByPhone, updateUser } from "@/firestore/users";
import { verifyBnoonToken } from "@/lib/verifyToken";
import { signBnoonJwt } from "@/services/signJwt";
import { syncUserToAllBranches } from "@/services/auth-service";
import { AUTH_TOKEN_NAME } from "@/constants";
import { add } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/users/me
 * Get the current authenticated Bnoon user profile
 */
export async function GET() {
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

    // Get user from Firestore
    const user = await getUserByPhone(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      sex: user.sex,
      dob: user.dob,
      nationality: user.nationality,
      identityIdType: user.identityIdType,
      identityId: user.identityId,
      preferredLanguage: user.preferredLanguage,
      branchMappings: user.branchMappings,
      isProfileComplete: isProfileComplete(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("--- get user error", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 * Update the current user's profile
 * Also syncs changes to all FertiSmart branches where user has records
 */
export async function PATCH(request: Request) {
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

    const body: UpdateBnoonUserPayload = await request.json();

    // Update user in Firestore
    const updatedUser = await updateUser(payload.userId, body);

    // Sync to all FertiSmart branches
    const syncResults = await syncUserToAllBranches(updatedUser);

    // Log any sync failures (but don't fail the request)
    const failedSyncs = syncResults.filter((r) => !r.success);
    if (failedSyncs.length > 0) {
      console.warn("Some branch syncs failed:", failedSyncs);
    }

    // Re-sign JWT with updated data
    const newToken = signBnoonJwt(updatedUser);

    // Update auth token cookie
    cookiesStore.set(AUTH_TOKEN_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: add(new Date(), { years: 1 }),
      sameSite: "strict",
    });

    return NextResponse.json({
      id: updatedUser.id,
      phone: updatedUser.phone,
      firstName: updatedUser.firstName,
      middleName: updatedUser.middleName,
      lastName: updatedUser.lastName,
      emailAddress: updatedUser.emailAddress,
      sex: updatedUser.sex,
      dob: updatedUser.dob,
      nationality: updatedUser.nationality,
      identityIdType: updatedUser.identityIdType,
      identityId: updatedUser.identityId,
      preferredLanguage: updatedUser.preferredLanguage,
      branchMappings: updatedUser.branchMappings,
      isProfileComplete: isProfileComplete(updatedUser),
      syncResults: syncResults.map((r) => ({
        branchId: r.branchId,
        success: r.success,
      })),
    });
  } catch (error) {
    console.error("--- update user error", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
