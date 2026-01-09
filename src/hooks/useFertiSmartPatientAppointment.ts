import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import useSWR from "swr";
import useCurrentUser from "./useCurrentUser";
import useCurrentBranch from "./useCurrentBranch";

export default function useFertiSmartPatientAppointment() {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: currentBranch, isLoading: isLoadingBranch } = useCurrentBranch();

  // Only fetch appointments when:
  // 1. User is authenticated (has userId)
  // 2. Branch is selected (branchAPIURL cookie is set)
  const shouldFetch = !!currentUser?.userId && !!currentBranch?.branch?.id;

  const { data, error, isLoading: isLoadingAppointments, mutate } = useSWR<FertiSmartAppointmentModel[]>(
    shouldFetch ? `/api/get-patient-appointments` : null
  );

  // Include all loading states
  const isLoading = isLoadingUser || isLoadingBranch || isLoadingAppointments;

  return { data, error, isLoading, mutate };
}
