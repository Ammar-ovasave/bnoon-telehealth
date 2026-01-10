import useSWR from "swr";
import { ServiceDto, GetServicesResponse } from "@/services/bnoon-api/types";
import { useLocale } from "next-intl";
import { clientFetcher } from "@/services/bnoon-api/client-config";

/**
 * Hook to fetch services for a branch from bnoon-api
 * Calls bnoon-api directly: GET /fertismart/services/:branchId
 */
export default function useFertiSmartAPIServices(branchId?: string) {
  const locale = useLocale();

  const { data, error, isLoading, isValidating } = useSWR<GetServicesResponse>(
    // Only fetch if branchId is provided
    branchId ? ["services", branchId, locale] : null,
    () =>
      clientFetcher<GetServicesResponse>(`/fertismart/services/${branchId}`, {
        language: locale as "ar" | "en",
      }),
    {
      // No local caching - use global SWRProvider config
    }
  );

  // Extract services array from response
  const services: ServiceDto[] = data?.services ?? [];

  return { services, data: services, error, isLoading, isValidating };
}
