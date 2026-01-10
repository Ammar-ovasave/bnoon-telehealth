/**
 * Mapping from FertiSmart service codes to bnoon-api service IDs (slugs)
 */
export const SERVICE_CODE_TO_SLUG: Record<string, string> = {
  'API001': 'having-child',
  'API002': 'general-fertility',
  'API003': 'fertility-preservation',
  'API007': 'pregnancy-followup',
  'API006': 'male-andrology',
};

/**
 * Get the service slug for the bnoon-api from a FertiSmart service code
 */
export function getServiceSlug(serviceCode: string): string | null {
  return SERVICE_CODE_TO_SLUG[serviceCode] ?? null;
}

/**
 * Valid service slugs accepted by bnoon-api
 */
export type ServiceSlug =
  | 'having-child'
  | 'general-fertility'
  | 'fertility-preservation'
  | 'pregnancy-followup'
  | 'male-andrology';
