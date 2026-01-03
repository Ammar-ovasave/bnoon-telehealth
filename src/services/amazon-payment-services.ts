/**
 * Amazon Payment Services (APS) Integration
 * Formerly known as Payfort
 * For MENA region including Saudi Arabia
 *
 * Documentation: https://paymentservices.amazon.com/docs/
 */

import crypto from "crypto";

interface APSConfig {
  merchantIdentifier: string;
  accessCode: string;
  shaRequestPhrase: string;
  shaResponsePhrase: string;
  shaType: "SHA-256" | "SHA-512";
  sandboxMode: boolean;
}

interface CreateSessionParams {
  merchantReference: string;
  amount: number; // Amount in SAR (will be converted to minor units)
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl: string;
  language: "en" | "ar";
  orderDescription?: string;
}

/**
 * Amazon Payment Services SDK Wrapper
 * Handles signature generation and payment session creation
 */
export class AmazonPaymentServices {
  private config: APSConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      merchantIdentifier: process.env.APS_MERCHANT_IDENTIFIER || "PLACEHOLDER",
      accessCode: process.env.APS_ACCESS_CODE || "PLACEHOLDER",
      shaRequestPhrase: process.env.APS_SHA_REQUEST_PHRASE || "PLACEHOLDER",
      shaResponsePhrase: process.env.APS_SHA_RESPONSE_PHRASE || "PLACEHOLDER",
      shaType: (process.env.APS_SHA_TYPE as "SHA-256" | "SHA-512") || "SHA-256",
      sandboxMode: process.env.APS_SANDBOX !== "false",
    };

    // APS gateway URLs
    this.baseUrl = this.config.sandboxMode
      ? "https://sbcheckout.payfort.com/FortAPI/paymentPage"
      : "https://checkout.payfort.com/FortAPI/paymentPage";
  }

  /**
   * Get the gateway URL for form submission
   */
  getGatewayUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if using sandbox mode
   */
  isSandbox(): boolean {
    return this.config.sandboxMode;
  }

  /**
   * Generate HMAC-SHA256 or SHA512 signature for APS requests
   * Formula: SHA(RequestPhrase + Params (sorted alphabetically) + RequestPhrase)
   */
  generateSignature(
    params: Record<string, string>,
    type: "request" | "response"
  ): string {
    const phrase =
      type === "request"
        ? this.config.shaRequestPhrase
        : this.config.shaResponsePhrase;

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();

    // Build signature string: PHRASE + key1=value1key2=value2... + PHRASE
    const signatureString =
      phrase +
      sortedKeys.map((key) => `${key}=${params[key]}`).join("") +
      phrase;

    // Generate hash based on SHA type
    const algorithm = this.config.shaType === "SHA-512" ? "sha512" : "sha256";
    return crypto.createHash(algorithm).update(signatureString).digest("hex");
  }

  /**
   * Create payment session parameters for hosted checkout
   * Returns form parameters to be submitted to APS gateway
   */
  createPaymentSession(params: CreateSessionParams): Record<string, string> {
    // Convert amount to minor units (halalas for SAR)
    // APS expects amounts multiplied by 100
    const amountInMinorUnits = Math.round(params.amount * 100);

    const requestParams: Record<string, string> = {
      command: "AUTHORIZATION", // or "PURCHASE" for immediate capture
      access_code: this.config.accessCode,
      merchant_identifier: this.config.merchantIdentifier,
      merchant_reference: params.merchantReference,
      amount: amountInMinorUnits.toString(),
      currency: params.currency,
      language: params.language,
      customer_email: params.customerEmail,
      return_url: params.returnUrl,
    };

    // Optional fields
    if (params.customerName) {
      requestParams.customer_name = params.customerName;
    }
    if (params.customerPhone) {
      requestParams.phone_number = params.customerPhone;
    }
    if (params.orderDescription) {
      requestParams.order_description = params.orderDescription;
    }

    // Generate signature
    requestParams.signature = this.generateSignature(requestParams, "request");

    return requestParams;
  }

  /**
   * Verify callback signature from APS
   * Returns true if signature is valid
   */
  verifyCallback(params: Record<string, string>): boolean {
    const receivedSignature = params.signature;

    if (!receivedSignature) {
      console.log("--- APS callback: No signature received");
      return false;
    }

    // Remove signature from params for verification
    const paramsWithoutSignature: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key !== "signature") {
        paramsWithoutSignature[key] = value;
      }
    }

    const calculatedSignature = this.generateSignature(
      paramsWithoutSignature,
      "response"
    );

    // Use constant-time comparison to prevent timing attacks
    const isValid = this.constantTimeCompare(
      receivedSignature,
      calculatedSignature
    );

    if (!isValid) {
      console.log("--- APS callback: Signature mismatch", {
        received: receivedSignature,
        calculated: calculatedSignature,
      });
    }

    return isValid;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Generate unique merchant reference
   * Format: BNOON-{timestamp}-{random}
   */
  static generateMerchantReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `BNOON-${timestamp}-${random}`;
  }
}

/**
 * Singleton instance for use across API routes
 */
let apsInstance: AmazonPaymentServices | null = null;

export function getAPS(): AmazonPaymentServices {
  if (!apsInstance) {
    apsInstance = new AmazonPaymentServices();
  }
  return apsInstance;
}
