import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { db } from ".";

const APPOINTMENTS_COLLECTION_NAME = "appointments";

export async function createNewAppointmentDB(params: CreateAppointmentPayload & { id: string; createdAt: string }) {
  try {
    const res = await db.collection(APPOINTMENTS_COLLECTION_NAME).doc(params.id.toString()).set(params);
    return res;
  } catch (error) {
    console.log("--- createNewAppointmentDB error", error);
    return null;
  }
}
