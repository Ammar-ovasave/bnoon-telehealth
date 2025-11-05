import { cookies } from "next/headers";
import { getAppointment } from "@/services/appointment-services";
import { getCurrentUser } from "../../current-user/_services";

export async function GET(request: Request, context: { params: Promise<{ appointmentId: string }> }) {
  try {
    const params = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.error();
    }
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const appointment = await getAppointment({ appointmentId: params.appointmentId, baseAPIURL: baseAPIURL });
    if (appointment?.patientMrn !== currentUser?.mrn) {
      return Response.error();
    }
    return Response.json(appointment);
  } catch (error) {
    console.log("---- error getting patient appointment by id", error);
    return Response.error();
  }
}
