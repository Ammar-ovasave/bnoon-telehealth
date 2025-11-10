import useSWR from "swr";
import { FertiSmartAPIServiceModel } from "../models/FertiSmartAPIServiceModel";

export default function useFertiSmartAPIServices() {
  const { data, error, isLoading } = useSWR<FertiSmartAPIServiceModel[]>(`/api/ferti-smart/api-services`);

  return { data, error, isLoading };
}
