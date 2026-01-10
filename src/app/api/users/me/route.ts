import { getUser, updateUser, type UpdateUserRequest } from "@/services/bnoon-api";
import { getAuthToken } from "@/lib/getAuthToken";
import { NextResponse } from "next/server";

/**
 * GET /api/users/me
 * Get the current authenticated user profile via bnoon-api
 */
export async function GET() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Call bnoon-api to get user
    const result = await getUser(token);

    // Determine if profile is complete
    const isProfileComplete = Boolean(
      result.user.firstName &&
      result.user.lastName &&
      result.user.emailAddress &&
      result.user.sex !== null
    );

    return NextResponse.json({
      id: result.user.id,
      phone: result.user.phone,
      firstName: result.user.firstName,
      middleName: result.user.middleName,
      lastName: result.user.lastName,
      emailAddress: result.user.emailAddress,
      sex: result.user.sex,
      dob: result.user.dob,
      nationality: result.user.nationality,
      identityIdType: result.user.identityIdType,
      identityId: result.user.identityId,
      preferredLanguage: result.user.preferredLanguage,
      alahsaMRN: result.user.alahsaMRN,
      jeddahMRN: result.user.jeddahMRN,
      riyadhGranadaMRN: result.user.riyadhGranadaMRN,
      riyadhKingSalmanMRN: result.user.riyadhKingSalmanMRN,
      isProfileComplete,
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
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
 * Update the current user's profile via bnoon-api
 */
export async function PATCH(request: Request) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body: UpdateUserRequest = await request.json();

    // Call bnoon-api to update user
    const result = await updateUser(body, token);

    // Determine if profile is complete
    const isProfileComplete = Boolean(
      result.user.firstName &&
      result.user.lastName &&
      result.user.emailAddress &&
      result.user.sex !== null
    );

    return NextResponse.json({
      id: result.user.id,
      phone: result.user.phone,
      firstName: result.user.firstName,
      middleName: result.user.middleName,
      lastName: result.user.lastName,
      emailAddress: result.user.emailAddress,
      sex: result.user.sex,
      dob: result.user.dob,
      nationality: result.user.nationality,
      identityIdType: result.user.identityIdType,
      identityId: result.user.identityId,
      preferredLanguage: result.user.preferredLanguage,
      isProfileComplete,
    });
  } catch (error) {
    console.error("--- update user error", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
