import { completeRegistration } from "@/services/bnoon-api";
import { AUTH_TOKEN_NAME, SESSION_ID_NAME } from "@/constants";
import { add } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface CompleteRegistrationRequest {
  fullName: string;
  email?: string;
  preferredLanguage?: "ar" | "en";
}

/**
 * POST /api/auth/complete-registration
 * Complete registration for new guests by creating user with profile data.
 *
 * This endpoint is called after OTP verification for new guests.
 * It reads the session-id cookie and calls bnoon-api to create the user.
 */
export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const body: CompleteRegistrationRequest = await request.json();

    if (!body.fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Get session ID from cookie
    const sessionId = cookiesStore.get(SESSION_ID_NAME)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session expired. Please verify your phone again." },
        { status: 400 }
      );
    }

    // Call bnoon-api to complete registration
    const result = await completeRegistration({
      sessionId,
      fullName: body.fullName,
      email: body.email,
      preferredLanguage: body.preferredLanguage,
    });

    // Store JWT token in httpOnly cookie (1 year expiry)
    cookiesStore.set(AUTH_TOKEN_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: add(new Date(), { years: 1 }),
      sameSite: "strict",
    });

    // Clear the session cookie (no longer needed after authentication)
    cookiesStore.delete(SESSION_ID_NAME);

    // Return user data
    return NextResponse.json({
      success: result.success,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        firstName: result.user.firstName,
        middleName: result.user.middleName,
        lastName: result.user.lastName,
        emailAddress: result.user.emailAddress,
        sex: result.user.sex,
        alahsaMRN: result.user.alahsaMRN,
        jeddahMRN: result.user.jeddahMRN,
        riyadhGranadaMRN: result.user.riyadhGranadaMRN,
        riyadhKingSalmanMRN: result.user.riyadhKingSalmanMRN,
      },
    });
  } catch (error) {
    console.error("--- complete registration error", error);

    // Check if it's a validation error from bnoon-api
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError.response?.status === 400) {
        return NextResponse.json(
          {
            error:
              axiosError.response.data?.message ||
              "Session expired. Please verify your phone again.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 }
    );
  }
}
