import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { useMemo } from "react";
import useSWR from "swr";

type CurrentUserType = Pick<FertiSmartPatientModel, "mrn" | "firstName" | "lastName" | "contactNumber" | "emailAddress">;

export default function useCurrentUser() {
  const { data, error, isLoading } = useSWR<CurrentUserType>(`/api/current-user`, {
    errorRetryCount: 0,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const fullName = useMemo(() => {
    let name = "";
    if (data?.firstName) {
      name += data?.firstName;
    }
    if (data?.lastName) {
      name += data?.lastName;
    }
    return name;
  }, [data?.firstName, data?.lastName]);

  return { data, error, isLoading, fullName };
}
