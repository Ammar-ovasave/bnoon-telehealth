import { AppointmentDetailDto } from "@/services/bnoon-api/types";
import useSWR from "swr";

/**
 * Hook to fetch a single appointment by UUID
 * Uses the bnoon-api endpoint which syncs status with FertiSmart
 */
export default function useFertiSmartAppointment({ id }: { id?: string }) {
  const { data, error, isLoading, mutate } = useSWR<AppointmentDetailDto>(
    id ? `/api/appointments/${id}` : null
  );

  return { data, error, isLoading, mutate };
}
