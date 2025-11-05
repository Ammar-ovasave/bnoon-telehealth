import * as jwt from "jsonwebtoken";
import axios from "@/services/axios";
import { cookies } from "next/headers";
import { AUTH_TOKEN_NAME } from "@/constants";
import { getPatient } from "@/services/appointment-services";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const baseAPIURL = cookieStore.get("branchAPIURL")?.value;
    const payload: { code?: string; purpose?: string; mrn?: string } = await request.json();
    if (!payload.code || !payload.mrn || !payload.purpose) {
      console.log("--- verify otp invalid payload", payload);
      return Response.error();
    }
    const res = await verifyOTP({
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
  baseAPIURL,
}: {
  mrn: string;
  purpose: string;
  code: string;
  baseAPIURL: string | null;
}) {
  try {
    const res = await axios.post<{
      verified?: boolean;
    }>(baseAPIURL ? `${baseAPIURL}/patients/${mrn}/otps:verify` : `/patients/${mrn}/otps:verify`, { code, purpose });
    if (!res.data.verified) {
      console.log("--- verify otp error response", res.status, res.data);
      return null;
    }
    return res.data;
  } catch (error) {
    console.log("--- get patient by mrn error", error);
    return null;
  }
}

const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365;
const JWT_SECRET = process.env.JWT_SECRET ?? "";

export function signJwt(payload: object, expiresInSeconds = JWT_EXPIRES_IN_SECONDS) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}
