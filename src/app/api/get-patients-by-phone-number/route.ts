import { getPatientsByPhoneNumber } from "@/services/appointment-services";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const phoneNumber = url.searchParams.get("phoneNumber");
    const patients = await getPatientsByPhoneNumber({ baseAPIURL: baseAPIURL ?? null, phoneNumber: phoneNumber ?? "" });
    return Response.json(
      patients?.map((p) => {
        return { mrn: p.mrn };
      })
    );
  } catch (error) {
    console.log("---- error getting patient appointments", error);
    return Response.error();
  }
}
