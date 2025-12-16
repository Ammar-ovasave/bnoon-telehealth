export interface CreateAppointmentPayload {
  patientMrn: string;
  serviceId: number;
  resourceIds: number[];
  startTime: string;
  endTime: string;
  branchId: number;
  statusId: number;
  description: string;
  email: string | null;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
}
