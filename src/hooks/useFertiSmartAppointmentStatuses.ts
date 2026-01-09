import { FertiSmartAppointmentStatusModel } from "@/models/FertiSmartAppointmentStatusModel";
import useSWR from "swr";
import useCurrentBranch from "./useCurrentBranch";

export default function useFertiSmartAppointmentStatuses() {
  const { data: branchData, isLoading: isLoadingBranch } = useCurrentBranch();

  // Only fetch when branch is set
  const shouldFetch = !!branchData?.branch?.id;

  const { data, error, isLoading } = useSWR<FertiSmartAppointmentStatusModel[]>(
    shouldFetch ? `/api/ferti-smart/appointments/statuses` : null,
    { dedupingInterval: 60000 * 10 } // 10 minutes
  );

  return { data, error, isLoading: isLoadingBranch || isLoading };
}
