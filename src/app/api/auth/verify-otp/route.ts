import { normalizePhoneNumber, isProfileComplete } from "@/models/BnoonUser";
import { getOrCreateUser } from "@/firestore/users";
import { signBnoonJwt } from "@/services/signJwt";
import { AUTH_TOKEN_NAME } from "@/constants";
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
 * Verify OTP code and authenticate user
 * Creates new Bnoon user if first time, otherwise returns existing user
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

    const normalizedPhone = normalizePhoneNumber(body.phone);

    // Get stored OTP from cookie
    const storedCode = cookiesStore.get("otpCode")?.value;
    const storedPhone = cookiesStore.get("otpPhone")?.value;

    // Verify the code matches
    if (!storedCode || !storedPhone) {
      return NextResponse.json(
        { error: "OTP expired or not found. Please request a new code." },
        { status: 400 }
      );
    }

    if (storedPhone !== normalizedPhone) {
      return NextResponse.json(
        { error: "Phone number mismatch. Please request a new code." },
        { status: 400 }
      );
    }

    if (storedCode !== body.code) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Clear OTP cookies after successful verification
    cookiesStore.delete("otpCode");
    cookiesStore.delete("otpPhone");

    // Get or create user in Firestore
    const { user, isNew } = await getOrCreateUser(normalizedPhone, body.preferredLanguage);

    // Sign JWT with user data
    const token = signBnoonJwt(user);

    // Set auth token cookie (1 year expiry)
    cookiesStore.set(AUTH_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: add(new Date(), { years: 1 }),
      sameSite: "strict",
    });

    // Check if profile is complete
    const profileComplete = isProfileComplete(user);

    return NextResponse.json({
      success: true,
      isNew,
      isProfileComplete: profileComplete,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        sex: user.sex,
        branchMappings: user.branchMappings,
      },
    });
  } catch (error) {
    console.error("--- verify OTP error", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
