import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import useSWR from "swr";

export default function useFertiSmartPatient({ mrn }: { mrn?: string }) {
  const { data, error, isLoading, mutate } = useSWR<FertiSmartPatientModel>(mrn ? `/api/ferti-smart/patients/${mrn}` : null);

  return { data, error, isLoading, mutate };
}
