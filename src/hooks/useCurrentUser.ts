import { CurrentUserType } from "@/models/CurrentUserType";
import { useMemo } from "react";
import useSWR from "swr";

export default function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<CurrentUserType>(`/api/current-user`, {
    errorRetryCount: 0,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const fullName = useMemo(() => {
    let name = "";
    if (data?.firstName && data.firstName !== "-") {
      name += data?.firstName;
    }
    if (data?.lastName && data.lastName !== "-") {
      name += data?.lastName;
    }
    return name;
  }, [data?.firstName, data?.lastName]);

  return { data, error, isLoading, fullName, mutate };
}
