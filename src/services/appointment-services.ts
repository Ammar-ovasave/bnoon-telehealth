import { AppointmentServiceModel } from "@/models/AppointmentServiceModel";
import { FSResourceModel } from "@/models/FSResourceModel";
import { FertiSmartBranchModel } from "@/models/FertiSmartBranchModel";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import axios from "./axios";

export async function getAppointment(params: { appointmentId: string; baseAPIURL?: string }) {
  try {
    const res = await axios.get<FertiSmartAppointmentModel>(
      params.baseAPIURL ? `${params.baseAPIURL}/appointments/${params.appointmentId}` : `/appointments/${params.appointmentId}`
    );
    return res.data;
  } catch (error) {
    console.log("--- get appointment error ", error);
    return null;
  }
}

export async function sendEmail(params: {
  email: string;
  subject: string;
  body: string;
  mrn: string;
  baseAPIURL: string | null;
}) {
  try {
    const res = await axios.post<{
      emailEnabled?: boolean;
      enqueued?: boolean;
      emailId?: string;
      subject?: string;
      body?: string;
      email?: string;
      mrn?: string;
    }>(params.baseAPIURL ? `${params.baseAPIURL}/messages/emails` : `/messages/emails`, params);
    console.log("send email response", res.data);
    return res.data;
  } catch (error) {
    console.log("--- sendEmail error", error);
    return null;
  }
}

export async function sendSMS(params: { mobile: string[]; body: string; mrn: string; baseAPIURL: string | null }) {
  try {
    const res = await axios.post<{
      smsEnabled?: string;
      queued?: string;
      message?: string;
    }>(params.baseAPIURL ? `${params.baseAPIURL}/messages/smses` : `/messages/smses`, params);
    console.log("send sms response", res.data);
    return res.data;
  } catch (error) {
    console.log("--- sendSMS error", error);
    return null;
  }
}

export async function getPatient(params: { mrn: string; baseAPIURL: string | null }) {
  try {
    const res = await axios.get<FertiSmartPatientModel>(
      params.baseAPIURL ? `${params.baseAPIURL}/patients/${params.mrn}` : `/patients/${params.mrn}`
    );
    return res.data;
  } catch (error) {
    console.log("--- sendSMS error", error);
    return null;
  }
}

export async function getAppointmentServices({ activeOnly, baseAPIURL }: { activeOnly?: boolean; baseAPIURL: string | null }) {
  try {
    const res = await axios.get<AppointmentServiceModel[]>(
      baseAPIURL ? `${baseAPIURL}/appointment-services` : `/appointment-services`,
      { params: { activeOnly } }
    );
    return res.data;
  } catch (e) {
    console.log("--- getAppointmentServices error", e);
    return null;
  }
}

export async function getResources({ baseAPIURL }: { baseAPIURL: string | null }) {
  try {
    const res = await axios.get<FSResourceModel[]>(baseAPIURL ? `${baseAPIURL}/resources` : `/resources`);
    return res.data;
  } catch (e) {
    console.log("--- getAppointmentServices error", e);
    return null;
  }
}

export async function getBranches({ baseAPIURL }: { baseAPIURL: string | null }) {
  try {
    const res = await axios.get<FertiSmartBranchModel[]>(baseAPIURL ? `${baseAPIURL}/branches` : `/branches`);
    return res.data;
  } catch (e) {
    console.log("--- getAppointmentServices error", e);
    return null;
  }
}
