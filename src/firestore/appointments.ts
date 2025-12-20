import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { db } from ".";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";

const APPOINTMENTS_COLLECTION_NAME = "appointments";

export type CreateDBAppointmentParamsType = CreateAppointmentPayload & { id: string; createdAt: string; baseAPIURL: string };

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

export async function getAppointmentsForReminder(params: { startTimeFrom: string; startTimeTo: string; statusName?: string }) {
  try {
    let query = db
      .collection(APPOINTMENTS_COLLECTION_NAME)
      .where("startTime", ">=", params.startTimeFrom)
      .where("startTime", "<=", params.startTimeTo);
    if (params.statusName) {
      query = query.where("statusName", "==", params.statusName);
    }
    const snapshot = await query.get();
    const appointments: CreateDBAppointmentParamsType[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!params.statusName && data.statusName === "Cancelled") {
        return;
      }
      appointments.push({ id: doc.id, ...data } as CreateDBAppointmentParamsType);
    });
    return appointments;
  } catch (error) {
    console.log("--- getAppointmentsForReminder error", error);
    return [];
  }
}
