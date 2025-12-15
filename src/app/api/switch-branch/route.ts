import { clinicLocations } from "@/models/ClinicModel";
import { SwitchBranchPayload } from "@/models/SwitchBranchPayload";
import { cookies } from "next/headers";
import { getCurrentUser } from "../current-user/_services";
import { createPatientServer, getBranches, getPatient, getPatientsByPhoneNumberServer } from "@/services/appointment-services";
import { signJwt } from "@/services/signJwt";
import { AUTH_TOKEN_NAME } from "@/constants";

export async function POST(request: Request) {
  try {
    const [requestJson, cookieStore, currentUser] = await Promise.all([request.json(), cookies(), getCurrentUser()]);
    const payload: SwitchBranchPayload = requestJson;
    const clinic = clinicLocations.find((clinic) => clinic.id === payload.branchId);
    if (!payload.branchId) {
      console.log("--- switch branch error no branch id");
      return Response.error();
    }
    if (!currentUser) {
      cookieStore.set("branchAPIURL", clinic?.apiUrl ?? "");
      return Response.json({});
    }
    // const baseAPIURL = cookieStore.get("branchAPIURL")?.value;
    const newBaseAPIURL = clinic?.apiUrl;
    if (!newBaseAPIURL) {
      console.log("switch branch error not matching clinic base url");
      return Response.error();
    }
    const baseAPIURL = cookieStore.get("branchAPIURL")?.value;
    const [patientsFromNewBranch, patientFromCurrentBranch] = await Promise.all([
      getPatientsByPhoneNumberServer({
        baseAPIURL: newBaseAPIURL,
        phoneNumber: currentUser?.contactNumber ?? "",
      }),
      getPatient({ mrn: currentUser.mrn, baseAPIURL: baseAPIURL ?? null })
    ]);
    let patientFromNewBranch = patientsFromNewBranch?.[0];
    if (!patientFromNewBranch?.mrn) {
      const fertiSmartBranches = await getBranches({ baseAPIURL: newBaseAPIURL });
      const newPatient = await createPatientServer({
        baseAPIURL: newBaseAPIURL,
        branchId: fertiSmartBranches?.[0].id ?? 0,
        patient: {
          contactNumber: currentUser?.contactNumber ?? "",
          firstName: currentUser?.firstName || "-",
          lastName: currentUser?.lastName || "-",
          middleName: patientFromCurrentBranch?.middleName,
          dob: patientFromCurrentBranch?.dob,
          sex: patientFromCurrentBranch?.sex
        },
      });
      if (!newPatient?.mrn) {
        return Response.error();
      }
      patientFromNewBranch = newPatient;
    }
    const authToken = signJwt({
      mrn: patientFromNewBranch.mrn ?? "",
      firstName: patientFromNewBranch.firstName ?? "",
      middleName: patientFromNewBranch.middleName ?? "",
      lastName: patientFromNewBranch.lastName ?? "",
      contactNumber: patientFromNewBranch.contactNumber ?? "",
      emailAddress: patientFromNewBranch.emailAddress ?? "",
      branchId: patientFromNewBranch.branch?.id ?? 0,
    });
    cookieStore.set({ name: AUTH_TOKEN_NAME, value: authToken, httpOnly: true, secure: true });
    cookieStore.set("branchAPIURL", newBaseAPIURL);
    return Response.json({});
  } catch (error) {
    console.log("--- switch branch error", error);
    return Response.error();
  }
}
