import { bnoonApiClient, createHeaders } from './client';
import type {
  BranchId,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  GetAppointmentsResponse,
  GetAppointmentDetailResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
  CancelAppointmentResponse,
} from './types';

/**
 * Create a new appointment
 * Requires JWT token
 */
export async function createAppointment(
  data: CreateAppointmentRequest,
  token: string
): Promise<CreateAppointmentResponse> {
  const response = await bnoonApiClient.post<CreateAppointmentResponse>(
    '/appointments',
    data,
    { headers: createHeaders({ token }) }
  );
  return response.data;
}

/**
 * Get appointments for a branch
 * Requires JWT token
 */
export async function getAppointments(
  branchId: BranchId,
  token: string,
  language?: 'ar' | 'en'
): Promise<GetAppointmentsResponse> {
  const response = await bnoonApiClient.get<GetAppointmentsResponse>(
    `/appointments/${branchId}`,
    { headers: createHeaders({ token, language }) }
  );
  return response.data;
}

/**
 * Get a single appointment by UUID with status sync from FertiSmart
 * Requires JWT token
 */
export async function getAppointmentByUuid(
  uuid: string,
  token: string,
  language?: 'ar' | 'en'
): Promise<GetAppointmentDetailResponse> {
  const response = await bnoonApiClient.get<GetAppointmentDetailResponse>(
    `/appointments/detail/${uuid}`,
    { headers: createHeaders({ token, language }) }
  );
  return response.data;
}

/**
 * Reschedule an appointment
 * Requires JWT token
 */
export async function rescheduleAppointment(
  branchId: BranchId,
  appointmentId: number,
  data: RescheduleAppointmentRequest,
  token: string,
  language?: 'ar' | 'en'
): Promise<RescheduleAppointmentResponse> {
  const response = await bnoonApiClient.post<RescheduleAppointmentResponse>(
    `/appointments/${branchId}/${appointmentId}/reschedule`,
    data,
    { headers: createHeaders({ token, language }) }
  );
  return response.data;
}

/**
 * Cancel an appointment
 * Requires JWT token
 */
export async function cancelAppointment(
  branchId: BranchId,
  appointmentId: number,
  token: string,
  language?: 'ar' | 'en'
): Promise<CancelAppointmentResponse> {
  const response = await bnoonApiClient.post<CancelAppointmentResponse>(
    `/appointments/${branchId}/${appointmentId}/cancel`,
    {},
    { headers: createHeaders({ token, language }) }
  );
  return response.data;
}
