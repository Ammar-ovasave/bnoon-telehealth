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
      name += ` ${data?.firstName}`;
    }
    if (data?.middleName && data.middleName !== "-") {
      name += ` ${data.middleName}`;
    }
    if (data?.lastName && data.lastName !== "-") {
      name += ` ${data?.lastName}`;
    }
    return name.trim();
  }, [data?.firstName, data?.lastName, data?.middleName]);

  return { data, error, isLoading, fullName, mutate };
}
