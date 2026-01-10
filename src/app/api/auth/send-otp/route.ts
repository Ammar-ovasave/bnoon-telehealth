import { sendOtp } from "@/services/bnoon-api";
import { SESSION_ID_NAME } from "@/constants";
import { cookies } from "next/headers";
import { add } from "date-fns";
import { NextResponse } from "next/server";

interface SendOTPRequest {
  phone: string;
  purpose?: "login" | "verify";
}

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number via bnoon-api
 */
export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const body: SendOTPRequest = await request.json();

    if (!body.phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Get session ID from cookie if exists
    const sessionId = cookiesStore.get(SESSION_ID_NAME)?.value;

    // Call bnoon-api to send OTP
    const result = await sendOtp(
      { phone: body.phone, purpose: body.purpose },
      sessionId
    );

    // Store session ID if returned (for session tracking)
    if (result.sessionId) {
      cookiesStore.set(SESSION_ID_NAME, result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: add(new Date(), { hours: 24 }),
        sameSite: "strict",
      });
    }

    return NextResponse.json({
      success: result.success,
      length: result.length,
      phone: result.phone,
      alreadyVerified: result.alreadyVerified,
    });
  } catch (error) {
    console.error("--- send OTP error", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
