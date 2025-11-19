import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import {
  createPatientServer,
  getAppointmentServices,
  getBranches,
  getPatient,
  getResource,
  getSMSTemplates,
  sendEmail,
  sendSMS,
  updateAppointmentServer,
} from "@/services/appointment-services";
import { cookies } from "next/headers";
import { getConfirmAppointmentEmail } from "@/services/templates";
import { formatInTimeZone } from "date-fns-tz";
import { AUTH_TOKEN_NAME } from "@/constants";
import { signJwt } from "@/services/signJwt";
import axios from "@/services/axios";

const KSA_TIMEZONE = "Asia/Riyadh";

export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const payload: CreateAppointmentPayload = await request.json();
    const [patient, doctorResource, services] = await Promise.all([
      getPatient({ mrn: payload.patientMrn, baseAPIURL: baseAPIURL ?? null }),
      getResource({ baseAPIURL: baseAPIURL ?? null, resourceId: payload.resourceIds[0].toString() }),
      getAppointmentServices({ baseAPIURL: baseAPIURL ?? null, activeOnly: false }),
    ]);
    let patientToUse = patient;
    if (!patient) {
      console.log("--- payload.patientMrn", payload.patientMrn);
      const fertiSmartBranches = await getBranches({ baseAPIURL: baseAPIURL ?? null });
      const newPatient = await createPatientServer({
        baseAPIURL: baseAPIURL ?? null,
        branchId: fertiSmartBranches?.[0].id ?? 0,
        patient: { contactNumber: payload.phoneNumber, firstName: payload.firstName || "-", lastName: payload.lastName || "-" },
      });
      patientToUse = newPatient ?? patient;
      console.log("--- create appointment get patient error");
    }
    if (!patientToUse?.mrn) {
      console.log("--- create appointment no patient to use", patientToUse);
      return Response.error();
    }
    payload.patientMrn = patientToUse.mrn;
    const createAppointmentResponse = await axios.post<{ id?: number }>(
      baseAPIURL ? `${baseAPIURL}/appointments` : "/appointments",
      payload
    );
    if (!createAppointmentResponse.data.id) {
      console.log("--- create appointment error", createAppointmentResponse.data);
      return Response.error();
    }
    const service = services?.find((item) => item.id === payload.serviceId);
    const url = new URL(request.url);
    const appointmentLink = `${url.origin}/video-call/${createAppointmentResponse.data.id}/prepare`;
    const appointmentDate = formatInTimeZone(payload.startTime, KSA_TIMEZONE, "dd-MM-yyyy");
    const appointmentTime = formatInTimeZone(payload.startTime, KSA_TIMEZONE, "hh:mm a");
    const emailTemplate = await getConfirmAppointmentEmail({
      appointmentDate: appointmentDate,
      appointmentLink: appointmentLink,
      appointmentTime: appointmentTime,
      doctorName: doctorResource?.linkedUserFullName ?? "",
      location: payload.description.toLocaleLowerCase().includes("virtual") ? "Virtual Visit" : "In Clinic",
      patientEmail: patientToUse.emailAddress ?? "",
      patientGender: patientToUse.sex === 0 ? "female" : "male",
      patientName: `${patientToUse.firstName ?? ""} ${patientToUse.lastName ?? ""}`.trim(),
      serviceName: service?.name ?? "",
    });
    console.log("emailTemplate", emailTemplate);
    await Promise.all([
      updateAppointmentServer({
        type: null,
        baseAPIURL: baseAPIURL,
        appointmentId: createAppointmentResponse.data.id,
        description: `${payload.description} - ${appointmentLink}`,
      }),
      payload.email
        ? sendEmail({
            baseAPIURL: baseAPIURL ?? null,
            mrn: payload.patientMrn,
            email: payload.email,
            body: emailTemplate ?? `<p>Join appointment: <a href="${appointmentLink}"></a></p>`,
            subject: `Appointment Confirmed ${createAppointmentResponse.data.id}`,
          })
        : Promise.resolve(null),
      sendNewAppointmentSMS({
        fullName: `${patientToUse.firstName ?? ""} ${patientToUse.lastName ?? ""}`.trim(),
        mrn: patientToUse.mrn ?? "",
        doctorName: doctorResource?.linkedUserFullName ?? "",
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        appointmentLink: appointmentLink,
        mobileNumber: patientToUse.contactNumber ?? "",
      }),
    ]);
    const authToken = signJwt({
      mrn: patientToUse.mrn ?? "",
      firstName: patientToUse.firstName ?? "",
      middleName: patientToUse.middleName ?? "",
      lastName: patientToUse.lastName ?? "",
      contactNumber: patientToUse.contactNumber ?? "",
      emailAddress: patientToUse.emailAddress ?? "",
      branchId: patientToUse.branch?.id ?? 0,
    });
    const cookieStore = await cookies();
    cookieStore.set({ name: AUTH_TOKEN_NAME, value: authToken, httpOnly: true, secure: true });
    return Response.json(createAppointmentResponse.data);
  } catch (error) {
    console.log("--- create appointment error", error);
    return Response.error();
  }
}

async function sendNewAppointmentSMS(params: {
  fullName: string;
  mrn: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentLink: string;
  mobileNumber: string;
}) {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const templates = await getSMSTemplates({ baseAPIURL: baseAPIURL });
    if (!templates?.new) {
      return null;
    }
    const textContent = templates.new
      .replace(/{{PATIENT_NAME}}/g, params.fullName)
      .replace(/{{DATE}}/g, params.appointmentDate)
      .replace(/{{RESOURCE_NAME}}/g, params.doctorName)
      .replace(/{{TIME}}/g, params.appointmentTime)
      .replace(/{{PATIENT_MRN}}/g, params.mrn);
    const messageWithLink = textContent.includes(params.appointmentLink)
      ? textContent
      : `${textContent}\n\n${params.appointmentLink}`;
    const success = await sendSMS({
      mobileNumber: params.mobileNumber,
      message: messageWithLink,
    });
    return success;
  } catch (error) {
    console.log("--- sendNewAppointmentSMS error", error);
    return null;
  }
}
