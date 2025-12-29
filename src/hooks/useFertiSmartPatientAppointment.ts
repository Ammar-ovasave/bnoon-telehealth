import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import useSWR from "swr";
import useCurrentUser from "./useCurrentUser";

export default function useFertiSmartPatientAppointment() {
  const { data: currentUser } = useCurrentUser();

  // Only fetch appointments when user is authenticated
  const shouldFetch = !!currentUser?.mrn;

  const { data, error, isLoading, mutate } = useSWR<FertiSmartAppointmentModel[]>(
    shouldFetch ? `/api/get-patient-appointments` : null
  );

  return { data, error, isLoading, mutate };
}
