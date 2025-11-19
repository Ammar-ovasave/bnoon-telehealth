import * as jwt from "jsonwebtoken";

const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365;
const JWT_SECRET = process.env.JWT_SECRET ?? "";

export function signJwt(
  payload: {
    mrn: string;
    firstName: string;
    middleName: string;
    lastName: string;
    contactNumber: string;
    emailAddress: string;
    branchId: number;
  },
  expiresInSeconds = JWT_EXPIRES_IN_SECONDS
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}
