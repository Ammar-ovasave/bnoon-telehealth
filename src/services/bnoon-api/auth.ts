import { bnoonApiClient, createHeaders } from './client';
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  IntrospectTokenRequest,
  IntrospectTokenResponse,
  SessionStatusResponse,
} from './types';

/**
 * Send OTP to phone number
 */
export async function sendOtp(
  data: SendOtpRequest,
  sessionId?: string
): Promise<SendOtpResponse> {
  const response = await bnoonApiClient.post<SendOtpResponse>(
    '/auth/send-otp',
    data,
    { headers: createHeaders({ sessionId }) }
  );
  return response.data;
}

/**
 * Verify OTP and get JWT token
 *
 * For returning users: Returns JWT token immediately.
 * For new guests: Returns sessionId only (token and user are null).
 */
export async function verifyOtp(
  data: VerifyOtpRequest,
  sessionId?: string
): Promise<VerifyOtpResponse> {
  const response = await bnoonApiClient.post<VerifyOtpResponse>(
    '/auth/verify-otp',
    data,
    { headers: createHeaders({ sessionId }) }
  );
  return response.data;
}

/**
 * Complete registration for new guests.
 * Creates user record with profile data and issues JWT token.
 *
 * Called after OTP verification when user submits patient info form.
 */
export async function completeRegistration(
  data: CompleteRegistrationRequest
): Promise<CompleteRegistrationResponse> {
  const response = await bnoonApiClient.post<CompleteRegistrationResponse>(
    '/auth/complete-registration',
    data
  );
  return response.data;
}

/**
 * Introspect a token to check if it's valid and get its claims.
 * This allows bnoon-telehealth to validate tokens without having
 * access to the JWT secret.
 *
 * Returns:
 * - active: true + user claims if token is valid
 * - active: false + reason if token is invalid/expired
 */
export async function introspectToken(
  token: string
): Promise<IntrospectTokenResponse> {
  const response = await bnoonApiClient.post<IntrospectTokenResponse>(
    '/auth/token/introspect',
    { token } as IntrospectTokenRequest
  );
  return response.data;
}

/**
 * Get session status including verified phone and auth data.
 * Used to check if phone is already verified in session to skip OTP form.
 *
 * Returns:
 * - hasSession: false if session doesn't exist or expired
 * - hasSession: true + phone/auth data if session is valid
 * - auth data includes JWT for returning users, sessionId for new guests
 */
export async function getSessionStatus(
  sessionId?: string
): Promise<SessionStatusResponse> {
  const response = await bnoonApiClient.get<SessionStatusResponse>(
    '/auth/session-status',
    { headers: createHeaders({ sessionId }) }
  );
  return response.data;
}
