import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAPS, AmazonPaymentServices } from "@/services/amazon-payment-services";
import { createPaymentRecord } from "@/firestore/payments";
import { CreatePaymentSessionRequest, CreatePaymentSessionResponse } from "@/models/PaymentModel";

/**
 * POST /api/payments/create-session
 * Initialize a new payment session with Amazon Payment Services
 */
export async function POST(request: Request) {
  try {
    const payload: CreatePaymentSessionRequest = await request.json();
    const url = new URL(request.url);
    const cookieStore = await cookies();

    // Validate required fields
    if (!payload.amount || !payload.email || !payload.fullName || !payload.appointmentData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount
    if (payload.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Generate unique merchant reference
    const merchantReference = AmazonPaymentServices.generateMerchantReference();

    // Store pending payment in Firestore
    const paymentId = await createPaymentRecord({
      merchantReference,
      amount: payload.amount,
      currency: payload.currency || "SAR",
      status: "pending",
      customerEmail: payload.email,
      customerName: payload.fullName,
      customerPhone: payload.phoneNumber || "",
      appointmentData: payload.appointmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!paymentId) {
      console.log("--- Failed to create payment record");
      return NextResponse.json(
        { success: false, error: "Failed to create payment session" },
        { status: 500 }
      );
    }

    // Initialize APS and create payment session
    const aps = getAPS();
    const locale = payload.locale || "en";

    // Determine return URL based on locale
    const baseUrl = url.origin;
    const returnUrl = `${baseUrl}/${locale}/payment-callback`;

    // Create payment session parameters
    const paymentParams = aps.createPaymentSession({
      merchantReference,
      amount: payload.amount,
      currency: payload.currency || "SAR",
      customerEmail: payload.email,
      customerName: payload.fullName,
      customerPhone: payload.phoneNumber,
      returnUrl,
      language: locale as "en" | "ar",
      orderDescription: `Appointment: ${payload.appointmentData.serviceName}`,
    });

    const response: CreatePaymentSessionResponse = {
      success: true,
      merchantReference,
      paymentParams,
      gatewayUrl: aps.getGatewayUrl(),
    };

    console.log("--- Payment session created", {
      merchantReference,
      amount: payload.amount,
      currency: payload.currency || "SAR",
      sandbox: aps.isSandbox(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.log("--- create-session error", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
