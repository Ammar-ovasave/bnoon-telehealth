import { cookies } from "next/headers";
import axios from "@/services/axios";
import { UpdatePatientPayload } from "@/models/UpdatePatientPayload";

export async function PATCH(request: Request) {
  try {
    const [cookiesStore, requestJson] = await Promise.all([cookies(), request.json()]);
    const payload: UpdatePatientPayload = requestJson;

    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const res = await updatePatient({ ...payload, baseAPIURL: baseAPIURL });

    return Response.json(res);
  } catch (e) {
    console.log("---- error update patient", e);
    return Response.error();
  }
}

async function updatePatient(params: UpdatePatientPayload & { baseAPIURL?: string }) {
  try {
    const [res] = await Promise.all([
      axios.patch<{ id?: number }>(
        params.baseAPIURL ? `${params.baseAPIURL}/patients/${params.mrn}` : `/patients/${params.mrn}`,
        params
      ),
      updatePatientGender({ mrn: params.mrn, sex: params.gender, baseAPIURL: params.baseAPIURL }),
    ]);
    return res.data;
  } catch (error) {
    console.log("--- updatePatient error", error);
    return null;
  }
}

async function updatePatientGender(params: { sex: 0 | 1; baseAPIURL?: string; mrn: string }) {
  try {
    const res = await axios.patch<{ id?: number }>(
      params.baseAPIURL ? `${params.baseAPIURL}/patients/${params.mrn}/sex` : `/patients/${params.mrn}/sex`,
      params
    );
    return res.data;
  } catch (error) {
    console.log("--- updatePatientGender error", error);
    return null;
  }
}
