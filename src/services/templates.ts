import * as fs from "fs/promises";
import * as path from "path";

const getTemplateName = (baseName: string, locale?: string) => {
  if (locale === "ar") {
    const ext = path.extname(baseName);
    const name = path.basename(baseName, ext);
    return `${name}-ar${ext}`;
  }
  return baseName;
};

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
  isVirtual?: boolean;
  locationLink?: string;
  locale?: string;
}) {
  try {
    const baseTemplateName = params.isVirtual ? "confirm-appointment.html" : "confirm-appointment-in-clinic.html";
    const templateFileName = getTemplateName(baseTemplateName, params.locale);
    const file = await fs.readFile(path.resolve("src", "templates", templateFileName), { encoding: "utf-8" });
    let html = file
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
    if (params.locationLink) {
      html = html.replace(/{{locationLink}}/g, params.locationLink);
    }
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
  isVirtual?: boolean;
  locationLink?: string;
  locale?: string;
}) {
  try {
    const baseTemplateName = params.isVirtual ? "reschedule-appointment.html" : "reschedule-appointment-in-clinic.html";
    const templateFileName = getTemplateName(baseTemplateName, params.locale);
    const file = await fs.readFile(path.resolve("src", "templates", templateFileName), { encoding: "utf-8" });
    let html = file
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
    if (params.locationLink) {
      html = html.replace(/{{locationLink}}/g, params.locationLink);
    }
    return html;
  } catch (error) {
    console.log("--- error getRescheduleAppointmentEmail", error);
    return null;
  }
}

export async function getCancelAppointmentEmail(params: {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  locationLink?: string;
  doctorName?: string;
  locale?: string;
}) {
  try {
    const templateFileName = getTemplateName("cancel-appointment.html", params.locale);
    const file = await fs.readFile(path.resolve("src", "templates", templateFileName), { encoding: "utf-8" });
    let html = file
      .replace(/{{patientName}}/g, params.patientName)
      .replace(/{{appointmentDate}}/g, params.appointmentDate)
      .replace(/{{appointmentTime}}/g, params.appointmentTime)
      .replace(/{{location}}/g, params.location);
    if (params.locationLink) {
      html = html.replace(/{{locationLink}}/g, params.locationLink);
    } else {
      html = html.replace(/{{locationLink}}/g, "");
    }
    if (params.doctorName) {
      html = html.replace(/{{doctorName}}/g, params.doctorName);
    } else {
      html = html.replace(/{{doctorName}}/g, "");
    }
    return html;
  } catch (error) {
    console.log("--- error getCancelAppointmentEmail", error);
    return null;
  }
}
