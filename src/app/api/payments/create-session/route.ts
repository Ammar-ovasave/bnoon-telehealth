import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAPS, AmazonPaymentServices } from "@/services/amazon-payment-services";
import { createPayment } from "@/services/bnoon-api/payments";
import { CreatePaymentSessionRequest, CreatePaymentSessionResponse } from "@/models/PaymentModel";

/**
 * POST /api/payments/create-session
 * Initialize a new payment session with Amazon Payment Services
 */
export async function POST(request: Request) {
  try {
    const payload: CreatePaymentSessionRequest = await request.json();
    const url = new URL(request.url);

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

    // Get auth token from cookies for authenticated payment creation
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    if (!authToken) {
      console.log("--- No auth token found for payment creation");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Store pending payment in bnoon-api
    try {
      await createPayment(
        {
          merchantReference,
          amount: payload.amount,
          currency: payload.currency || "SAR",
          customerEmail: payload.email,
          customerName: payload.fullName,
          customerPhone: payload.phoneNumber || "",
          appointmentData: {
            branchId: payload.appointmentData.branchId,
            branchName: payload.appointmentData.branchName,
            serviceId: payload.appointmentData.serviceId,
            serviceName: payload.appointmentData.serviceName,
            resourceId: payload.appointmentData.resourceId,
            doctorName: payload.appointmentData.doctorName,
            startTime: payload.appointmentData.startTime,
            endTime: payload.appointmentData.endTime,
            visitType: payload.appointmentData.visitType,
            fullName: payload.fullName,
            email: payload.email,
            phoneNumber: payload.phoneNumber || "",
            sex: payload.appointmentData.sex,
            dob: payload.appointmentData.dob,
            nationalityId: payload.appointmentData.nationalityId,
            identityIdType: payload.appointmentData.identityIdType,
            identityId: payload.appointmentData.identityId,
          },
        },
        authToken
      );
    } catch (error) {
      console.log("--- Failed to create payment record in bnoon-api", error);
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
      orderDescription: `Virtual Appointment - ${payload.appointmentData.branchId}`,
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
