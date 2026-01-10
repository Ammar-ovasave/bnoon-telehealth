import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { CurrentUserType } from "@/models/CurrentUserType";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";
import { BnoonUser, UpdateBnoonUserPayload } from "@/models/BnoonUser";
import axios from "axios";

const instance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  return config;
});

export async function getCurrentUser() {
  try {
    const res = await instance.get<CurrentUserType>(`/api/current-user`);
    return res.data;
  } catch (e) {
    console.log("--- get current user error ", e);
    return null;
  }
}

export async function updateAppointment(params: UpdateAppointmentPayload) {
  try {
    const res = await instance.patch<{ id?: number }>(`/api/appointments/${params.appointmentId}`, params);
    return res.data;
  } catch (e) {
    console.log("--- updateAppointment error", e);
    return null;
  }
}

export async function cancelAppointment({
  appointmentId,
  cancelStatusName,
  cancelledStatusId,
}: {
  cancelStatusName: string;
  appointmentId: number;
  cancelledStatusId: number;
}) {
  return await updateAppointment({ appointmentId, statusId: cancelledStatusId, type: "cancel", statusName: cancelStatusName });
}

// Response type for createAppointment
export interface CreateAppointmentResponse {
  success: boolean;
  appointment: {
    id: string; // MySQL UUID
    appointmentId: number; // FertiSmart appointment ID
    branchId: string;
    branchName: string;
    startTime: string;
    endTime: string;
    doctorName: string;
    serviceName: string;
    status: string;
    visitType: "virtual" | "in-person";
  };
}

export async function createAppointment(params: CreateAppointmentPayload): Promise<CreateAppointmentResponse | null> {
  try {
    console.log("--- create appointment", params);
    // Call the new bnoon-api format (no MRN required, patient created internally)
    const res = await instance.post<CreateAppointmentResponse>(`/api/appointments`, {
      branchId: params.branchId,
      serviceId: params.serviceId,
      resourceId: params.resourceId,
      startTime: params.startTime,
      endTime: params.endTime,
      visitType: params.visitType,
      fullName: params.fullName,
      email: params.email ?? undefined,
      sex: params.sex,
      dob: params.dob,
      nationalityId: params.nationalityId,
      identityIdType: params.identityIdType,
      identityId: params.identityId,
    });
    console.log("--- appointment response", res.data);
    return res.data;
  } catch (e) {
    console.log("--- createAppointment error", e);
    return null;
  }
}

export async function logout() {
  try {
    const res = await instance.post(`/api/logout`);
    return res.data;
  } catch (e) {
    console.log("--- logout error", e);
    return null;
  }
}

// ============================================
// Bnoon Auth System (New)
// ============================================

export interface BnoonUserResponse extends Omit<BnoonUser, "createdAt" | "updatedAt" | "lastLoginAt"> {
  isProfileComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BnoonAuthResponse {
  success: boolean;
  isNew: boolean;
  isProfileComplete: boolean;
  sessionId?: string; // For new guests - use in complete-registration
  user: BnoonUserResponse | null; // null for new guests
}

/**
 * Send OTP to phone number (new Bnoon auth flow)
 * No branch or MRN required
 *
 * Returns alreadyVerified: true if phone was already verified in current session
 */
export async function sendBnoonOTP(phone: string) {
  try {
    const res = await instance.post<{
      success: boolean;
      length: number;
      phone: string;
      alreadyVerified?: boolean;
    }>(`/api/auth/send-otp`, { phone });
    return res.data;
  } catch (e) {
    console.log("--- sendBnoonOTP error", e);
    return null;
  }
}

/**
 * Verify OTP and authenticate (new Bnoon auth flow)
 * Creates new user if first time
 */
export async function verifyBnoonOTP(phone: string, code: string, preferredLanguage?: "ar" | "en") {
  try {
    const res = await instance.post<BnoonAuthResponse>(
      `/api/auth/verify-otp`,
      { phone, code, preferredLanguage }
    );
    return res.data;
  } catch (e) {
    console.log("--- verifyBnoonOTP error", e);
    return null;
  }
}

/**
 * Complete registration for new guests.
 * Creates user record with profile data and issues JWT token.
 * Called after OTP verification when a new guest submits the patient info form.
 */
export async function completeGuestRegistration(data: {
  fullName: string;
  email?: string;
  preferredLanguage?: "ar" | "en";
}) {
  try {
    const res = await instance.post<{
      success: boolean;
      user: BnoonUserResponse;
    }>(`/api/auth/complete-registration`, data);
    return res.data;
  } catch (e) {
    console.log("--- completeGuestRegistration error", e);
    return null;
  }
}

/**
 * Get current Bnoon user profile
 */
export async function getBnoonUser() {
  try {
    const res = await instance.get<BnoonUserResponse>(`/api/users/me`);
    return res.data;
  } catch (e) {
    console.log("--- getBnoonUser error", e);
    return null;
  }
}

/**
 * Update Bnoon user profile
 * Also syncs to all FertiSmart branches
 */
export async function updateBnoonUser(data: UpdateBnoonUserPayload) {
  try {
    const res = await instance.patch<BnoonUserResponse & { syncResults: { branchId: string; success: boolean }[] }>(
      `/api/users/me`,
      data
    );
    return res.data;
  } catch (e) {
    console.log("--- updateBnoonUser error", e);
    return null;
  }
}

// ============================================
// Session Status
// ============================================

export interface SessionStatusAuthData {
  isNew: boolean;
  isProfileComplete: boolean;
  token: string | null;
  sessionId: string;
  user: BnoonUserResponse | null;
}

export interface SessionStatusResponse {
  hasSession: boolean;
  phone: string | null;
  isPhoneVerified: boolean;
  preferredLanguage: "ar" | "en" | null;
  expiresAt: string | null;
  auth?: SessionStatusAuthData;
}

/**
 * Get current session status including verified phone and auth data.
 * Used to check if phone is already verified to skip OTP form.
 *
 * Returns:
 * - hasSession: false if session doesn't exist or expired
 * - hasSession: true + phone/auth data if session is valid
 * - auth data includes token for returning users, sessionId for new guests
 */
export async function getSessionStatus() {
  try {
    const res = await instance.get<SessionStatusResponse>(`/api/auth/session-status`);
    return res.data;
  } catch (e) {
    console.log("--- getSessionStatus error", e);
    return null;
  }
}

