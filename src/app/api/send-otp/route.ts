import { SendOTPPayload } from "@/models/SendOTPPayload";
import axios from "@/services/axios";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const payload: SendOTPPayload = await request.json();
    const res = await sendOTP({ ...payload, baseAPIURL: baseAPIURL });
    console.log("send otp res", res);
    return Response.json({ length: res?.code.length });
  } catch (e) {
    console.log("--- send OTP error", e);
    return Response.error();
  }
}

async function sendOTP(params: SendOTPPayload & { baseAPIURL?: string }) {
  try {
    const res = await axios.post<{
      id: number;
      code: string;
      expiresAtUtc: string;
    }>(params.baseAPIURL ? `${params.baseAPIURL}/patients/${params.mrn}/otps` : `/patients/${params.mrn}/otps`, params);
    return res.data;
  } catch (e) {
    console.log("--- sendOTP error", e);
    return null;
  }
}
