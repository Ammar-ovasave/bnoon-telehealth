import { ClinicLocation } from "@/models/ClinicModel";
import useSWR from "swr";

export default function useCurrentBranch() {
  const { data, error, isLoading, mutate } = useSWR<{ branch: ClinicLocation }>(`/api/current-branch`);

  return { data, error, isLoading, mutate };
}
