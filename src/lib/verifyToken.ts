import * as jwt from "jsonwebtoken";
import { BnoonJWTPayload } from "@/models/BnoonUser";
import { LegacyJWTPayload } from "@/services/signJwt";

/**
 * Legacy token payload with iat/exp
 * @deprecated Use BnoonJWTPayload instead
 */
export type LegacyTokenPayload = LegacyJWTPayload & {
  iat: number;
  exp: number;
};

/**
 * Union type for both legacy and new token payloads
 */
export type TokenPayload = BnoonJWTPayload | LegacyTokenPayload;

/**
 * Check if a token payload is the new Bnoon format
 */
export function isBnoonToken(payload: TokenPayload): payload is BnoonJWTPayload {
  return "userId" in payload && "phone" in payload;
}

/**
 * Check if a token payload is the legacy format
 */
export function isLegacyToken(
  payload: TokenPayload
): payload is LegacyTokenPayload {
  return "mrn" in payload && "branchId" in payload;
}

/**
 * Verify a JWT token and return the payload
 * Supports both legacy and new Bnoon token formats
 * @deprecated Use verifyBnoonToken for new code
 */
export function verifyToken({
  secret,
  token,
}: {
  token: string;
  secret: string;
}): LegacyTokenPayload | null {
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string") return null;
    return payload as LegacyTokenPayload;
  } catch (error) {
    console.log("verify token error", error);
    return null;
  }
}

/**
 * Verify a JWT token and return the Bnoon payload
 * Returns null if token is invalid or is legacy format
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

/**
 * Verify any JWT token and return the payload with type information
 * Handles both legacy and new Bnoon formats
 */
export function verifyAnyToken({
  secret,
  token,
}: {
  token: string;
  secret: string;
}):
  | { type: "bnoon"; payload: BnoonJWTPayload }
  | { type: "legacy"; payload: LegacyTokenPayload }
  | null {
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string") return null;

    // Check if this is a Bnoon token (new format)
    if ("userId" in payload && "phone" in payload) {
      return { type: "bnoon", payload: payload as BnoonJWTPayload };
    }

    // Check if this is a legacy token
    if ("mrn" in payload && "branchId" in payload) {
      return { type: "legacy", payload: payload as LegacyTokenPayload };
    }

    return null;
  } catch (error) {
    console.log("verify any token error", error);
    return null;
  }
}
