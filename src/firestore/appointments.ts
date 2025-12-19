import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { db } from ".";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";

const APPOINTMENTS_COLLECTION_NAME = "appointments";

type CreateDBAppointmentParamsType = CreateAppointmentPayload & { id: string; createdAt: string };

export async function createNewAppointmentDB(params: CreateDBAppointmentParamsType) {
  try {
    const res = await db.collection(APPOINTMENTS_COLLECTION_NAME).doc(params.id.toString()).set(params);
    return res;
  } catch (error) {
    console.log("--- createNewAppointmentDB error", error);
    return null;
  }
}

export async function updateAppointmentDB(appointmentId: string, updateData: UpdateAppointmentPayload) {
  try {
    const res = await db.collection(APPOINTMENTS_COLLECTION_NAME).doc(appointmentId.toString()).update(updateData);
    return res;
  } catch (error) {
    console.log("--- updateAppointmentDB error", error);
    return null;
  }
}
