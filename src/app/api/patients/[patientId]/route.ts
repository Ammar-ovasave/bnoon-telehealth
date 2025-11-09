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
      firstName: patient.firstName,
      lastName: patient.lastName,
      contactNumber: patient.contactNumber,
      emailAddress: patient.emailAddress,
      branchId: patient.branch?.id,
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
    console.log("--- update patient", params);
    const res = await axios.patch<{ id?: number }>(
      params.baseAPIURL ? `${params.baseAPIURL}/patients/${params.mrn}` : `/patients/${params.mrn}`,
      params
    );
    return res.data;
  } catch (error) {
    console.log("--- updatePatient error", error);
    return null;
  }
}
