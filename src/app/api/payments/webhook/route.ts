import { NextRequest, NextResponse } from "next/server";
import { getAPS } from "@/services/amazon-payment-services";
import { getPaymentByMerchantReference, updatePaymentStatus } from "@/services/bnoon-api/payments";
import { APS_RESPONSE_CODES } from "@/models/PaymentModel";
import type { PaymentStatus } from "@/services/bnoon-api/types";

/**
 * APS Webhook (IPN - Instant Payment Notification)
 *
 * This endpoint receives server-to-server notifications from APS for:
 * - Payment captures
 * - Payment voids
 * - Refunds
 * - Chargebacks
 * - Authorization updates
 *
 * Unlike the callback route (browser redirect), this is called directly
 * by APS servers and must return quickly with a 200 OK response.
 */

// Map APS command to our payment status
function mapCommandToStatus(command: string, responseCode: string): PaymentStatus {
  const isSuccess = responseCode === APS_RESPONSE_CODES.SUCCESS ||
                    responseCode === APS_RESPONSE_CODES.AUTHORIZATION_SUCCESS;

  switch (command) {
    case "AUTHORIZATION":
      return isSuccess ? "authorized" : "failed";
    case "PURCHASE":
    case "CAPTURE":
      return isSuccess ? "captured" : "failed";
    case "VOID_AUTHORIZATION":
      return isSuccess ? "cancelled" : "failed";
    case "REFUND":
      return isSuccess ? "refunded" : "failed";
    default:
      return isSuccess ? "captured" : "failed";
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const contentType = request.headers.get("content-type") || "";
    let params: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
    } else if (contentType.includes("application/json")) {
      params = await request.json();
    } else {
      // Try to parse as form data by default (APS typically sends form-urlencoded)
      const text = await request.text();
      const urlParams = new URLSearchParams(text);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    console.log("[APS Webhook] Received notification:", {
      command: params.command,
      merchant_reference: params.merchant_reference,
      response_code: params.response_code,
      response_message: params.response_message,
      fort_id: params.fort_id,
    });

    // Verify the signature
    const aps = getAPS();
    const isValid = aps.verifyCallback(params);

    if (!isValid) {
      console.error("[APS Webhook] Invalid signature");
      // Still return 200 to prevent APS from retrying
      // But log the security event
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 200 }
      );
    }

    const merchantReference = params.merchant_reference;
    const responseCode = params.response_code;
    const command = params.command || "PURCHASE";
    const fortId = params.fort_id;

    if (!merchantReference) {
      console.error("[APS Webhook] Missing merchant_reference");
      return NextResponse.json(
        { success: false, error: "Missing merchant reference" },
        { status: 200 }
      );
    }

    // Get the existing payment record from bnoon-api
    const payment = await getPaymentByMerchantReference(merchantReference);

    if (!payment) {
      console.error("[APS Webhook] Payment not found:", merchantReference);
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 200 }
      );
    }

    // Determine the new status based on the command and response code
    const newStatus = mapCommandToStatus(command, responseCode);

    // Update payment record in bnoon-api
    await updatePaymentStatus(merchantReference, {
      status: newStatus,
      fortId: fortId || payment.fortId || undefined,
      responseCode: responseCode || undefined,
      responseMessage: params.response_message || undefined,
      apsResponse: params,
    });

    console.log("[APS Webhook] Payment updated:", {
      merchantReference,
      command,
      newStatus,
      responseCode,
    });

    // Handle specific events
    if (command === "REFUND" && newStatus === "refunded") {
      // TODO: Handle refund - notify patient, update appointment status, etc.
      console.log("[APS Webhook] Refund processed for:", merchantReference);
    }

    if (command === "VOID_AUTHORIZATION" && newStatus === "cancelled") {
      // TODO: Handle void - update appointment status, etc.
      console.log("[APS Webhook] Authorization voided for:", merchantReference);
    }

    // Always return 200 OK to acknowledge receipt
    // APS will retry if it doesn't receive a 200 response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[APS Webhook] Error processing webhook:", error);

    // Still return 200 to prevent infinite retries
    // The error is logged and can be investigated
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 200 }
    );
  }
}

// APS may send GET requests for webhook validation
export async function GET() {
  return NextResponse.json({ status: "ok", service: "aps-webhook" });
}
