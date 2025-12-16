import { cookies } from "next/headers";
import { getCurrentUser } from "../current-user/_services";
import { getPatientAppointments } from "@/services/appointment-services";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.mrn) {
      return Response.error();
    }
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const appointments = await getPatientAppointments({ mrn: currentUser?.mrn ?? "", baseAPIURL: baseAPIURL });
    if (!appointments) {
      return Response.error();
    }
    return Response.json(appointments);
  } catch (error) {
    console.log("---- error getting patient appointments", error);
    return Response.error();
  }
}
