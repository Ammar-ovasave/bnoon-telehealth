"use server";

import { clinicLocations } from "@/models/ClinicModel";
import { cookies } from "next/headers";

export async function setClinicBranch(params: { id: string }) {
  const cookieStore = await cookies();
  const clinic = clinicLocations.find((clinic) => clinic.id === params.id);
  cookieStore.set("branchAPIURL", clinic?.apiUrl ?? "");
}
