import { AppointmentServiceModel } from "@/models/AppointmentServiceModel";
import { FSResourceModel } from "@/models/FSResourceModel";
import axios from "./axios";
import { FertiSmartBranchModel } from "@/models/FertiSmartBranchModel";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";

export async function sendEmail(params: { email: string; subject: string; body: string; mrn: string }) {
  try {
    const res = await axios.post<{
      emailEnabled?: boolean;
      enqueued?: boolean;
      emailId?: string;
      subject?: string;
      body?: string;
      email?: string;
      mrn?: string;
    }>(`/messages/emails`, params);
    console.log("send email response", res.data);
    return res.data;
  } catch (error) {
    console.log("--- sendEmail error", error);
    return null;
  }
}

export async function sendSMS(params: { mobile: string[]; body: string; mrn: string }) {
  try {
    const res = await axios.post<{
      smsEnabled?: string;
      queued?: string;
      message?: string;
    }>(`/messages/smses`, params);
    console.log("send sms response", res.data);
    return res.data;
  } catch (error) {
    console.log("--- sendSMS error", error);
    return null;
  }
}

export async function getPatient(params: { mrn: string }) {
  try {
    const res = await axios.get<FertiSmartPatientModel>(`/patients/${params.mrn}`);
    return res.data;
  } catch (error) {
    console.log("--- sendSMS error", error);
    return null;
  }
}

export async function getAppointmentServices({ activeOnly }: { activeOnly?: boolean }) {
  try {
    const res = await axios.get<AppointmentServiceModel[]>(`/appointment-services`, { params: { activeOnly } });
    return res.data;
  } catch (e) {
    console.log("--- getAppointmentServices error", e);
    return null;
  }
}

export async function getResources() {
  try {
    const res = await axios.get<FSResourceModel[]>(`/resources`);
    return res.data;
  } catch (e) {
    console.log("--- getAppointmentServices error", e);
    return null;
  }
}

export async function getBranches() {
  try {
    const res = await axios.get<FertiSmartBranchModel[]>(`/branches`);
    return res.data;
  } catch (e) {
    console.log("--- getAppointmentServices error", e);
    return null;
  }
}
