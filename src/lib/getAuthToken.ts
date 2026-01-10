import { cookies } from 'next/headers';
import { AUTH_TOKEN_NAME } from '@/constants';

/**
 * Get auth token from cookies (server-side)
 * Returns null if not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  const cookiesStore = await cookies();
  return cookiesStore.get(AUTH_TOKEN_NAME)?.value || null;
}

/**
 * Get auth token from cookies (server-side)
 * Throws error if not authenticated
 */
export async function requireAuthToken(): Promise<string> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Unauthorized');
  }
  return token;
}
