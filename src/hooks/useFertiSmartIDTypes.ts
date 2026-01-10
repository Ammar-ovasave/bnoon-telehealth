import useSWR from "swr";

export default function useFertiSmartIDTypes() {
  const { data, error, isLoading } = useSWR<{ id?: number; name?: string }[]>(`/api/id-types`);

  return { data, error, isLoading };
}
