import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import useSWR from "swr";

export default function useFertiSmartAppointment({ id }: { id?: string }) {
  const { data, error, isLoading } = useSWR<FertiSmartAppointmentModel>(id ? `/api/ferti-smart/appointments/${id}` : null);

  return { data, error, isLoading };
}
