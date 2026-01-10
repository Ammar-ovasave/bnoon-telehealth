import axios, { AxiosInstance } from 'axios';
import { BNOON_API_CONFIG } from './config';

/**
 * Server-side axios instance for calling bnoon-api
 * Used from Next.js API routes
 */
export const bnoonApiClient: AxiosInstance = axios.create({
  baseURL: BNOON_API_CONFIG.baseUrl,
  timeout: BNOON_API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error logging
bnoonApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[bnoon-api] Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

/**
 * Create headers with auth token and language
 */
export function createHeaders(options: {
  token?: string;
  sessionId?: string;
  language?: 'ar' | 'en';
}): Record<string, string> {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  if (options.sessionId) {
    headers['X-Session-Id'] = options.sessionId;
  }

  if (options.language) {
    headers['Accept-Language'] = options.language;
  }

  return headers;
}
