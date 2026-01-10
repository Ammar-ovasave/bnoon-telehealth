import { bnoonApiClient, createHeaders } from './client';
import type {
  GetUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  NearestAppointmentResponse,
} from './types';

/**
 * Get current user profile
 * Requires JWT token
 */
export async function getUser(token: string): Promise<GetUserResponse> {
  const response = await bnoonApiClient.get<GetUserResponse>('/users/me', {
    headers: createHeaders({ token }),
  });
  return response.data;
}

/**
 * Update current user profile
 * Requires JWT token
 */
export async function updateUser(
  data: UpdateUserRequest,
  token: string
): Promise<UpdateUserResponse> {
  const response = await bnoonApiClient.patch<UpdateUserResponse>(
    '/users/me',
    data,
    { headers: createHeaders({ token }) }
  );
  return response.data;
}

/**
 * Get nearest upcoming appointment for current user
 * Requires JWT token
 */
export async function getNearestAppointment(
  token: string
): Promise<NearestAppointmentResponse> {
  const response = await bnoonApiClient.get<NearestAppointmentResponse>(
    '/users/me/nearest-appointment',
    { headers: createHeaders({ token }) }
  );
  return response.data;
}
