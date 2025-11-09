import { clinicLocations } from "@/models/ClinicModel";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const branchAPIURL = cookieStore.get("branchAPIURL")?.value;
    const branch = clinicLocations.find((branch) => branch.apiUrl === branchAPIURL);
    return Response.json({ branch: branch });
  } catch (e) {
    console.log("---- error get current branch", e);
    return Response.error();
  }
}
