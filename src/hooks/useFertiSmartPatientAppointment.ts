import { AppointmentDto } from "@/services/bnoon-api/types";
import { ClinicBranchID } from "@/models/ClinicModel";
import useSWR from "swr";
import useCurrentUser from "./useCurrentUser";

interface UseFertiSmartPatientAppointmentOptions {
  /** Required: Branch ID (from URL params) */
  branchId: ClinicBranchID | null;
}

/**
 * Fetches patient appointments for a specific branch.
 * Branch ID must be provided (no cookie fallback).
 */
export default function useFertiSmartPatientAppointment(options: UseFertiSmartPatientAppointmentOptions) {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  const branchId = options.branchId;

  // Only fetch appointments when:
  // 1. User is authenticated (has userId)
  // 2. Branch is provided
  const shouldFetch = !!currentUser?.userId && !!branchId;

  // Include branchId in the SWR key so it refetches when branch changes
  const { data, error, isLoading: isLoadingAppointments, mutate } = useSWR<AppointmentDto[]>(
    shouldFetch ? `/api/get-patient-appointments?branchId=${branchId}` : null
  );

  const isLoading = isLoadingUser || isLoadingAppointments;

  return { data, error, isLoading, mutate };
}
