import { AppointmentServiceModel } from "@/models/AppointmentServiceModel";
import useSWR from "swr";

export default function useAppointmentServices({ activeOnly }: { activeOnly?: boolean }) {
  const { data, error, isLoading } = useSWR<AppointmentServiceModel[]>(
    `/api/appointment-services?activeOnly=${activeOnly ?? false}`
  );

  return { data, error, isLoading };
}
