import { FertiSmartBranchModel } from "@/models/FertiSmartBranchModel";
import useSWR from "swr";

export default function useFertiSmartBranches() {
  const { data, error, isLoading } = useSWR<FertiSmartBranchModel[]>(`/api/ferti-smart/branches`);

  return { data, error, isLoading };
}
