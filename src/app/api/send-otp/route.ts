import { SendOTPPayload } from "@/models/SendOTPPayload";
import { getPatient, sendSMS } from "@/services/appointment-services";
import { add } from "date-fns";
import { cookies } from "next/headers";

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
    const res = await sendSMS({ mobileNumber: params.mobileNumber, message: `Your Bnoon OTP: ${code}` });
    if (!res) {
      return null;
    }
    return { id: params.mrn, code: code };
  } catch (e) {
    console.log("--- sendOTP error", e);
    return null;
  }
}
