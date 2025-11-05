import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { useMemo } from "react";
import useSWR from "swr";

export default function useFertiSmartPatient() {
  const { data, error, isLoading, mutate } = useSWR<FertiSmartPatientModel>(`/api/get-patient`);

  const fullName = useMemo(() => {
    let name = "";
    if (data?.firstName && data.firstName !== "-") {
      name += ` ${data?.firstName}`;
    }
    if (data?.lastName && data.lastName !== "-") {
      name += ` ${data?.lastName}`;
    }
    return name.trim();
  }, [data?.firstName, data?.lastName]);

  return { data, error, isLoading, fullName, mutate };
}
