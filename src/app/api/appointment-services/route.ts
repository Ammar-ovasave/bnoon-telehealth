import { getAppointmentServices } from "@/services/appointment-services";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const res = await getAppointmentServices({ activeOnly: url.searchParams.get("activeOnly") === "true" });
    return Response.json(res);
  } catch (e) {
    console.log("--- get appointment services error", e);
  }
}
