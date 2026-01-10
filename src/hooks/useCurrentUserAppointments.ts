import { ClinicBranchID } from "@/models/ClinicModel";
import useFertiSmartPatientAppointment from "./useFertiSmartPatientAppointment";

interface UseCurrentUserAppointmentsOptions {
  /** Required: Branch ID (from URL params) */
  branchId: ClinicBranchID | null;
}

/**
 * Fetches current user's appointments for a specific branch.
 * Branch ID must be provided (no cookie fallback).
 */
export default function useCurrentUserAppointments(options: UseCurrentUserAppointmentsOptions) {
  const { data, error, isLoading: loadingPatientAppointment, mutate } = useFertiSmartPatientAppointment(options);

  return { data, error, isLoading: loadingPatientAppointment, mutate };
}
