import { bnoonApiClient, createHeaders } from './client';
import type {
  BranchId,
  GetBranchesResponse,
  GetServicesResponse,
  GetDoctorsResponse,
  GetAvailabilityResponse,
  GetCountriesResponse,
  GetIdTypesResponse,
} from './types';

/**
 * Get all clinic branches
 */
export async function getBranches(
  language?: 'ar' | 'en'
): Promise<GetBranchesResponse> {
  const response = await bnoonApiClient.get<GetBranchesResponse>(
    '/fertismart/branches',
    { headers: createHeaders({ language }) }
  );
  return response.data;
}

/**
 * Get services for a branch
 */
export async function getServices(
  branchId: BranchId,
  language?: 'ar' | 'en'
): Promise<GetServicesResponse> {
  const response = await bnoonApiClient.get<GetServicesResponse>(
    `/fertismart/services/${branchId}`,
    { headers: createHeaders({ language }) }
  );
  return response.data;
}

/**
 * Get doctors for a service at a branch
 */
export async function getDoctorsByService(
  branchId: BranchId,
  serviceId: string,
  language?: 'ar' | 'en'
): Promise<GetDoctorsResponse> {
  const response = await bnoonApiClient.get<GetDoctorsResponse>(
    `/fertismart/${branchId}/services/${serviceId}/doctors`,
    { headers: createHeaders({ language }) }
  );
  return response.data;
}

/**
 * Get availability slots for a doctor
 */
export async function getAvailability(
  branchId: BranchId,
  resourceId: number,
  date: string,
  serviceDuration: number
): Promise<GetAvailabilityResponse> {
  const response = await bnoonApiClient.get<GetAvailabilityResponse>(
    `/fertismart/${branchId}/doctors/${resourceId}/availability`,
    { params: { date, serviceDuration } }
  );
  return response.data;
}

/**
 * Get list of countries
 */
export async function getCountries(): Promise<GetCountriesResponse> {
  const response = await bnoonApiClient.get<GetCountriesResponse>(
    '/fertismart/countries'
  );
  return response.data;
}

/**
 * Get list of ID types (identity document types)
 */
export async function getIdTypes(): Promise<GetIdTypesResponse> {
  const response = await bnoonApiClient.get<GetIdTypesResponse>(
    '/fertismart/id-types'
  );
  return response.data;
}
