export interface SendOTPPayload {
  mrn: string;
  purpose: string;
  ttlMinutes: number;
  maxAttempts: number;
  channel: "sms";
}
