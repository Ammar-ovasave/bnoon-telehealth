"use server";

import { cookies } from "next/headers";

export async function setClinicBranch(params: { baseURL: string }) {
  const cookieStore = await cookies();
  cookieStore.set("branchAPIURL", params.baseURL);
}
