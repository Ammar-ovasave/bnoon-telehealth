export type PaymentStatusType = "pending" | "paid" | "failed";

/**
 * Payload for creating appointments via bnoon-api
 * Note: patientMrn is NOT required - bnoon-api handles patient creation internally
 */
export interface CreateAppointmentPayload {
  branchId: string; // e.g., "jeddah", "riyadh-granada"
  serviceId: number;
  resourceId: number; // Single doctor ID (not array)
  startTime: string;
  endTime: string;
  visitType: "virtual" | "in-person";
  fullName?: string; // Full name as a single string
  email?: string | null;
  sex?: 0 | 1; // 0=female, 1=male
  dob?: string;
  nationalityId?: number;
  identityIdType?: number;
  identityId?: string;
  // Payment fields (for virtual visits)
  paymentReference?: string;
  paymentStatus?: PaymentStatusType;
  paymentAmount?: number;
  paymentCurrency?: string;
}
