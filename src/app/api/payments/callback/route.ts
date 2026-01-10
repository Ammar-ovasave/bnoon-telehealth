import { NextResponse } from "next/server";
import { getAPS } from "@/services/amazon-payment-services";
import { getPaymentByMerchantReference, updatePaymentStatus } from "@/services/bnoon-api/payments";
import { isPaymentSuccess } from "@/models/PaymentModel";

/**
 * POST /api/payments/callback
 * Handle APS redirect after payment completion
 * APS sends payment result as form-encoded data
 */
export async function POST(request: Request) {
  try {
    // APS sends data as application/x-www-form-urlencoded
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("--- APS callback received", {
      merchant_reference: params.merchant_reference,
      response_code: params.response_code,
      status: params.status,
    });

    // Verify APS signature
    const aps = getAPS();
    if (!aps.verifyCallback(params)) {
      console.log("--- APS callback: Invalid signature");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid signature",
          responseCode: "INVALID_SIGNATURE",
        },
        { status: 400 }
      );
    }

    const merchantReference = params.merchant_reference;
    const responseCode = params.response_code;
    const responseMessage = params.response_message;
    const fortId = params.fort_id;

    // Get payment record from bnoon-api
    const paymentRecord = await getPaymentByMerchantReference(merchantReference);

    if (!paymentRecord) {
      console.log("--- APS callback: Payment not found", merchantReference);
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found",
          responseCode: "PAYMENT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Check if payment was successful
    const success = isPaymentSuccess(responseCode);

    // Update payment status in bnoon-api
    await updatePaymentStatus(merchantReference, {
      status: success ? "authorized" : "failed",
      fortId: fortId || undefined,
      responseCode: responseCode || undefined,
      responseMessage: responseMessage || undefined,
    });

    if (success) {
      console.log("--- APS callback: Payment successful", {
        merchantReference,
        fortId,
      });

      // Return success - the frontend page will handle appointment creation
      return NextResponse.json({
        success: true,
        merchantReference,
        fortId,
        responseCode,
        appointmentData: paymentRecord.appointmentData,
      });
    } else {
      console.log("--- APS callback: Payment failed", {
        merchantReference,
        responseCode,
        responseMessage,
      });

      return NextResponse.json({
        success: false,
        merchantReference,
        responseCode,
        responseMessage,
      });
    }
  } catch (error) {
    console.log("--- APS callback error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Callback processing failed",
        responseCode: "PROCESSING_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/callback
 * Some payment gateways redirect with GET
 * Handle the same way as POST
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log("--- APS callback (GET) received", {
      merchant_reference: params.merchant_reference,
      response_code: params.response_code,
    });

    // Verify APS signature
    const aps = getAPS();
    if (!aps.verifyCallback(params)) {
      console.log("--- APS callback (GET): Invalid signature");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid signature",
          responseCode: "INVALID_SIGNATURE",
        },
        { status: 400 }
      );
    }

    const merchantReference = params.merchant_reference;
    const responseCode = params.response_code;
    const responseMessage = params.response_message;
    const fortId = params.fort_id;

    // Get payment record from bnoon-api
    const paymentRecord = await getPaymentByMerchantReference(merchantReference);

    if (!paymentRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found",
          responseCode: "PAYMENT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const success = isPaymentSuccess(responseCode);

    await updatePaymentStatus(merchantReference, {
      status: success ? "authorized" : "failed",
      fortId: fortId || undefined,
      responseCode: responseCode || undefined,
      responseMessage: responseMessage || undefined,
    });

    return NextResponse.json({
      success,
      merchantReference,
      fortId,
      responseCode,
      responseMessage,
      appointmentData: success ? paymentRecord.appointmentData : undefined,
    });
  } catch (error) {
    console.log("--- APS callback (GET) error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Callback processing failed",
        responseCode: "PROCESSING_ERROR",
      },
      { status: 500 }
    );
  }
}
