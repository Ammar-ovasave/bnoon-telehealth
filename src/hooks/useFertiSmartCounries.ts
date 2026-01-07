import { useMemo } from "react";
import useSWR from "swr";

export default function useFertiSmartCountries() {
  const { data: rawData, error, isLoading } = useSWR<{ id?: number; name?: string }[]>(`/api/ferti-smart/definitions/countries`);

  // Sort countries with Saudi Arabia first
  const data = useMemo(() => {
    if (!rawData) return rawData;
    const filtered = rawData.filter((item) => item.name !== "(Not Specified)");
    return filtered.sort((a, b) => {
      // Saudi Arabia always first
      if (a.name?.toLowerCase().includes("saudi")) return -1;
      if (b.name?.toLowerCase().includes("saudi")) return 1;
      // Then alphabetically
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [rawData]);

  const nationalities = useMemo(() => {
    return data?.map((item) => item.name);
  }, [data]);

  return { data, error, isLoading, nationalities };
}
