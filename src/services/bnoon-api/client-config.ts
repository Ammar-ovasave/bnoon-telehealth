import type { IntrospectTokenResponse } from './types';

/**
 * Client-side configuration for bnoon-api
 * Uses NEXT_PUBLIC_ prefix for client-side access
 */
export const BNOON_API_CLIENT_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BNOON_API_URL || 'http://localhost:3002/api',
  timeout: 30000,
};

/**
 * Client-side fetcher for SWR
 * Includes language header based on locale
 */
export async function clientFetcher<T>(
  url: string,
  options?: { language?: 'ar' | 'en' }
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.language) {
    headers['Accept-Language'] = options.language;
  }

  const response = await fetch(`${BNOON_API_CLIENT_CONFIG.baseUrl}${url}`, {
    headers,
  });

  if (!response.ok) {
    const error = new Error('API request failed');
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Client-side token introspection
 * Validates token via bnoon-api without exposing JWT secret
 */
export async function clientIntrospectToken(
  token: string
): Promise<IntrospectTokenResponse> {
  const response = await fetch(`${BNOON_API_CLIENT_CONFIG.baseUrl}/auth/token/introspect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    // API error - treat as inactive token
    return { active: false, reason: 'invalid' };
  }

  return response.json();
}
