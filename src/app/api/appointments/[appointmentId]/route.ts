import { cookies } from "next/headers";
import { getAppointment, sendSMS, updateAppointmentServer } from "@/services/appointment-services";
import { getCurrentUser } from "../../current-user/_services";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";
import { format } from "date-fns";

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

export async function PATCH(request: Request, context: { params: Promise<{ appointmentId: string }> }) {
  try {
    const [requestJson, params, cookieStore, currentUser] = await Promise.all([
      request.json(),
      context.params,
      cookies(),
      getCurrentUser(),
    ]);
    if (!currentUser) {
      return Response.error();
    }
    const payload: UpdateAppointmentPayload = requestJson;
    const baseAPIURL = cookieStore.get("branchAPIURL")?.value;
    const appointment = await getAppointment({ appointmentId: params.appointmentId, baseAPIURL: baseAPIURL });
    if (appointment?.patientMrn !== currentUser?.mrn) {
      return Response.error();
    }
    const res = await updateAppointmentServer({ ...payload, baseAPIURL: baseAPIURL });
    if (res === null) {
      return Response.error();
    }
    const url = new URL(request.url);
    const patientFullName = `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`;
    const appointmentLink = `${url.origin}/video-call/${params.appointmentId}/prepare`;
    if (payload.type === "reschedule") {
      await sendSMS({
        mobileNumber: currentUser?.contactNumber,
        message: `عزيزي ${patientFullName} ، موعدك في ${format(appointment.time?.start ?? "", "dd-MM-yyyy")} ${format(
          appointment.time?.start ?? "",
          "hh:mm a"
        )} مع ${appointment.resources?.[0].name} قد تغير، موعدك الجديد في ${format(
          payload.startTime ?? "",
          "dd-MM-yyyy"
        )} ${format(payload.startTime ?? "", "hh:mm a")} مع ${appointment.resources?.[0].name}. رقم ملفك : ${
          currentUser.mrn
        } ، مركز بنون الطبي. لمزيد من المعلومات الرجاء الإتصال على : 00966114448080 \n\n ${appointmentLink}`,
      });
    } else if (payload.type === "cancel") {
      await sendSMS({
        mobileNumber: currentUser?.contactNumber,
        message: `عزيزي ${patientFullName} ، موعدك في ${format(appointment.time?.start ?? "", "dd-MM-yyyy")} ${format(
          appointment.time?.start ?? "",
          "hh:mm a"
        )} مع ${appointment.resources?.[0].name} قد تغير، موعدك الجديد في ${format(
          appointment.time?.start ?? "",
          "dd-MM-yyyy"
        )} ${format(appointment.time?.start ?? "", "hh:mm a")} مع ${appointment.resources?.[0].name}. رقم ملفك : ${
          currentUser.mrn
        } ، مركز بنون الطبي. لمزيد من المعلومات الرجاء الإتصال على : 00966114448080`,
      });
    }
    return Response.json(res ?? {});
  } catch (error) {
    console.log("--- PATCH error update appointment", error);
    return Response.error();
  }
}
