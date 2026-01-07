import * as jwt from "jsonwebtoken";
import { BnoonJWTPayload, BnoonUser } from "@/models/BnoonUser";

const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365; // 1 year
const JWT_SECRET = process.env.JWT_SECRET ?? "";

/**
 * Legacy JWT payload structure (FertiSmart-dependent)
 * @deprecated Use signBnoonJwt instead
 */
export interface LegacyJWTPayload {
  mrn: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  branchId: number;
}

/**
 * Sign a JWT with the legacy FertiSmart-dependent payload
 * @deprecated Use signBnoonJwt instead
 */
export function signJwt(
  payload: LegacyJWTPayload,
  expiresInSeconds = JWT_EXPIRES_IN_SECONDS
) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}

/**
 * Sign a JWT with the new Bnoon-owned user payload
 * This is the preferred method for new authentication flows
 */
export function signBnoonJwt(
  user: BnoonUser,
  expiresInSeconds = JWT_EXPIRES_IN_SECONDS
): string {
  const payload: Omit<BnoonJWTPayload, "iat" | "exp"> = {
    userId: user.id,
    phone: user.phone,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    sex: user.sex,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}

/**
 * Create a Bnoon JWT payload from a BnoonUser
 * Useful for refreshing tokens with updated user data
 */
export function createBnoonJwtPayload(
  user: BnoonUser
): Omit<BnoonJWTPayload, "iat" | "exp"> {
  return {
    userId: user.id,
    phone: user.phone,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    sex: user.sex,
  };
}
