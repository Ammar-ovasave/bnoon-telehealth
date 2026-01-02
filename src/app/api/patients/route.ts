import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { cookies } from "next/headers";
import axios from "@/services/axios";

export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    console.log("\n📍 CREATE PATIENT - baseAPIURL:", baseAPIURL);
    const payload: {
      patient: { firstName: string; lastName: string; sex?: 0 | 1; contactNumber: string; middleName?: string; dob?: string };
      branchId: number;
    } = await request.json();
    console.log("📍 CREATE PATIENT - payload:", JSON.stringify(payload));
    const url = baseAPIURL ? `${baseAPIURL}/patients` : `/patients`;
    console.log("📍 CREATE PATIENT - calling:", url);
    const res = await axios.post<FertiSmartPatientModel>(url, payload);
    console.log("📍 CREATE PATIENT - success, mrn:", res.data.mrn);
    return Response.json({ mrn: res.data.mrn });
  } catch (error) {
    console.log("\n❌ CREATE PATIENT ERROR:", error);
    return Response.error();
  }
}
