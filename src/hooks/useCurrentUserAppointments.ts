import useCurrentUser from "./useCurrentUser";
import useFertiSmartPatientAppointment from "./useFertiSmartPatientAppointment";

export default function useCurrentUserAppointments() {
  const { data: currentUserData, isLoading: loadingCurrentUser } = useCurrentUser();

  const {
    data,
    error,
    isLoading: loadingPatientAppointment,
    mutate,
  } = useFertiSmartPatientAppointment({ mrn: currentUserData?.mrn });

  return { data, error, isLoading: loadingPatientAppointment || loadingCurrentUser, mutate };
}
