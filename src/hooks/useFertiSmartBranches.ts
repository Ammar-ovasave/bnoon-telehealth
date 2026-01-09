import { FertiSmartBranchModel } from "@/models/FertiSmartBranchModel";
import useSWR from "swr";
import useCurrentBranch from "./useCurrentBranch";

export default function useFertiSmartBranches() {
  const { data: branchData, isLoading: isLoadingBranch } = useCurrentBranch();

  // Only fetch when branch is set
  const shouldFetch = !!branchData?.branch?.id;

  const { data, error, isLoading } = useSWR<FertiSmartBranchModel[]>(
    shouldFetch ? `/api/ferti-smart/branches` : null
  );

  return { data, error, isLoading: isLoadingBranch || isLoading };
}
