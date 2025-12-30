import { db } from "./index";
import { ClinicBranchID } from "@/models/ClinicModel";
import { Timestamp } from "firebase-admin/firestore";

const COLLECTION_NAME = "userPreferences";

export interface UserPreferences {
  phoneNumber: string;
  defaultBranchId: ClinicBranchID | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPreferencesResponse {
  phoneNumber: string;
  defaultBranchId: ClinicBranchID | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalize phone number for consistent storage
 * Removes spaces, dashes, and ensures consistent format
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

/**
 * Get user preferences by phone number
 */
export async function getUserPreferences(phoneNumber: string): Promise<UserPreferencesResponse | null> {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const docRef = db.collection(COLLECTION_NAME).doc(normalizedPhone);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as UserPreferences;
    return {
      phoneNumber: data.phoneNumber,
      defaultBranchId: data.defaultBranchId,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

/**
 * Set or update the user's default branch
 */
export async function setDefaultBranch(
  phoneNumber: string,
  branchId: ClinicBranchID
): Promise<UserPreferencesResponse> {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const docRef = db.collection(COLLECTION_NAME).doc(normalizedPhone);
  const now = Timestamp.now();

  const existingDoc = await docRef.get();

  if (existingDoc.exists) {
    // Update existing preferences
    await docRef.update({
      defaultBranchId: branchId,
      updatedAt: now,
    });
  } else {
    // Create new preferences document
    const newPreferences: UserPreferences = {
      phoneNumber: normalizedPhone,
      defaultBranchId: branchId,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(newPreferences);
  }

  return {
    phoneNumber: normalizedPhone,
    defaultBranchId: branchId,
    createdAt: existingDoc.exists
      ? (existingDoc.data() as UserPreferences).createdAt?.toDate().toISOString()
      : now.toDate().toISOString(),
    updatedAt: now.toDate().toISOString(),
  };
}

/**
 * Clear the user's default branch
 */
export async function clearDefaultBranch(phoneNumber: string): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const docRef = db.collection(COLLECTION_NAME).doc(normalizedPhone);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({
      defaultBranchId: null,
      updatedAt: Timestamp.now(),
    });
  }
}

/**
 * Check if user has a default branch set
 */
export async function hasDefaultBranch(phoneNumber: string): Promise<boolean> {
  const prefs = await getUserPreferences(phoneNumber);
  return prefs?.defaultBranchId != null;
}
