/**
 * Payment API functions for bnoon-api
 */

import { bnoonApiClient } from './client';
import type {
  CreatePaymentRequest,
  PaymentDto,
  UpdatePaymentStatusRequest,
} from './types';

/**
 * Create a new payment record in bnoon-api
 */
export async function createPayment(
  data: CreatePaymentRequest,
  token: string
): Promise<PaymentDto> {
  const response = await bnoonApiClient.post<PaymentDto>('/payments', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Get payment by merchant reference
 */
export async function getPaymentByMerchantReference(
  merchantReference: string
): Promise<PaymentDto | null> {
  try {
    const response = await bnoonApiClient.get<PaymentDto>(
      `/payments/reference/${encodeURIComponent(merchantReference)}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  merchantReference: string,
  data: UpdatePaymentStatusRequest
): Promise<PaymentDto> {
  const response = await bnoonApiClient.patch<PaymentDto>(
    `/payments/reference/${encodeURIComponent(merchantReference)}/status`,
    data
  );
  return response.data;
}
