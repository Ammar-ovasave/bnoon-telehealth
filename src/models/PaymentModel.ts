/**
 * Amazon Payment Services (APS) integration types
 * For Saudi Arabia (MENA region)
 */

export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded" | "cancelled";

/**
 * Pending appointment data stored with payment before appointment is created
 * Uses the new bnoon-api format (no MRN required, patient created internally)
 */
export interface PendingAppointmentData {
  branchId: string; // e.g., "jeddah", "riyadh-granada"
  branchName?: string;
  serviceId: number;
  serviceName?: string;
  resourceId: number; // Single doctor ID
  doctorName?: string;
  startTime: string;
  endTime: string;
  visitType: "virtual" | "in-person";
  fullName?: string;
  email?: string | null;
  phoneNumber?: string;
  sex?: 0 | 1;
  dob?: string;
  nationalityId?: number;
  identityIdType?: number;
  identityId?: string;
}

/**
 * Request to create a new payment session
 */
export interface CreatePaymentSessionRequest {
  amount: number;
  currency: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  appointmentData: PendingAppointmentData;
  locale: "en" | "ar";
}

/**
 * Response from creating a payment session
 */
export interface CreatePaymentSessionResponse {
  success: boolean;
  merchantReference: string;
  paymentParams: Record<string, string>;
  gatewayUrl: string;
  error?: string;
}

/**
 * Payment record stored in Firestore
 */
export interface PaymentRecord {
  id: string;
  merchantReference: string;
  fortId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  appointmentId?: string;
  appointmentData: PendingAppointmentData;
  responseCode?: string;
  responseMessage?: string;
  apsResponse?: Record<string, string>; // Full APS response for debugging/auditing
  createdAt: string;
  updatedAt: string;
}

/**
 * APS callback response parameters
 */
export interface APSCallbackParams {
  merchant_reference: string;
  fort_id?: string;
  response_code: string;
  response_message: string;
  status: string;
  signature: string;
  amount?: string;
  currency?: string;
  customer_email?: string;
  payment_option?: string;
  card_number?: string;
  expiry_date?: string;
  card_holder_name?: string;
  authorization_code?: string;
  eci?: string;
  token_name?: string;
}

/**
 * APS response codes
 * https://paymentservices.amazon.com/docs/EN/12.html
 */
export const APS_RESPONSE_CODES = {
  SUCCESS: "14000",
  AUTHORIZATION_SUCCESS: "02000",
  AUTHORIZATION_FAILED: "14045",
  AUTHENTICATION_FAILED: "14046",
  TRANSACTION_DECLINED: "14045",
  CANCELLED_BY_USER: "00043",
  SESSION_EXPIRED: "00044",
  INVALID_SIGNATURE: "00014",
  TECHNICAL_ERROR: "00001",
} as const;

/**
 * Check if payment was successful based on response code
 */
export function isPaymentSuccess(responseCode: string): boolean {
  return (
    responseCode === APS_RESPONSE_CODES.SUCCESS ||
    responseCode === APS_RESPONSE_CODES.AUTHORIZATION_SUCCESS
  );
}

/**
 * Get user-friendly error message for APS response codes
 */
export function getPaymentErrorMessage(responseCode: string, locale: "en" | "ar"): string {
  const messages: Record<string, { en: string; ar: string }> = {
    [APS_RESPONSE_CODES.AUTHORIZATION_FAILED]: {
      en: "Payment was declined. Please try a different payment method.",
      ar: "تم رفض الدفع. يرجى تجربة طريقة دفع أخرى.",
    },
    [APS_RESPONSE_CODES.CANCELLED_BY_USER]: {
      en: "Payment was cancelled.",
      ar: "تم إلغاء الدفع.",
    },
    [APS_RESPONSE_CODES.SESSION_EXPIRED]: {
      en: "Payment session expired. Please try again.",
      ar: "انتهت صلاحية جلسة الدفع. يرجى المحاولة مرة أخرى.",
    },
    [APS_RESPONSE_CODES.TECHNICAL_ERROR]: {
      en: "A technical error occurred. Please try again.",
      ar: "حدث خطأ تقني. يرجى المحاولة مرة أخرى.",
    },
  };

  const message = messages[responseCode];
  if (message) {
    return message[locale];
  }

  return locale === "ar"
    ? "فشل الدفع. يرجى المحاولة مرة أخرى."
    : "Payment failed. Please try again.";
}
