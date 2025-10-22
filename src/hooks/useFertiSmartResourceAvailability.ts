import { FertiSmartResourceDayTimeSlotModel } from "@/models/FertiSmartResourceDayTimeSlotModel";
import useSWR from "swr";

export default function useFertiSmartResourceAvailability({
  date,
  resourceId,
  serviceDuration,
}: {
  resourceId?: string;
  date?: string;
  serviceDuration?: number;
}) {
  const { data, error, isLoading } = useSWR<FertiSmartResourceDayTimeSlotModel[]>(
    date && resourceId && serviceDuration
      ? `/api/ferti-smart/resources/${resourceId}/availability?date=${date}&serviceDuration=${serviceDuration}`
      : null
  );

  return { data, error, isLoading };
}
