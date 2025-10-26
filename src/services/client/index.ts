import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import axios from "axios";

const instance = axios.create({
  headers: { "Content-Type": "application/json" },
});

export async function createAppointment(params: {
  patientMrn: string;
  serviceId: number;
  resourceIds: number[];
  startTime: string;
  endTime: string;
  branchId: number;
  statusId: number;
  description: string;
}) {
  try {
    console.log("--- create appointment", params);
    const res = await instance.post<{ id?: number }>(`/api/appointments`, params);
    console.log("--- appointment response", res.data);
    return res.data;
  } catch (e) {
    console.log("--- createPatient error", e);
    return null;
  }
}

export async function createPatient(params: {
  patient: { firstName: string; lastName: string; sex?: 0 | 1; contactNumber: string; middleName?: string; dob?: string };
  branchId: number;
}) {
  try {
    const res = await instance.post<FertiSmartPatientModel>(`/api/ferti-smart/patients`, params);
    return res.data;
  } catch (e) {
    console.log("--- createPatient error", e);
    return null;
  }
}

export async function sendOTP(params: { mrn: string; purpose: string; ttlMinutes: number; maxAttempts: number; channel: "sms" }) {
  try {
    const res = await instance.post<{
      id: number;
      code: string;
      expiresAtUtc: string;
    }>(`/api/ferti-smart/patients/${params.mrn}/otps`, params);
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
