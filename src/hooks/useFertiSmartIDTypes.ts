import useSWR from "swr";

export default function useFertiSmartIDTypes() {
  const { data, error, isLoading } = useSWR<{ id?: number; name?: string }[]>(`/api/ferti-smart/definitions?typeId=9`);

  return { data, error, isLoading };
}
