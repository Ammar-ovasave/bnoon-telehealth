import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { db } from ".";

export async function createNewAppointmentDB(params: CreateAppointmentPayload & { id: string }) {
  try {
    const res = await db.collection('appointments').doc(params.id.toString()).set(params);
    return res;
  } catch (error) {
    console.log('--- createNewAppointmentDB error', error);
    return null;
  }
}
