import { getSessionStatus } from "@/services/bnoon-api";
import { AUTH_TOKEN_NAME, SESSION_ID_NAME } from "@/constants";
import { add } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/session-status
 * Get current session status including verified phone and auth data.
 *
 * Used by frontend to check if phone is already verified to skip OTP form.
 * NOTE: Auth token validation is handled globally by AuthProvider.
 *       This endpoint only checks guest session status.
 *
 * If phone is verified in session:
 * - Returning users: Sets auth-token cookie and returns user data
 * - New guests: Keeps session-id cookie and returns sessionId
 */
export async function GET() {
  try {
    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get(SESSION_ID_NAME)?.value;

    const result = await getSessionStatus(sessionId);

    // If phone is verified and we have auth data, set appropriate cookies
    if (result.isPhoneVerified && result.auth) {
      if (result.auth.token && result.auth.user) {
        // RETURNING USER: Set auth-token cookie
        cookiesStore.set(AUTH_TOKEN_NAME, result.auth.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: add(new Date(), { years: 1 }),
          sameSite: "strict",
        });

        // Clear the session cookie (no longer needed after authentication)
        cookiesStore.delete(SESSION_ID_NAME);
      } else if (result.auth.sessionId) {
        // NEW GUEST: Ensure session-id cookie is set/extended
        cookiesStore.set(SESSION_ID_NAME, result.auth.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: add(new Date(), { minutes: 30 }),
          sameSite: "strict",
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("--- session status error", error);

    // Return empty session status on error
    return NextResponse.json({
      hasSession: false,
      phone: null,
      isPhoneVerified: false,
      preferredLanguage: null,
      expiresAt: null,
    });
  }
}
