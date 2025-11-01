import { FertiSmartAppointmentStatusModel } from "@/models/FertiSmartAppointmentStatusModel";
import useSWR from "swr";

export default function useFertiSmartAppointmentStatuses() {
  const { data, error, isLoading } = useSWR<FertiSmartAppointmentStatusModel[]>(`/api/ferti-smart/appointments/statuses`);

  return { data, error, isLoading };
}
