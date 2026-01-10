import { introspectToken } from "@/services/bnoon-api";
import { AUTH_TOKEN_NAME } from "@/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Get current authenticated user by validating the httpOnly auth-token cookie.
 *
 * This endpoint allows client-side code to check authentication status
 * since httpOnly cookies cannot be read from JavaScript.
 *
 * Returns:
 * - isAuthenticated: true + user data if token is valid
 * - isAuthenticated: false if no token or invalid token
 */
export async function GET() {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get(AUTH_TOKEN_NAME)?.value;

    // No token - not authenticated
    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    // Validate token via introspect endpoint
    const result = await introspectToken(token);

    if (!result.active) {
      // Token is invalid or expired
      // Clear the invalid cookie
      cookiesStore.delete(AUTH_TOKEN_NAME);

      return NextResponse.json({
        isAuthenticated: false,
        reason: result.reason,
        user: null,
      });
    }

    // Token is valid - return user data
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        userId: result.userId?.toString() || result.sub || "",
        phone: result.phone || result.sub || "",
        firstName: result.firstName || "",
        middleName: result.middleName || "",
        lastName: result.lastName || "",
        emailAddress: result.emailAddress || "",
        sex: result.sex,
        iat: result.iat,
        exp: result.exp ?? null,
      },
    });
  } catch (error) {
    console.error("--- auth/me error", error);

    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }
}
