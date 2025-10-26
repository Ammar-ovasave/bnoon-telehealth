import useCurrentUser from "./useCurrentUser";
import useFertiSmartPatientAppointment from "./useFertiSmartPatientAppointment";

export default function useCurrentUserAppointments() {
  const { data: currentUserData } = useCurrentUser();

  const { data, error, isLoading } = useFertiSmartPatientAppointment({ mrn: currentUserData?.mrn });

  return { data, error, isLoading };
}
