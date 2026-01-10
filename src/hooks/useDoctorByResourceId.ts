import useSWR from "swr";
import { useLocale } from "next-intl";
import { clientFetcher } from "@/services/bnoon-api/client-config";
import type { GetDoctorByResourceIdResponse, DoctorDto, BranchId } from "@/services/bnoon-api/types";

interface UseDoctorByResourceIdParams {
  branchId: BranchId | string | null;
  resourceId: string | number | null;
}

interface UseDoctorByResourceIdResult {
  doctor: DoctorDto | null;
  isLoading: boolean;
  error: Error | null;
  isValidating: boolean;
}

/**
 * Hook to fetch a single doctor by resourceId
 * Calls bnoon-api directly: GET /fertismart/:branchId/doctors/:resourceId
 */
export default function useDoctorByResourceId({
  branchId,
  resourceId,
}: UseDoctorByResourceIdParams): UseDoctorByResourceIdResult {
  const locale = useLocale();

  // Only fetch if both branchId and resourceId are provided
  const shouldFetch = branchId && resourceId;
  const url = shouldFetch
    ? `/fertismart/${branchId}/doctors/${resourceId}`
    : null;

  const { data, error, isLoading, isValidating } = useSWR<GetDoctorByResourceIdResponse>(
    // Include locale in the key to refetch when language changes
    url ? [url, locale] : null,
    ([url]) =>
      clientFetcher<GetDoctorByResourceIdResponse>(url, {
        language: locale as "ar" | "en",
      }),
    {
      // No local caching - use global SWRProvider config
    }
  );

  return {
    doctor: data?.doctor ?? null,
    isLoading,
    error: error ?? null,
    isValidating,
  };
}
