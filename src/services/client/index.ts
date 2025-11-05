import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { CurrentUserType } from "@/models/CurrentUserType";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { SendOTPPayload } from "@/models/SendOTPPayload";
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
  identityIdTypeId?: number;
  nationalityId?: number;
  identityId?: string;
}) {
  try {
    console.log("--- update patient", params);
    const res = await instance.patch<{ id?: number }>(`/api/ferti-smart/patients/${params.mrn}`, params);
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
    console.log("--- createAppointment error", e);
    return null;
  }
}

export async function createPatient(params: {
  patient: { firstName: string; lastName: string; sex?: 0 | 1; contactNumber: string; middleName?: string; dob?: string };
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
