import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import useSWR from "swr";

export default function useFertiSmartPatientAppointment({ mrn }: { mrn?: string }) {
  const { data, error, isLoading } = useSWR<FertiSmartAppointmentModel[]>(mrn ? `/patients/${mrn}/appointments` : null);

  return { data, error, isLoading };
}
