import { TimeSlotDto, GetAvailabilityResponse } from "@/services/bnoon-api/types";
import useSWR from "swr";
import { BNOON_API_CLIENT_CONFIG } from "@/services/bnoon-api/client-config";

/**
 * Hook to fetch availability slots for a doctor from bnoon-api
 * Calls bnoon-api directly: GET /fertismart/:branchId/doctors/:resourceId/availability
 */
export default function useFertiSmartResourceAvailability({
  branchId,
  date,
  resourceId,
  serviceDuration,
}: {
  branchId?: string;
  resourceId?: number;
  date?: string;
  serviceDuration?: number;
}) {
  // Only fetch if all required params are provided
  const shouldFetch = branchId && date && resourceId && serviceDuration;

  const { data, error, isLoading, mutate } = useSWR<GetAvailabilityResponse>(
    shouldFetch
      ? ["availability", branchId, resourceId, date, serviceDuration]
      : null,
    async () => {
      const params = new URLSearchParams({
        date: date!,
        serviceDuration: serviceDuration!.toString(),
      });

      const response = await fetch(
        `${BNOON_API_CLIENT_CONFIG.baseUrl}/fertismart/${branchId}/doctors/${resourceId}/availability?${params}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      return response.json();
    },
    {
      // No local caching - use global SWRProvider config
    }
  );

  // Extract slots array from response
  const slots: TimeSlotDto[] = data?.slots ?? [];

  return { data: slots, error, isLoading, mutate };
}
