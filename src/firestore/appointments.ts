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
    // Use set with merge to handle both existing and non-existing documents
    const res = await db
      .collection(APPOINTMENTS_COLLECTION_NAME)
      .doc(appointmentId.toString())
      .set(
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
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

/**
 * Get the nearest upcoming appointment for a user by phone number
 * Returns SINGLE appointment with the closest future startTime
 * Excludes cancelled appointments
 */
export async function getNearestUpcomingAppointmentByPhone(phone: string): Promise<CreateDBAppointmentParamsType | null> {
  try {
    const now = new Date().toISOString();

    // Query appointments for this phone number with startTime >= now
    // Ordered by startTime ASC to get the nearest one first
    const snapshot = await db
      .collection(APPOINTMENTS_COLLECTION_NAME)
      .where("phoneNumber", "==", phone)
      .where("startTime", ">=", now)
      .orderBy("startTime", "asc")
      .limit(10) // Fetch a few in case some are cancelled
      .get();

    if (snapshot.empty) {
      return null;
    }

    // Find the first non-cancelled appointment
    for (const doc of snapshot.docs) {
      const data = doc.data() as CreateDBAppointmentParamsType;
      if (data.statusName !== "Cancelled") {
        return { ...data, id: doc.id };
      }
    }

    return null;
  } catch (error) {
    console.log("--- getNearestUpcomingAppointmentByPhone error", error);
    return null;
  }
}
