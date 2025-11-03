import { getResources } from "@/services/appointment-services";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookiesStore = await cookies();
    const branchAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const res = await getResources({ baseAPIURL: branchAPIURL ?? null });
    return Response.json(res);
  } catch (e) {
    console.log("--- get resources services error", e);
  }
}
