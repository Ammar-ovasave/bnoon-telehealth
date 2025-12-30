import { ClinicBranchID } from "@/models/ClinicModel";
import { useCallback } from "react";
import useSWR from "swr";

export interface UserPreferencesData {
  mrn: string;
  defaultBranchId: ClinicBranchID | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function useUserPreferences() {
  const { data, error, isLoading, mutate } = useSWR<UserPreferencesData>(
    "/api/user-preferences",
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 1,
    }
  );

  const setDefaultBranch = useCallback(
    async (branchId: ClinicBranchID): Promise<boolean> => {
      try {
        const response = await fetch("/api/user-preferences", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ defaultBranchId: branchId }),
        });

        if (!response.ok) {
          throw new Error("Failed to set default branch");
        }

        const updatedPrefs = await response.json();
        mutate(updatedPrefs, false);
        return true;
      } catch (error) {
        console.error("Error setting default branch:", error);
        return false;
      }
    },
    [mutate]
  );

  const clearDefaultBranch = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/user-preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ defaultBranchId: null }),
      });

      if (!response.ok) {
        throw new Error("Failed to clear default branch");
      }

      mutate({ ...data!, defaultBranchId: null }, false);
      return true;
    } catch (error) {
      console.error("Error clearing default branch:", error);
      return false;
    }
  }, [data, mutate]);

  return {
    data,
    error,
    isLoading,
    mutate,
    defaultBranchId: data?.defaultBranchId ?? null,
    hasDefaultBranch: data?.defaultBranchId != null,
    setDefaultBranch,
    clearDefaultBranch,
  };
}
