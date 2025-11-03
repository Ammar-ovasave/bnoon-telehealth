import { getAppointmentServices } from "@/services/appointment-services";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookiesStore = await cookies();
    const url = new URL(request.url);
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const res = await getAppointmentServices({
      activeOnly: url.searchParams.get("activeOnly") === "true",
      baseAPIURL: baseAPIURL ?? null,
    });
    return Response.json(res);
  } catch (e) {
    console.log("--- get appointment services error", e);
    return Response.error();
  }
}
