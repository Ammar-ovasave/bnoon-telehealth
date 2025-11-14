import { SendOTPPayload } from "@/models/SendOTPPayload";
import { getPatient } from "@/services/appointment-services";
import { add } from "date-fns";
import { cookies } from "next/headers";
import axios from "@/services/axios";

export async function POST(request: Request) {
  try {
    const cookiesStore = await cookies();
    const baseAPIURL = cookiesStore.get("branchAPIURL")?.value;
    const payload: SendOTPPayload = await request.json();
    const patient = await getPatient({ mrn: payload.mrn, baseAPIURL: baseAPIURL ?? null });
    if (!patient?.contactNumber) {
      return Response.error();
    }
    const res = await sendOTP({ ...payload, baseAPIURL: baseAPIURL, mobileNumber: patient?.contactNumber });
    console.log("--- send otp res", res);
    if (!res?.code) {
      return Response.error();
    }
    cookiesStore.set("otpCode", res?.code, { httpOnly: true, secure: true, expires: add(new Date(), { minutes: 5 }) });
    return Response.json({ length: res?.code.length });
  } catch (e) {
    console.log("--- send OTP error", e);
    return Response.error();
  }
}

async function sendOTP(params: SendOTPPayload & { baseAPIURL?: string; mobileNumber: string }) {
  try {
    const code = `${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(
      Math.random() * 9
    )}`;
    const res = await axios.get<{
      id: number;
      code: string;
      expiresAtUtc: string;
    }>(`https://sms.connectsaudi.com/sendurl.aspx`, {
      params: {
        user: "bnoontrc",
        pwd: "Nrtz605643Rr",
        senderid: "BNOON",
        CountryCode: "966",
        mobileno: params.mobileNumber.replaceAll("+966", "").replaceAll("+971", ""),
        msgtext: code,
      },
    });
    if (res.status >= 300) {
      return null;
    }
    // const res = await axios.post<{
    //   id: number;
    //   code: string;
    //   expiresAtUtc: string;
    // }>(params.baseAPIURL ? `${params.baseAPIURL}/patients/${params.mrn}/otps` : `/patients/${params.mrn}/otps`, params);
    return { id: params.mrn, code: code };
  } catch (e) {
    console.log("--- sendOTP error", e);
    return null;
  }
}
