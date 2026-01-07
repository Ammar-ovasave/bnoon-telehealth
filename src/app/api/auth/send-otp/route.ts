import { normalizePhoneNumber } from "@/models/BnoonUser";
import { sendSMS } from "@/services/appointment-services";
import { add } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface SendOTPRequest {
  phone: string;
  purpose?: "login" | "verify";
}

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number (no branch or MRN required)
 * This is the new Bnoon-owned auth flow
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

    const normalizedPhone = normalizePhoneNumber(body.phone);

    // Generate 4-digit OTP
    const code = generateOTP();

    console.log("\n\n🔐 OTP CODE:", code, "for", normalizedPhone, "\n\n");

    // Send SMS
    const smsSent = await sendSMS({
      mobileNumber: normalizedPhone,
      message: `Your Bnoon verification code is: ${code}`,
    });

    if (!smsSent) {
      console.log("⚠️ SMS failed but continuing for testing");
    }

    // Store OTP in httpOnly cookie (5 minute expiry)
    // Store both the code and the phone number for verification
    cookiesStore.set("otpCode", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: add(new Date(), { minutes: 5 }),
      sameSite: "strict",
    });

    cookiesStore.set("otpPhone", normalizedPhone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: add(new Date(), { minutes: 5 }),
      sameSite: "strict",
    });

    return NextResponse.json({
      success: true,
      length: code.length,
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error("--- send OTP error", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

/**
 * Generate a random 4-digit OTP code
 */
function generateOTP(): string {
  return `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
}
