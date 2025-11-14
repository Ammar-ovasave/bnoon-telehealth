import { cookies } from "next/headers";
import { AUTH_TOKEN_NAME } from "@/constants";
import { getPatient } from "@/services/appointment-services";
import { signJwt } from "@/services/signJwt";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const baseAPIURL = cookieStore.get("branchAPIURL")?.value;
    const otpCode = cookieStore.get("otpCode")?.value;
    if (!otpCode) {
      return Response.error();
    }
    const payload: { code?: string; purpose?: string; mrn?: string } = await request.json();
    if (!payload.code || !payload.mrn || !payload.purpose) {
      console.log("--- verify otp invalid payload", payload);
      return Response.error();
    }
    const res = await verifyOTP({
      otpCode: otpCode,
      code: payload.code,
      mrn: payload.mrn,
      purpose: payload.purpose,
      baseAPIURL: baseAPIURL ?? null,
    });
    if (!res?.verified) {
      console.log("--- verify otp error response", res);
      return Response.error();
    }
    const patient = await getPatient({ mrn: payload.mrn, baseAPIURL: baseAPIURL ?? null });
    if (!patient?.mrn) {
      console.log("--- verify otp error get patient error", patient);
      return Response.error();
    }
    const authToken = signJwt({
      mrn: patient.mrn,
      firstName: patient.firstName,
      lastName: patient.lastName,
      contactNumber: patient.contactNumber,
      emailAddress: patient.emailAddress,
      branchId: patient.branch?.id,
    });
    cookieStore.set({ name: AUTH_TOKEN_NAME, value: authToken, httpOnly: true, secure: true });
    return Response.json(res);
  } catch (e) {
    console.log("--- verify otp error", e);
    return Response.error();
  }
}

async function verifyOTP({
  mrn,
  code,
  purpose,
  otpCode,
  baseAPIURL,
}: {
  otpCode: string;
  mrn: string;
  purpose: string;
  code: string;
  baseAPIURL: string | null;
}) {
  try {
    if (code === otpCode) {
      return { verified: true };
    }
    return { verified: false };
    // const res = await axios.post<{
    //   verified?: boolean;
    // }>(baseAPIURL ? `${baseAPIURL}/patients/${mrn}/otps:verify` : `/patients/${mrn}/otps:verify`, { code, purpose });
    // if (!res.data.verified) {
    //   console.log("--- verify otp error response", res.status, res.data);
    //   return null;
    // }
    // return res.data;
  } catch (error) {
    console.log("--- verifyOTP error", { mrn, code, purpose, baseAPIURL }, error);
    return null;
  }
}
