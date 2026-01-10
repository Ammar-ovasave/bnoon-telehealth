import useSWR from "swr";
import useCurrentUser from "./useCurrentUser";
import { NearestAppointmentResponse } from "@/app/api/user-appointments/nearest/route";

/**
 * Fetch the user's nearest upcoming appointment from Firestore
 * Used for auto-selecting branch on manage-appointments page
 */
export default function useNearestUpcomingAppointment() {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  // Only fetch if user is logged in
  const shouldFetch = !!currentUser?.userId;

  const { data, error, isLoading, mutate } = useSWR<NearestAppointmentResponse>(
    shouldFetch ? "/api/user-appointments/nearest" : null
  );

  return {
    appointment: data?.appointment ?? null,
    error,
    isLoading: isLoadingUser || isLoading,
    mutate,
  };
}
