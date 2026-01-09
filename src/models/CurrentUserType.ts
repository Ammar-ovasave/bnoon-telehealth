import { BnoonJWTPayload } from "./BnoonUser";

/**
 * Current user type from JWT token
 * Uses Bnoon-only auth (no legacy FertiSmart support)
 */
export type CurrentUserType = BnoonJWTPayload;
