import { AppointmentServiceModel } from "@/models/AppointmentServiceModel";
import { FSResourceModel } from "@/models/FSResourceModel";
import axios from "./axios";

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
