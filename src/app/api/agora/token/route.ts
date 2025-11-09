import { RtcRole, RtcTokenBuilder } from "agora-token";
import { addHours, differenceInSeconds } from "date-fns";
import { getAppointment } from "@/services/appointment-services";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookiesStore = await cookies();
    const apiUrl = cookiesStore.get("branchAPIURL")?.value;
    const url = new URL(request.url);
    const appointmentId = url.searchParams.get("appointmentId");
    const userId = url.searchParams.get("userId");
    if (!appointmentId || !userId) {
      console.log("get agora token error no appointment id or user id", url.toString());
      return Response.error();
    }
    const appointment = await getAppointment({ appointmentId: appointmentId, baseAPIURL: apiUrl ?? undefined });
    if (!appointment?.id) {
      console.log("get agora token error no appointment");
      return Response.error();
    }
    const serviceEnd = addHours(new Date(appointment?.time?.end ?? ""), 5);
    const appId = process.env.AGORA_APP_ID ?? "";
    const appCertificate = process.env.AGORA_APP_CERTIFICATE ?? "";
    const channelName = appointment.id.toString();
    const uid = userId;
    const role = RtcRole.PUBLISHER;
    const tokenExpiry = Math.abs(differenceInSeconds(serviceEnd, new Date()));
    const tokenExpirationInSecond = tokenExpiry;
    const privilegeExpirationInSecond = tokenExpiry;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      tokenExpirationInSecond,
      privilegeExpirationInSecond
    );
    return Response.json({ token, appId });
  } catch (error) {
    console.log("---- get agora token error", error);
    return Response.error();
  }
}
