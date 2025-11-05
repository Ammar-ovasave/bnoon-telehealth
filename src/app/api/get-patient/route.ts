import { cookies } from "next/headers";
import { getCurrentUser } from "../current-user/_services";
import { getPatient } from "@/services/appointment-services";

export async function GET() {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const currentUser = await getCurrentUser();
    const patient = await getPatient({ mrn: currentUser?.mrn ?? "", baseAPIURL: baseAPIURL ?? null });
    return Response.json(patient);
  } catch (error) {
    console.log("---- error getting patient", error);
    return Response.error();
  }
}
