import useFertiSmartPatientAppointment from "./useFertiSmartPatientAppointment";

export default function useCurrentUserAppointments() {
  const { data, error, isLoading: loadingPatientAppointment, mutate } = useFertiSmartPatientAppointment();

  return { data, error, isLoading: loadingPatientAppointment, mutate };
}
