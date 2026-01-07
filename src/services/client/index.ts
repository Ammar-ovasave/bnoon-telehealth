import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { CurrentUserType } from "@/models/CurrentUserType";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { SendOTPPayload } from "@/models/SendOTPPayload";
import { SwitchBranchPayload } from "@/models/SwitchBranchPayload";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";
import { UpdatePatientPayload } from "@/models/UpdatePatientPayload";
import { BnoonUser, UpdateBnoonUserPayload } from "@/models/BnoonUser";
import { ClinicBranchID } from "@/models/ClinicModel";
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

export async function updatePatient(params: UpdatePatientPayload) {
  try {
    const res = await instance.patch<{ id?: number }>(`/api/patients/${params.mrn}`, params);
    return res.data;
  } catch (error) {
    console.log("--- updatePatient error", error);
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

export async function createAppointment(params: CreateAppointmentPayload) {
  try {
    console.log("--- create appointment", params);
    const res = await instance.post<{ id?: number }>(`/api/appointments`, params);
    console.log("--- appointment response", res.data);
    return res.data;
  } catch (e) {
    console.log("--- createAppointment error", e);
    return null;
  }
}

export async function createPatient(params: {
  patient: { firstName: string; lastName: string; sex?: 0 | 1; contactNumber: string; middleName: string; dob?: string };
  branchId: number;
}) {
  try {
    const res = await instance.post<FertiSmartPatientModel>(`/api/patients`, params);
    return res.data;
  } catch (e) {
    console.log("--- createPatient error", e);
    return null;
  }
}

export async function sendOTP(params: SendOTPPayload) {
  try {
    const res = await instance.post<{
      length?: number;
    }>(`/api/send-otp`, params);
    return res.data;
  } catch (e) {
    console.log("--- sendOTP error", e);
    return null;
  }
}

export async function verifyOTP(params: { code: string; purpose: string; mrn: string }) {
  try {
    const res = await instance.post<{
      verified?: boolean;
    }>(`/api/verify-otp`, params);
    return res.data;
  } catch (e) {
    console.log("--- verifyOTP error", e);
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

export async function getPatientsByPhoneNumber({ phoneNumber }: { phoneNumber: string }) {
  try {
    const res = await instance.get<{ mrn?: string }[]>(`/api/get-patients-by-phone-number?phoneNumber=${phoneNumber}`);
    return res.data;
  } catch (e) {
    console.log("--- getPatientsByPhoneNumber error", e);
    return null;
  }
}

export async function switchBranch(payload: SwitchBranchPayload) {
  try {
    const res = await instance.post(`/api/switch-branch`, payload);
    return res.data;
  } catch (e) {
    console.log("--- switchBranch error", e);
    return false;
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
  user: BnoonUserResponse;
}

export interface BranchMrnResponse {
  branchId: string;
  mrn: string;
  isNew: boolean;
  fertiSmartBranchId: number;
}

/**
 * Send OTP to phone number (new Bnoon auth flow)
 * No branch or MRN required
 */
export async function sendBnoonOTP(phone: string) {
  try {
    const res = await instance.post<{ success: boolean; length: number; phone: string }>(
      `/api/auth/send-otp`,
      { phone }
    );
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
export async function verifyBnoonOTP(phone: string, code: string) {
  try {
    const res = await instance.post<BnoonAuthResponse>(
      `/api/auth/verify-otp`,
      { phone, code }
    );
    return res.data;
  } catch (e) {
    console.log("--- verifyBnoonOTP error", e);
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

/**
 * Get or create FertiSmart MRN for a specific branch
 * Implements lazy patient creation
 */
export async function getOrCreateBranchMrn(branchId: ClinicBranchID) {
  try {
    const res = await instance.post<BranchMrnResponse>(
      `/api/users/me/branch-mrn`,
      { branchId }
    );
    return res.data;
  } catch (e) {
    console.log("--- getOrCreateBranchMrn error", e);
    return null;
  }
}
