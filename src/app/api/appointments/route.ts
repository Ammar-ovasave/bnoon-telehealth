import { CreateAppointmentPayload } from "@/models/CreateAppointmentPayload";
import { getPatient, sendEmail, sendSMS } from "@/services/appointment-services";
import axios from "@/services/axios";

export async function POST(request: Request) {
  try {
    const payload: CreateAppointmentPayload = await request.json();
    const [createAppointmentResponse, patient] = await Promise.all([
      axios.post<{ id?: number }>("/appointments", payload),
      getPatient({ mrn: payload.patientMrn }),
    ]);
    if (!createAppointmentResponse.data.id) {
      console.log("--- create appointment error", createAppointmentResponse.data);
      return Response.error();
    }
    if (!patient) {
      console.log("--- create appointment get patient error", createAppointmentResponse.data);
      return Response.error();
    }
    const url = new URL(request.url);
    const appointmentLink = `${url.origin}/video-call/${createAppointmentResponse.data.id}/prepare`;
    await Promise.all([
      sendEmail({
        mrn: payload.patientMrn,
        email: payload.email,
        body: `<p>Join appointment: <a href="${appointmentLink}"></a></p>`,
        subject: `Appointment Confirmed ${createAppointmentResponse.data.id}`,
      }),
      sendSMS({
        body: `<p>Join appointment: <a href="${appointmentLink}"></a></p>`,
        mobile: [patient.contactNumber ?? ""],
        mrn: patient.mrn ?? "",
      }),
    ]);
    // await createGoogleMeet({
    //   appointmentId: createAppointmentResponse.data.id.toString(),
    //   endDate: payload.endTime,
    //   serviceName: "Test",
    //   startDate: payload.startTime,
    //   userEmail: payload.email,
    // });
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
