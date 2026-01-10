/**
 * Configuration for bnoon-api client
 * Server-side only - uses internal URL for API calls
 */
export const BNOON_API_CONFIG = {
  // Server-side URL (used from Next.js API routes)
  baseUrl: process.env.BNOON_API_URL || 'http://localhost:3002/api',
  timeout: 30000,
};
