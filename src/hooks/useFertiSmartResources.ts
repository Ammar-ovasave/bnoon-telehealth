import { FSResourceModel } from "@/models/FSResourceModel";
import useSWR from "swr";

export default function useFertiSmartResources() {
  const { data, error, isLoading, isValidating } = useSWR<FSResourceModel[]>(`/api/ferti-smart/resources`);

  return { data, error, isLoading, isValidating };
}
