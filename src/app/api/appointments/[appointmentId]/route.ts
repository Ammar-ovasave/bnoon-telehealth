import { cookies } from "next/headers";
import {
  createVideoConsultationCalendarEvent,
  getAppointment,
  getPatient,
  getSMSTemplates,
  sendEmail,
  sendSMS,
  updateAppointmentServer,
} from "@/services/appointment-services";
import { getCurrentUser } from "../../current-user/_services";
import { UpdateAppointmentPayload } from "@/models/UpdateAppointmentPayload";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";
import { getCancelAppointmentEmail, getRescheduleAppointmentEmail } from "@/services/templates";
import { clinicLocations } from "@/models/ClinicModel";
import { getLocale } from "next-intl/server";
import { updateAppointmentDB } from "@/firestore/appointments";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import { ICalAttendeeStatus, ICalCalendarMethod, ICalEventStatus } from "ical-generator";

const KSA_TIMEZONE = "Asia/Riyadh";

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
    const [requestJson, params, cookieStore, currentUser, locale] = await Promise.all([
      request.json(),
      context.params,
      cookies(),
      getCurrentUser(),
      getLocale(),
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
    const isVirtualAppointment = payload.description === "Virtual Visit";
    const [currentUserPatient] = await Promise.all([
      getPatient({ mrn: currentUser.mrn, baseAPIURL: baseAPIURL ?? null }),
      updateAppointmentDB(params.appointmentId, payload),
    ]);
    const url = new URL(request.url);
    const patientFullName = `${currentUser.firstName ?? ""} ${currentUserPatient?.middleName ?? ""} ${
      currentUser.lastName ?? ""
    }`.trim();
    const appointmentLink = isVirtualAppointment
      ? `${url.origin}/video-call/${params.appointmentId}/prepare`
      : `${url.origin}/manage-appointments`;
    const doctorName = appointment.resources?.[0].linkedUserFullName || appointment.resources?.[0].name || "";
    const serviceName = appointment.service?.name ?? "";
    const location = appointment.description?.toLocaleLowerCase().includes("virtual") ? "Virtual Visit" : "In Clinic";
    const oldDate = formatInTimeZone(appointment.time?.start ?? "", KSA_TIMEZONE, "dd-MM-yyyy");
    const oldTime = formatInTimeZone(appointment.time?.start ?? "", KSA_TIMEZONE, "hh:mm a");
    const patientEmail = currentUser.emailAddress ?? "";
    const clinicBranch = clinicLocations.find((clinic) => clinic.apiUrl === baseAPIURL);
    if (payload.type === "reschedule") {
      const newDate = formatInTimeZone(payload.startTime ?? "", KSA_TIMEZONE, "dd-MM-yyyy");
      const newTime = formatInTimeZone(payload.startTime ?? "", KSA_TIMEZONE, "hh:mm a");
      const newStartTimeForCalendar = payload.startTime ? toZonedTime(parseISO(payload.startTime), KSA_TIMEZONE) : new Date();
      const emailTemplate = await getRescheduleAppointmentEmail({
        patientName: patientFullName,
        doctorName: doctorName,
        oldDate: oldDate,
        oldTime: oldTime,
        newDate: newDate,
        newTime: newTime,
        serviceName: serviceName,
        location: location,
        appointmentLink: appointmentLink,
        clinicName: clinicBranch?.name ?? "",
        isVirtual: location.toLowerCase().includes("virtual"),
        locationLink: clinicBranch?.locationLink,
        locale: locale,
      });
      await Promise.all([
        sendUpdatedAppointmentSMS({
          fullName: patientFullName,
          mrn: currentUser.mrn ?? "",
          doctorName: doctorName,
          oldDate: oldDate,
          oldTime: oldTime,
          newDate: newDate,
          newTime: newTime,
          mobileNumber: currentUser?.contactNumber ?? "",
        }),
        patientEmail
          ? sendEmail({
              baseAPIURL: baseAPIURL ?? null,
              mrn: currentUser.mrn ?? "",
              email: patientEmail,
              body:
                emailTemplate ??
                `<p>Your appointment has been rescheduled to ${newDate} at ${newTime}. <a href="${appointmentLink}">Join Appointment</a></p>`,
              subject: `Appointment Rescheduled ${params.appointmentId}`,
              attachments: [
                {
                  filename: "invite.ics",
                  content: createVideoConsultationCalendarEvent({
                    callDurationInMinutes: VISIT_DURATION_IN_MINUTES,
                    dateAndTime: newStartTimeForCalendar,
                    joinCallUrl: appointmentLink,
                    orderId: params.appointmentId,
                    testName: appointment.service?.name ?? "",
                    userEmail: patientEmail,
                    userName: `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`,
                    description: `Bnoon - ${appointment.service?.name ?? ""}`,
                  }).toString(),
                  contentType: "text/calendar; method=REQUEST",
                },
              ],
            })
          : Promise.resolve(null),
      ]);
    } else if (payload.type === "cancel") {
      const locationText = clinicBranch?.name ?? location;
      const mapsLinkText = locale === "ar" ? "خرائط جوجل" : "Google Maps";
      const locationLink = clinicBranch?.locationLink
        ? ` <a href="${clinicBranch.locationLink}" style="color: #d32f2f; text-decoration: none">${mapsLinkText}</a>`
        : "";
      const oldStartTimeForCalendar = appointment.time?.start
        ? toZonedTime(parseISO(appointment.time.start), KSA_TIMEZONE)
        : new Date();
      const emailTemplate = await getCancelAppointmentEmail({
        patientName: patientFullName,
        appointmentDate: oldDate,
        appointmentTime: oldTime,
        location: locationText,
        locationLink: locationLink,
        doctorName: doctorName,
        locale: locale,
      });
      await Promise.all([
        sendCancelledAppointmentSMS({
          fullName: patientFullName,
          mrn: currentUser.mrn ?? "",
          doctorName: doctorName,
          appointmentDate: oldDate,
          appointmentTime: oldTime,
          mobileNumber: currentUser?.contactNumber ?? "",
        }),
        patientEmail
          ? sendEmail({
              baseAPIURL: baseAPIURL ?? null,
              mrn: currentUser.mrn ?? "",
              email: patientEmail,
              body: emailTemplate ?? `<p>Your appointment on ${oldDate} at ${oldTime} has been cancelled.</p>`,
              subject: `Appointment Cancelled ${params.appointmentId}`,
              attachments: [
                {
                  filename: "invite.ics",
                  content: createVideoConsultationCalendarEvent({
                    callDurationInMinutes: VISIT_DURATION_IN_MINUTES,
                    dateAndTime: oldStartTimeForCalendar,
                    joinCallUrl: appointmentLink,
                    orderId: params.appointmentId,
                    testName: appointment.service?.name ?? "",
                    status: ICalEventStatus.CANCELLED,
                    attendeeStatus: ICalAttendeeStatus.DECLINED,
                    method: ICalCalendarMethod.CANCEL,
                    userEmail: patientEmail,
                    userName: `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`,
                    description: `Bnoon - ${appointment.service?.name ?? ""}`,
                  }).toString(),
                  contentType: "text/calendar; method=REQUEST",
                },
              ],
            })
          : Promise.resolve(null),
      ]);
    }
    return Response.json(res ?? {});
  } catch (error) {
    console.log("--- PATCH error update appointment", error);
    return Response.error();
  }
}

async function sendUpdatedAppointmentSMS(params: {
  fullName: string;
  mrn: string;
  doctorName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  // appointmentLink: string;
  mobileNumber: string;
}) {
  try {
    const [cookiesStore, locale] = await Promise.all([cookies(), getLocale()]);
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const templates = await getSMSTemplates({ baseAPIURL: baseAPIURL });
    const templateText = templates?.new[locale as "ar" | "en"] || templates?.new.en || templates?.new.ar;
    if (!templateText) {
      return null;
    }
    const textContent = templateText
      .replace(/{{PATIENT_NAME}}/gi, params.fullName)
      .replace(/{{DATE_OLD}}/gi, params.oldDate)
      .replace(/{{TIME_OLD}}/gi, params.oldTime)
      .replace(/{{NEW_DATE}}/gi, params.newDate)
      .replace(/{{DATE}}/gi, params.newDate)
      .replace(/{{TIME}}/gi, params.newTime)
      .replace(/{{NEW_TIME}}/gi, params.newTime)
      .replace(/{{RESOURCE_NAME_OLD}}/gi, params.doctorName)
      .replace(/{{RESOURCE_NAME}}/gi, params.doctorName)
      .replace(/{{PATIENT_MRN}}/gi, params.mrn);
    const success = await sendSMS({
      mobileNumber: params.mobileNumber,
      message: textContent,
    });
    return success;
  } catch (error) {
    console.log("--- sendUpdatedAppointmentSMS error", error);
    return null;
  }
}

async function sendCancelledAppointmentSMS(params: {
  fullName: string;
  mrn: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  mobileNumber: string;
}) {
  try {
    const [cookiesStore, locale] = await Promise.all([cookies(), getLocale()]);
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const templates = await getSMSTemplates({ baseAPIURL: baseAPIURL });
    const templateText = templates?.cancelled[locale as "ar" | "en"] || templates?.cancelled.en || templates?.cancelled.ar;
    if (!templateText) {
      return null;
    }
    const textContent = templateText
      .replace(/{{PATIENT_NAME}}/gi, params.fullName)
      .replace(/{{DATE}}/gi, params.appointmentDate)
      .replace(/{{TIME}}/gi, params.appointmentTime)
      .replace(/{{RESOURCE_NAME}}/gi, params.doctorName)
      .replace(/{{PATIENT_MRN}}/gi, params.mrn);
    const success = await sendSMS({
      mobileNumber: params.mobileNumber,
      message: textContent,
    });
    return success;
  } catch (error) {
    console.log("--- sendCancelledAppointmentSMS error", error);
    return null;
  }
}
