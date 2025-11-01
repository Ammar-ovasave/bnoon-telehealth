import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import axios from "axios";

const instance = axios.create({
  headers: { "Content-Type": "application/json" },
});

export async function updatePatient(params: {
  mrn: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  maidenName?: string;
  arabicName?: string;
  dob?: string;
  contactNumber?: string;
  alternativeContactNumber?: string;
  emailAddress?: string;
}) {
  try {
    const res = await instance.patch<{ id?: number }>(`/api/ferti-smart/patients/${params.mrn}`, params);
    console.log("update patient response", res.data);
    return res.data;
  } catch (error) {
    console.log("--- updatePatient error", error);
    return null;
  }
}

export async function updateAppointment(params: {
  startTime?: string;
  endTime?: string;
  resourceIds?: number[];
  branchId?: number;
  statusId?: number;
  appointmentId: number;
}) {
  try {
    const res = await instance.patch<{ id?: number }>(`/api/ferti-smart/appointments/${params.appointmentId}`, params);
    return res.data;
  } catch (e) {
    console.log("--- updateAppointment error", e);
    return null;
  }
}

export async function cancelAppointment(appointmentId: number) {
  return await updateAppointment({ appointmentId, statusId: 6 });
}

export async function createAppointment(params: CreateAppointmentPayload) {
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
    const res = await instance.get<FertiSmartPatientModel[]>(`/api/ferti-smart/patients?contactNumber=${phoneNumber}`);
    return res.data;
  } catch (e) {
    console.log("--- getPatientsByPhoneNumber error", e);
    return null;
  }
}
