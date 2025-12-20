import { CreateDBAppointmentParamsType, getAppointmentsForReminder } from "@/firestore/appointments";
import { getAppointmentReminderEmail } from "@/services/templates";
import { sendEmail, getResource, getAppointmentServices } from "@/services/appointment-services";
import { clinicLocations } from "@/models/ClinicModel";
import { branchURLs } from "@/services/axios";
import { formatInTimeZone } from "date-fns-tz";
import { addHours, addMinutes, subMinutes } from "date-fns";

const KSA_TIMEZONE = "Asia/Riyadh";
const REMINDER_WINDOW_MINUTES = 10;

export async function GET() {
  try {
    const now = new Date();
    const oneDayFromNow = addHours(now, 24);
    const oneDayReminderStart = subMinutes(oneDayFromNow, REMINDER_WINDOW_MINUTES);
    const oneDayReminderEnd = addMinutes(oneDayFromNow, REMINDER_WINDOW_MINUTES);
    const thirtyMinutesFromNow = addMinutes(now, 30);
    const thirtyMinReminderStart = subMinutes(thirtyMinutesFromNow, REMINDER_WINDOW_MINUTES);
    const thirtyMinReminderEnd = addMinutes(thirtyMinutesFromNow, REMINDER_WINDOW_MINUTES);
    const [oneDayAppointments, thirtyMinAppointments] = await Promise.all([
      getAppointmentsForReminder({
        startTimeFrom: oneDayReminderStart.toISOString(),
        startTimeTo: oneDayReminderEnd.toISOString(),
      }),
      getAppointmentsForReminder({
        startTimeFrom: thirtyMinReminderStart.toISOString(),
        startTimeTo: thirtyMinReminderEnd.toISOString(),
      }),
    ]);
    console.log(`--- Found ${oneDayAppointments.length} appointments for 1-day reminder`);
    console.log(`--- Found ${thirtyMinAppointments.length} appointments for 30-minute reminder`);
    const oneDayResults = await Promise.allSettled(
      oneDayAppointments.map((appointment) => sendReminderEmail(appointment, "1-day"))
    );
    const thirtyMinResults = await Promise.allSettled(
      thirtyMinAppointments.map((appointment) => sendReminderEmail(appointment, "30-minute"))
    );
    const oneDaySuccess = oneDayResults.filter((r) => r.status === "fulfilled").length;
    const oneDayFailed = oneDayResults.filter((r) => r.status === "rejected").length;
    const thirtyMinSuccess = thirtyMinResults.filter((r) => r.status === "fulfilled").length;
    const thirtyMinFailed = thirtyMinResults.filter((r) => r.status === "rejected").length;
    console.log(`--- 1-day reminders: ${oneDaySuccess} sent, ${oneDayFailed} failed`);
    console.log(`--- 30-minute reminders: ${thirtyMinSuccess} sent, ${thirtyMinFailed} failed`);
    return Response.json({
      success: true,
      oneDayReminders: {
        found: oneDayAppointments.length,
        sent: oneDaySuccess,
        failed: oneDayFailed,
      },
      thirtyMinReminders: {
        found: thirtyMinAppointments.length,
        sent: thirtyMinSuccess,
        failed: thirtyMinFailed,
      },
    });
  } catch (error) {
    console.log("--- appointment reminders cron error", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function sendReminderEmail(appointment: CreateDBAppointmentParamsType, reminderType: "1-day" | "30-minute") {
  try {
    if (!appointment.email) {
      console.log(`--- Skipping reminder for appointment ${appointment.id} - no email`);
      return;
    }
    if (appointment.statusName === "Cancelled") {
      console.log(`--- Skipping reminder for appointment ${appointment.id} - cancelled`);
      return;
    }
    let baseAPIURL = appointment.baseAPIURL;
    let doctorResource = null;
    if (appointment.resourceIds.length > 0) {
      const resource = await getResource({ resourceId: appointment.resourceIds[0].toString(), baseAPIURL: baseAPIURL });
      if (resource) {
        doctorResource = resource;
      }
    }
    if (!baseAPIURL) {
      baseAPIURL = branchURLs[0] ?? null;
    }
    const clinicBranch = clinicLocations.find((clinic) => clinic.apiUrl === baseAPIURL);
    const service = await getAppointmentServices({ baseAPIURL, activeOnly: false });
    const doctorName = doctorResource?.linkedUserFullName ?? "";
    const serviceName = service?.find((s) => s.id === appointment.serviceId)?.name ?? appointment.serviceName;
    const isVirtualAppointment = appointment.description.toLowerCase()?.includes("virtual visit");
    const appointmentLink = isVirtualAppointment
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/video-call/${appointment.id}/prepare`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/manage-appointments`;
    const appointmentDate = formatInTimeZone(appointment.startTime, KSA_TIMEZONE, "dd-MM-yyyy");
    const appointmentTime = formatInTimeZone(appointment.startTime, KSA_TIMEZONE, "hh:mm a");
    const patientName = `${appointment.firstName ?? ""} ${appointment.middleName ?? ""} ${appointment.lastName ?? ""}`.trim();
    const location = isVirtualAppointment ? "Virtual Visit" : "In Clinic";
    const emailTemplate = await getAppointmentReminderEmail({
      appointmentDate,
      appointmentTime,
      doctorName,
      location,
      serviceName,
      patientName,
      patientEmail: appointment.email,
      appointmentLink,
      clinicName: clinicBranch?.name ?? "Bnoon",
      isVirtual: isVirtualAppointment,
      locationLink: clinicBranch?.locationLink,
    });
    if (!emailTemplate) {
      console.log(`--- Failed to get email template for appointment ${appointment.id}`);
      return;
    }
    const subject = `Appointment Reminder - ${
      reminderType === "1-day" ? "Tomorrow" : "In 30 Minutes"
    } - ${appointmentDate} at ${appointmentTime}`;
    await sendEmail({
      email: appointment.email,
      subject,
      body: emailTemplate,
      mrn: appointment.patientMrn,
      baseAPIURL,
    });
    console.log(`--- Sent ${reminderType} reminder email for appointment ${appointment.id} to ${appointment.email}`);
  } catch (error) {
    console.log(`--- Error sending reminder email for appointment ${appointment.id}:`, error);
    throw error;
  }
}
