import { useMemo } from "react";
import useSWR from "swr";

export default function useFertiSmartCountries() {
  const { data, error, isLoading } = useSWR<{ id?: number; name?: string }[]>(`/api/ferti-smart/definitions/countries`);

  const nationalities = useMemo(() => {
    return data?.filter((item) => item.name !== "(Not Specified)")?.map((item) => item.name);
  }, [data]);

  return { data, error, isLoading, nationalities };
}
