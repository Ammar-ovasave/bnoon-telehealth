import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { CurrentUserType } from "@/models/CurrentUserType";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { SendOTPPayload } from "@/models/SendOTPPayload";
import { SwitchBranchPayload } from "@/models/SwitchBranchPayload";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";
import { UpdatePatientPayload } from "@/models/UpdatePatientPayload";
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
  cancelledStatusId,
}: {
  appointmentId: number;
  cancelledStatusId: number;
}) {
  return await updateAppointment({ appointmentId, statusId: cancelledStatusId, type: "cancel" });
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
