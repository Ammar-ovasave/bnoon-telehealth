import { cookies } from "next/headers";
import { getCurrentUser } from "../../current-user/_services";
import { UpdatePatientPayload } from "@/models/UpdatePatientPayload";
import { getPatient } from "@/services/appointment-services";
import { signJwt } from "@/services/signJwt";
import { AUTH_TOKEN_NAME } from "@/constants";
import axios from "@/services/axios";

export async function PATCH(request: Request) {
  try {
    const [currentUser, cookiesStore, requestJson] = await Promise.all([getCurrentUser(), cookies(), request.json()]);
    const payload: UpdatePatientPayload = requestJson;
    if (currentUser?.mrn !== payload.mrn) {
      return Response.error();
    }
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const res = await updatePatient({ ...payload, baseAPIURL: baseAPIURL });
    const patient = await getPatient({ mrn: payload.mrn, baseAPIURL: baseAPIURL ?? null });
    if (!patient?.mrn) {
      console.log("--- update patient get patient error", patient);
      return Response.error();
    }
    const authToken = signJwt({
      mrn: patient.mrn,
      firstName: patient.firstName ?? "",
      middleName: patient.middleName ?? "",
      lastName: patient.lastName ?? "",
      contactNumber: patient.contactNumber ?? "",
      emailAddress: patient.emailAddress ?? "",
      branchId: patient.branch?.id ?? 0,
    });
    cookiesStore.set({ name: AUTH_TOKEN_NAME, value: authToken, httpOnly: true, secure: true });
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
