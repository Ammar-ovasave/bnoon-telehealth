import { verifyOtp } from "@/services/bnoon-api";
import { AUTH_TOKEN_NAME, SESSION_ID_NAME } from "@/constants";
import { add } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface VerifyOTPRequest {
  phone: string;
  code: string;
  preferredLanguage?: "ar" | "en";
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP code via bnoon-api and authenticate user
 *
 * For returning users: Sets auth-token cookie and returns user data
 * For new guests: Keeps session-id cookie and returns sessionId (no token/user)
 */
export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const body: VerifyOTPRequest = await request.json();

    if (!body.phone || !body.code) {
      return NextResponse.json(
        { error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    // Get session ID from cookie
    const sessionId = cookiesStore.get(SESSION_ID_NAME)?.value;

    // Call bnoon-api to verify OTP
    const result = await verifyOtp(
      {
        phone: body.phone,
        code: body.code,
        preferredLanguage: body.preferredLanguage,
      },
      sessionId
    );

    // NEW GUEST: No token/user, only sessionId
    // User will complete registration when they submit the patient info form
    if (result.isNew && !result.token && result.sessionId) {
      // Keep sessionId in cookie for use in complete-registration (extend expiry)
      cookiesStore.set(SESSION_ID_NAME, result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: add(new Date(), { minutes: 30 }), // Session TTL
        sameSite: "strict",
      });

      return NextResponse.json({
        success: result.success,
        isNew: true,
        isProfileComplete: false,
        sessionId: result.sessionId,
        user: null,
      });
    }

    // RETURNING USER: Has token and user data
    if (result.token && result.user) {
      // Store JWT token in httpOnly cookie (1 year expiry)
      cookiesStore.set(AUTH_TOKEN_NAME, result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: add(new Date(), { years: 1 }),
        sameSite: "strict",
      });

      // Clear the session cookie (no longer needed after authentication)
      cookiesStore.delete(SESSION_ID_NAME);

      // Return user data WITH token so client can update auth state directly
      return NextResponse.json({
        success: result.success,
        isNew: result.isNew,
        isProfileComplete: result.isProfileComplete,
        token: result.token, // Include token for client-side auth state update
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
    }

    // Unexpected response format
    console.error("Unexpected verify-otp response format:", result);
    return NextResponse.json(
      { error: "Unexpected response from authentication server" },
      { status: 500 }
    );
  } catch (error) {
    console.error("--- verify OTP error", error);

    // Check if it's a validation error from bnoon-api
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 400) {
        return NextResponse.json(
          { error: axiosError.response.data?.message || "Invalid OTP code" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
