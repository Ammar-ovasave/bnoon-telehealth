import useSWR from "swr";
import { FertiSmartAPIServiceModel } from "../models/FertiSmartAPIServiceModel";

export default function useFertiSmartAPIServices() {
  const { data, error, isLoading } = useSWR<FertiSmartAPIServiceModel[]>(
    `/api/ferti-smart/appointment-services?activeOnly=false`
  );

  return { data, error, isLoading };
}
