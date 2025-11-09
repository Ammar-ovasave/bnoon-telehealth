import { clinicLocations } from "@/models/ClinicModel";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const branchAPIURL = cookieStore.get("branchAPIURL")?.value;
    const branch = { ...(clinicLocations.find((branch) => branch.apiUrl === branchAPIURL) ?? {}) };
    if (branch?.apiUrl) {
      delete branch.apiUrl;
    }
    return Response.json({ branch });
  } catch (e) {
    console.log("---- error get current branch", e);
    return Response.error();
  }
}
