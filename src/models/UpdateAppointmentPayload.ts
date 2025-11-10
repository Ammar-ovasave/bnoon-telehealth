export type UpdateAppointmentPayload = {
  startTime?: string;
  endTime?: string;
  resourceIds?: number[];
  branchId?: number;
  statusId?: number;
  appointmentId: number;
  description?: string;
};
