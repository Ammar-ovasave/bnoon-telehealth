/**
 * Bnoon-owned user model stored in Firestore
 * This is the central user profile that exists independently of FertiSmart
 */

export interface BranchMapping {
  mrn: string; // FertiSmart Medical Record Number
  fertiSmartBranchId: number; // FertiSmart internal branch ID
  createdAt: string; // ISO timestamp when patient was created in FertiSmart
  lastSyncedAt: string; // ISO timestamp of last sync to FertiSmart
}

export interface BnoonUser {
  // Primary identifier - normalized phone number (e.g., "+966501234567")
  id: string;

  // Contact info
  phone: string; // Same as id, normalized with country code
  emailAddress: string;

  // Personal info
  firstName: string;
  middleName: string;
  lastName: string;
  sex?: 0 | 1; // 0 = female, 1 = male
  dob?: string; // ISO date string (YYYY-MM-DD)

  // Identity documents
  nationality?: {
    id: number;
    name: string;
  };
  identityIdType?: {
    id: number;
    name: string;
  };
  identityId?: string; // National ID, Iqama, Passport number

  // FertiSmart branch mappings
  // Key is ClinicBranchID (e.g., "riyadh-granada", "jeddah", "al-ahsa")
  branchMappings: {
    [branchId: string]: BranchMapping;
  };

  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastLoginAt: string; // ISO timestamp

  // Optional preferences
  preferredLanguage?: "ar" | "en";
}

/**
 * Payload for creating a new Bnoon user
 */
export interface CreateBnoonUserPayload {
  phone: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  emailAddress?: string;
  sex?: 0 | 1;
  dob?: string;
  nationality?: { id: number; name: string };
  identityIdType?: { id: number; name: string };
  identityId?: string;
  preferredLanguage?: "ar" | "en";
}

/**
 * Payload for updating a Bnoon user profile
 */
export interface UpdateBnoonUserPayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  emailAddress?: string;
  sex?: 0 | 1;
  dob?: string;
  nationality?: { id: number; name: string };
  identityIdType?: { id: number; name: string };
  identityId?: string;
  preferredLanguage?: "ar" | "en";
}

/**
 * JWT payload structure for authenticated users
 */
export interface BnoonJWTPayload {
  userId: string; // Normalized phone number (document ID)
  phone: string; // Same as userId
  firstName: string;
  middleName: string;
  lastName: string;
  emailAddress: string;
  sex?: 0 | 1;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * Check if a user profile is complete enough for booking
 * Requires: firstName, lastName, emailAddress, sex
 */
export function isProfileComplete(user: BnoonUser | null): boolean {
  if (!user) return false;
  return Boolean(
    user.firstName &&
      user.firstName !== "-" &&
      user.lastName &&
      user.lastName !== "-" &&
      user.emailAddress &&
      user.sex !== undefined
  );
}

/**
 * Normalize phone number to consistent format with country code
 * Removes spaces, ensures + prefix
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all whitespace
  const normalized = phone.replace(/\s/g, "");

  // Remove leading zeros after country code
  if (normalized.startsWith("+")) {
    // Already has country code
    return normalized;
  }

  // If starts with 00, replace with +
  if (normalized.startsWith("00")) {
    return "+" + normalized.slice(2);
  }

  // If starts with 0 (local format), assume Saudi Arabia
  if (normalized.startsWith("0")) {
    return "+966" + normalized.slice(1);
  }

  // If no prefix, assume it needs +
  if (!normalized.startsWith("+")) {
    return "+" + normalized;
  }

  return normalized;
}
