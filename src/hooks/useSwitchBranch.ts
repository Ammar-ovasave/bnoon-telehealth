import { SwitchBranchPayload } from "@/models/SwitchBranchPayload";
import { useCallback, useState } from "react";
import { mutate } from "swr";

/**
 * Hook for branch switching - NO LONGER uses cookies.
 * Branch selection is now handled via URL parameters only.
 * This hook is kept for revalidating SWR caches when branch changes.
 */
export default function useSwitchBranch() {
  const [loading, setLoading] = useState(false);

  const handleSwitchBranch = useCallback(
    async ({ payload: _payload }: { payload: SwitchBranchPayload }) => {
      setLoading(true);

      // Revalidate appointments cache to refetch with new branch
      // Branch is now passed via URL params, not cookies
      mutate("/api/get-patient-appointments");

      setLoading(false);
    },
    []
  );

  return { loading, handleSwitchBranch };
}
