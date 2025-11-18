import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { cookies } from "next/headers";
import axios from "@/services/axios";

export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const payload: {
      patient: { firstName: string; lastName: string; sex?: 0 | 1; contactNumber: string; middleName?: string; dob?: string };
      branchId: number;
    } = await request.json();
    const res = await axios.post<FertiSmartPatientModel>(baseAPIURL ? `${baseAPIURL}/patients` : `/patients`, payload);
    return Response.json({ mrn: res.data.mrn });
  } catch (error) {
    console.log("--- create patient error ", error);
    return Response.error();
  }
}
