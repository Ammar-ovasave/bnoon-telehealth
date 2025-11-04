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
}) {
  try {
    const file = await fs.readFile(path.resolve("src", "templates", "confirm-appointment.html"), { encoding: "utf-8" });
    const html = file
      .replace(/appointmentLink/g, params.appointmentLink)
      .replace(/{{appointmentDate}}/g, params.appointmentDate)
      .replace(/appointmentTime/g, params.appointmentTime)
      .replace(/location/g, params.location)
      .replace(/serviceName/g, params.serviceName)
      .replace(/patientName/g, params.patientName)
      .replace(/patientEmail/g, params.patientEmail)
      .replace(/patientGender/g, params.patientGender)
      .replace(/doctorName/g, params.doctorName);
    return html;
  } catch (error) {
    console.log("--- error getConfirmAppointmentEmail", error);
    return null;
  }
}
