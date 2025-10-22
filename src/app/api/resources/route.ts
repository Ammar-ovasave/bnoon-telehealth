import { getResources } from "@/services/appointment-services";

export async function GET() {
  try {
    const res = await getResources();
    return Response.json(res);
  } catch (e) {
    console.log("--- get resources services error", e);
  }
}
