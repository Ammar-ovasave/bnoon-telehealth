import * as fs from "fs/promises";
import * as path from "path";

export async function getConfirmAppointmentEmail(params: {
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  location: string;
  serviceName: string;
  patientName: string;
  patientEmail: string;
  patientGender: string;
  appointmentLink: string;
  clinicName: string;
}) {
  try {
    const file = await fs.readFile(path.resolve("src", "templates", "confirm-appointment.html"), { encoding: "utf-8" });
    const html = file
      .replace(/{{appointmentLink}}/g, params.appointmentLink)
      .replace(/{{appointmentDate}}/g, params.appointmentDate)
      .replace(/{{appointmentTime}}/g, params.appointmentTime)
      .replace(/{{location}}/g, params.location)
      .replace(/{{serviceName}}/g, params.serviceName)
      .replace(/{{patientName}}/g, params.patientName)
      .replace(/{{patientEmail}}/g, params.patientEmail)
      .replace(/{{patientGender}}/g, params.patientGender)
      .replace(/{{doctorName}}/g, params.doctorName)
      .replace(/{{clinicName}}/g, params.clinicName);
    return html;
  } catch (error) {
    console.log("--- error getConfirmAppointmentEmail", error);
    return null;
  }
}

export async function getRescheduleAppointmentEmail(params: {
  patientName: string;
  doctorName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  serviceName: string;
  location: string;
  appointmentLink: string;
  clinicName: string;
}) {
  try {
    const file = await fs.readFile(path.resolve("src", "templates", "reschedule-appointment.html"), { encoding: "utf-8" });
    const html = file
      .replace(/{{patientName}}/g, params.patientName)
      .replace(/{{doctorName}}/g, params.doctorName)
      .replace(/{{oldDate}}/g, params.oldDate)
      .replace(/{{oldTime}}/g, params.oldTime)
      .replace(/{{newDate}}/g, params.newDate)
      .replace(/{{newTime}}/g, params.newTime)
      .replace(/{{serviceName}}/g, params.serviceName)
      .replace(/{{location}}/g, params.location)
      .replace(/{{appointmentLink}}/g, params.appointmentLink)
      .replace(/{{clinicName}}/g, params.clinicName);
    return html;
  } catch (error) {
    console.log("--- error getRescheduleAppointmentEmail", error);
    return null;
  }
}

export async function getCancelAppointmentEmail(params: {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  location: string;
  clinicName: string;
}) {
  try {
    const file = await fs.readFile(path.resolve("src", "templates", "cancel-appointment.html"), { encoding: "utf-8" });
    const html = file
      .replace(/{{patientName}}/g, params.patientName)
      .replace(/{{doctorName}}/g, params.doctorName)
      .replace(/{{appointmentDate}}/g, params.appointmentDate)
      .replace(/{{appointmentTime}}/g, params.appointmentTime)
      .replace(/{{serviceName}}/g, params.serviceName)
      .replace(/{{location}}/g, params.location)
      .replace(/{{clinicName}}/g, params.clinicName);
    return html;
  } catch (error) {
    console.log("--- error getCancelAppointmentEmail", error);
    return null;
  }
}
