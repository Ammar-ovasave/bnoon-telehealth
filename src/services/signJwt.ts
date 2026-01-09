import * as jwt from "jsonwebtoken";
import { BnoonJWTPayload, BnoonUser } from "@/models/BnoonUser";

const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365; // 1 year
const JWT_SECRET = process.env.JWT_SECRET ?? "";

/**
 * Sign a JWT with the Bnoon user payload
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
