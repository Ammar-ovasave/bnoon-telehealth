import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import useSWR from "swr";

type CurrentUserType = Pick<FertiSmartPatientModel, "mrn" | "firstName" | "lastName" | "contactNumber" | "emailAddress">;

export default function useCurrentUser() {
  const { data, error, isLoading } = useSWR<CurrentUserType>(`/api/current-user`, {
    errorRetryCount: 0,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  return { data, error, isLoading };
}
