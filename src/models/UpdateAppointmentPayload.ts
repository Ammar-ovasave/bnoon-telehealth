/**
 * Payload for updating appointments
 */
export interface UpdateAppointmentPayload {
  appointmentId: number;
  type: "cancel" | "reschedule" | null;
  startTime?: string;
  endTime?: string;
  resourceId?: number;
  branchId?: string;
  statusId?: number;
  statusName?: string;
  description?: string;
}
