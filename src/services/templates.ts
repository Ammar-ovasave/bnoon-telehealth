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

export async function getAppointmentReminderEmail(params: {
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  location: string;
  serviceName: string;
  patientName: string;
  patientEmail: string;
  appointmentLink: string;
  clinicName: string;
  isVirtual?: boolean;
  locationLink?: string;
}) {
  try {
    const file = await fs.readFile(path.resolve("src", "templates", "appointment-reminder.html"), { encoding: "utf-8" });
    let virtualVisitSection = "";
    if (params.isVirtual) {
      virtualVisitSection = `
            <tr>
              <td style="padding: 0 30px 20px">
                <p style="margin: 0 0 15px; color: #333333; font-size: 16px; line-height: 24px">Join the call on below link:</p>
                <p style="margin: 0; color: #333333; font-size: 16px; line-height: 24px">
                  <a href="${params.appointmentLink}" style="color: #004e78; text-decoration: underline; word-break: break-all"
                    >${params.appointmentLink}</a
                  >
                </p>
              </td>
            </tr>`;
    }
    let importantInfoItems = "";
    if (params.isVirtual) {
      importantInfoItems = `
                        <li style="margin-bottom: 10px">Please ensure you have a stable internet connection</li>
                        <li style="margin-bottom: 10px">Join the consultation 5 minutes before the scheduled time</li>
                        <li>Please note that any delay in joining the call can result in the cancellation of the appointment.</li>`;
    } else {
      importantInfoItems = `
                        <li style="margin-bottom: 10px">Please arrive 10 minutes before your scheduled appointment time</li>
                        <li style="margin-bottom: 10px">Bring a valid ID and any relevant medical documents</li>
                        <li>If you need to reschedule or cancel, please do so at least 24 hours in advance</li>`;
    }
    let html = file
      .replace(/{{patientName}}/g, params.patientName)
      .replace(/{{appointmentDate}}/g, params.appointmentDate)
      .replace(/{{appointmentTime}}/g, params.appointmentTime)
      .replace(/{{doctorName}}/g, params.doctorName)
      .replace(/{{serviceName}}/g, params.serviceName)
      .replace(/{{location}}/g, params.location)
      .replace(/{{appointmentLink}}/g, params.appointmentLink)
      .replace(/{{clinicName}}/g, params.clinicName)
      .replace(/{{virtualVisitSection}}/g, virtualVisitSection)
      .replace(/{{importantInfoItems}}/g, importantInfoItems);
    if (params.locationLink) {
      html = html.replace(/{{locationLink}}/g, params.locationLink);
    } else {
      html = html.replace(/{{locationLink}}/g, "");
    }
    return html;
  } catch (error) {
    console.log("--- error getAppointmentReminderEmail", error);
    return null;
  }
}
