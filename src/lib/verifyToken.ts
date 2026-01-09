import * as jwt from "jsonwebtoken";
import { BnoonJWTPayload } from "@/models/BnoonUser";

/**
 * Token payload type (Bnoon-only)
 */
export type TokenPayload = BnoonJWTPayload;

/**
 * Check if a token payload is the Bnoon format
 */
export function isBnoonToken(payload: TokenPayload): payload is BnoonJWTPayload {
  return "userId" in payload && "phone" in payload;
}

/**
 * Verify a JWT token and return the Bnoon payload
 * Returns null if token is invalid
 */
export function verifyBnoonToken({
  secret,
  token,
}: {
  token: string;
  secret: string;
}): BnoonJWTPayload | null {
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string") return null;

    // Check if this is a Bnoon token
    if ("userId" in payload && "phone" in payload) {
      return payload as BnoonJWTPayload;
    }

    return null;
  } catch (error) {
    console.log("verify bnoon token error", error);
    return null;
  }
}
