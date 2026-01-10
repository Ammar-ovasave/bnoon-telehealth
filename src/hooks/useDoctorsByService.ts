import useSWR from "swr";
import { useLocale } from "next-intl";
import { clientFetcher } from "@/services/bnoon-api/client-config";
import type { GetDoctorsResponse, DoctorDto, BranchId } from "@/services/bnoon-api/types";

interface UseDoctorsByServiceParams {
  branchId: BranchId | string | null;
  serviceId: string | null;
}

interface UseDoctorsByServiceResult {
  doctors: DoctorDto[];
  isLoading: boolean;
  error: Error | null;
  isValidating: boolean;
}

/**
 * Hook to fetch doctors for a specific service at a branch
 * Calls bnoon-api directly: GET /fertismart/:branchId/services/:serviceId/doctors
 */
export default function useDoctorsByService({
  branchId,
  serviceId,
}: UseDoctorsByServiceParams): UseDoctorsByServiceResult {
  const locale = useLocale();

  // Only fetch if both branchId and serviceId are provided
  const shouldFetch = branchId && serviceId;
  const url = shouldFetch
    ? `/fertismart/${branchId}/services/${serviceId}/doctors`
    : null;

  const { data, error, isLoading, isValidating } = useSWR<GetDoctorsResponse>(
    // Include locale in the key to refetch when language changes
    url ? [url, locale] : null,
    ([url]) =>
      clientFetcher<GetDoctorsResponse>(url, {
        language: locale as "ar" | "en",
      }),
    {
      // No local caching - use global SWRProvider config
    }
  );

  return {
    doctors: data?.doctors ?? [],
    isLoading,
    error: error ?? null,
    isValidating,
  };
}
