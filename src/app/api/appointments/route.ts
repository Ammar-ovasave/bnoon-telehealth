import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import {
  createPatientServer,
  getAppointmentServices,
  getBranches,
  getPatient,
  getResource,
  sendEmail,
  sendSMS,
  updateAppointmentServer,
} from "@/services/appointment-services";
import { cookies } from "next/headers";
import { getConfirmAppointmentEmail } from "@/services/templates";
import { format } from "date-fns";
import axios from "@/services/axios";
import { AUTH_TOKEN_NAME } from "@/constants";
import { signJwt } from "@/services/signJwt";

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
    // TODO: update appointment description with the appointment link
    const appointmentLink = `${url.origin}/video-call/${createAppointmentResponse.data.id}/prepare`;
    const emailTemplate = await getConfirmAppointmentEmail({
      appointmentDate: format(payload.startTime, "yyyy-MM-dd"),
      appointmentLink: appointmentLink,
      appointmentTime: format(payload.startTime, "hh:mm a"),
      doctorName: doctorResource?.name ?? "",
      location: payload.description.toLocaleLowerCase().includes("virtual") ? "Virtual Visit" : "In Clinic",
      patientEmail: patientToUse.emailAddress ?? "",
      patientGender: patientToUse.sex === 0 ? "female" : "male",
      patientName: `${patientToUse.firstName ?? ""} ${patientToUse.lastName ?? ""}`.trim(),
      serviceName: service?.name ?? "",
    });
    console.log("emailTemplate", emailTemplate);
    await Promise.all([
      updateAppointmentServer({
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
      sendSMS({
        baseAPIURL: baseAPIURL ?? null,
        body: `<p>Join appointment: <a href="${appointmentLink}"></a></p>`,
        mobile: [patientToUse.contactNumber ?? ""],
        mrn: patientToUse.mrn ?? "",
      }),
    ]);
    const authToken = signJwt({
      mrn: patientToUse.mrn,
      firstName: patientToUse.firstName,
      lastName: patientToUse.lastName,
      contactNumber: patientToUse.contactNumber,
      emailAddress: patientToUse.emailAddress,
      branchId: patientToUse.branch?.id,
    });
    const cookieStore = await cookies();
    cookieStore.set({ name: AUTH_TOKEN_NAME, value: authToken, httpOnly: true, secure: true });
    return Response.json(createAppointmentResponse.data);
  } catch (error) {
    console.log("--- create appointment error", error);
    return Response.error();
  }
}

// function getCalendarClient() {
//   try {
//     const auth = new google.auth.GoogleAuth({
//       keyFile: "bnoon-476311-149de792a5ff.json",
//       scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
//     });
//     const calendar = google.calendar({ version: "v3", auth });
//     return { calendar, auth };
//   } catch (error) {
//     console.log("--- getCalendarClient error", error);
//     return null;
//   }
// }

// async function createGoogleMeet({
//   userEmail,
//   endDate,
//   startDate,
//   serviceName,
//   appointmentId,
// }: {
//   appointmentId: string;
//   serviceName: string;
//   userEmail: string;
//   startDate: string;
//   endDate: string;
// }) {
//   try {
//     const result = getCalendarClient();
//     if (!result) return null;
//     const { auth, calendar } = result;
//     if (!calendar) {
//       return null;
//     }
//     const response = await calendar.events.insert({
//       calendarId: "primary",
//       auth: auth,
//       requestBody: {
//         summary: serviceName,
//         description: "Teleconsultation",
//         start: {
//           dateTime: startDate,
//           timeZone: "Asia/Dubai",
//         },
//         end: {
//           dateTime: endDate,
//           timeZone: "Asia/Dubai",
//         },
//         attendees: [{ email: userEmail }],
//         anyoneCanAddSelf: true,
//         conferenceData: {
//           createRequest: {
//             requestId: appointmentId,
//             conferenceSolutionKey: { type: "hangoutsMeet" },
//           },
//         },
//       },
//       conferenceDataVersion: 1,
//       sendUpdates: "all",
//     });
//     console.log("✅ Event created:");
//     console.log("Meeting Link:", JSON.stringify(response));
//   } catch (error) {
//     console.log("--- create google meet error", error);
//     return null;
//   }
// }
