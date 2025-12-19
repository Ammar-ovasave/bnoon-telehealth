import { CreateAppointmentPayload } from "./CreateAppointmentPayload";

export type UpdateAppointmentPayload = Partial<
  Pick<CreateAppointmentPayload, "startTime" | "endTime" | "resourceIds" | "branchId" | "statusId" | "statusName" | "description">
> & { appointmentId: number; type: "cancel" | "reschedule" | null };
