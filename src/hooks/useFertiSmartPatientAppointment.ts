import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import useSWR from "swr";

export default function useFertiSmartPatientAppointment() {
  const { data, error, isLoading, mutate } = useSWR<FertiSmartAppointmentModel[]>(`/api/get-patient-appointments`);

  return { data, error, isLoading, mutate };
}
