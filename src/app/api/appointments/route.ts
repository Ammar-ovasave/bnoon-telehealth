import axios from "@/services/axios";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const createAppointmentResponse = await axios.post<{ id?: number }>("/appointments", payload);
    if (!createAppointmentResponse.data.id) {
      console.log("--- create appointment error", createAppointmentResponse.data);
      return Response.error();
    }
    return Response.json(createAppointmentResponse.data);
  } catch (error) {
    console.log("--- create appointment error", error);
    return Response.error();
  }
}

function getCalendarClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "service-account.json",
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = google.calendar({ version: "v3", auth });
    return { calendar, auth };
  } catch (error) {
    console.log("--- getCalendarClient error", error);
    return null;
  }
}

async function createGoogleMeet() {
  try {
    const result = getCalendarClient();
    if (!result) return null;
    const { auth, calendar } = result;
    if (!calendar) {
      return null;
    }
    const insertEventPromise = new Promise((resolve, reject) => {
      calendar.events
        .insert({
          calendarId: "primary",
          auth: auth,
          requestBody: {
            summary: "Team Meeting",
            description: "Discuss project updates",
            start: {
              dateTime: "2025-10-26T10:00:00+04:00",
              timeZone: "Asia/Dubai",
            },
            end: {
              dateTime: "2025-10-26T11:00:00+04:00",
              timeZone: "Asia/Dubai",
            },
            attendees: [{ email: "user@example.com" }],
            anyoneCanAddSelf: true,
            conferenceData: {
              createRequest: {
                requestId: "unique-request-id-" + Date.now(),
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          },
          conferenceDataVersion: 1,
          sendUpdates: "all",
        })
        .then(resolve)
        .catch(reject);
    });
    console.log("✅ Event created:");
    console.log("Meeting Link:", response.data.hangoutLink);
    console.log("Calendar Event:", response.data.htmlLink);
  } catch (error) {
    console.log("--- create google meet error", error);
    return null;
  }
}
