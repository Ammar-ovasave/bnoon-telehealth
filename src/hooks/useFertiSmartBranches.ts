import { BranchDto, GetBranchesResponse } from "@/services/bnoon-api/types";
import useSWR from "swr";
import { useLocale } from "next-intl";
import { clientFetcher } from "@/services/bnoon-api/client-config";

/**
 * Hook to fetch all clinic branches from bnoon-api
 * Calls bnoon-api directly: GET /fertismart/branches
 */
export default function useFertiSmartBranches() {
  const locale = useLocale();

  const { data, error, isLoading } = useSWR<GetBranchesResponse>(
    // Include locale in the key to refetch when language changes
    ["branches", locale],
    () =>
      clientFetcher<GetBranchesResponse>("/fertismart/branches", {
        language: locale as "ar" | "en",
      }),
    {
      // No local caching - use global SWRProvider config
    }
  );

  // Extract branches array from response
  const branches: BranchDto[] = data?.branches ?? [];

  // Return both 'data' (for backwards compatibility) and 'branches' (new naming)
  return { data: branches, branches, error, isLoading };
}
