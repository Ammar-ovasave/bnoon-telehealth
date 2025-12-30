import { db } from "./index";
import { ClinicBranchID } from "@/models/ClinicModel";
import { Timestamp } from "firebase-admin/firestore";

const COLLECTION_NAME = "userPreferences";

export interface UserPreferences {
  mrn: string;
  defaultBranchId: ClinicBranchID | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPreferencesResponse {
  mrn: string;
  defaultBranchId: ClinicBranchID | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user preferences by MRN
 */
export async function getUserPreferences(mrn: string): Promise<UserPreferencesResponse | null> {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(mrn);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as UserPreferences;
    return {
      mrn: data.mrn,
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
  mrn: string,
  branchId: ClinicBranchID
): Promise<UserPreferencesResponse> {
  const docRef = db.collection(COLLECTION_NAME).doc(mrn);
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
      mrn,
      defaultBranchId: branchId,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(newPreferences);
  }

  return {
    mrn,
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
export async function clearDefaultBranch(mrn: string): Promise<void> {
  const docRef = db.collection(COLLECTION_NAME).doc(mrn);
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
export async function hasDefaultBranch(mrn: string): Promise<boolean> {
  const prefs = await getUserPreferences(mrn);
  return prefs?.defaultBranchId != null;
}
