import { db } from "./index";
import {
  BnoonUser,
  CreateBnoonUserPayload,
  UpdateBnoonUserPayload,
  BranchMapping,
  normalizePhoneNumber,
} from "@/models/BnoonUser";

const USERS_COLLECTION = "users";

/**
 * Get a user by their phone number
 * @param phone - Phone number (will be normalized)
 * @returns User document or null if not found
 */
export async function getUserByPhone(
  phone: string
): Promise<BnoonUser | null> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as BnoonUser;
}

/**
 * Create a new Bnoon user
 * @param data - User creation payload
 * @returns Created user
 */
export async function createUser(
  data: CreateBnoonUserPayload
): Promise<BnoonUser> {
  const normalizedPhone = normalizePhoneNumber(data.phone);
  const now = new Date().toISOString();

  const user: BnoonUser = {
    id: normalizedPhone,
    phone: normalizedPhone,
    firstName: data.firstName || "",
    middleName: data.middleName || "",
    lastName: data.lastName || "",
    emailAddress: data.emailAddress || "",
    sex: data.sex ?? null,
    dob: data.dob ?? null,
    nationality: data.nationality ?? null,
    identityIdType: data.identityIdType ?? null,
    identityId: data.identityId ?? null,
    preferredLanguage: data.preferredLanguage ?? null,
    branchMappings: {},
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);
  await docRef.set(user);

  return user;
}

/**
 * Update an existing Bnoon user
 * @param phone - Phone number (will be normalized)
 * @param data - Fields to update
 * @returns Updated user
 */
export async function updateUser(
  phone: string,
  data: UpdateBnoonUserPayload
): Promise<BnoonUser> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);

  const updateData: Partial<BnoonUser> & { updatedAt: string } = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await docRef.update(updateData);

  const updatedDoc = await docRef.get();
  return updatedDoc.data() as BnoonUser;
}

/**
 * Update user's last login timestamp
 * @param phone - Phone number (will be normalized)
 */
export async function updateLastLogin(phone: string): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);

  await docRef.update({
    lastLoginAt: new Date().toISOString(),
  });
}

/**
 * Add or update a branch mapping for a user
 * Called when user books at a branch for the first time
 * @param phone - Phone number (will be normalized)
 * @param branchId - Clinic branch ID (e.g., "riyadh-granada")
 * @param mrn - FertiSmart MRN for this branch
 * @param fertiSmartBranchId - FertiSmart internal branch ID
 */
export async function addBranchMapping(
  phone: string,
  branchId: string,
  mrn: string,
  fertiSmartBranchId: number
): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);
  const now = new Date().toISOString();

  const mapping: BranchMapping = {
    mrn,
    fertiSmartBranchId,
    createdAt: now,
    lastSyncedAt: now,
  };

  await docRef.update({
    [`branchMappings.${branchId}`]: mapping,
    updatedAt: now,
  });
}

/**
 * Update the lastSyncedAt timestamp for a branch mapping
 * Called after syncing user profile to FertiSmart
 * @param phone - Phone number (will be normalized)
 * @param branchId - Clinic branch ID
 */
export async function updateBranchSyncTime(
  phone: string,
  branchId: string
): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);
  const now = new Date().toISOString();

  await docRef.update({
    [`branchMappings.${branchId}.lastSyncedAt`]: now,
    updatedAt: now,
  });
}

/**
 * Get a user's MRN for a specific branch
 * @param phone - Phone number (will be normalized)
 * @param branchId - Clinic branch ID
 * @returns MRN if exists, null otherwise
 */
export async function getBranchMrn(
  phone: string,
  branchId: string
): Promise<string | null> {
  const user = await getUserByPhone(phone);
  if (!user) return null;

  const mapping = user.branchMappings[branchId];
  return mapping?.mrn || null;
}

/**
 * Check if a user exists by phone number
 * @param phone - Phone number (will be normalized)
 * @returns true if user exists
 */
export async function userExists(phone: string): Promise<boolean> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);
  const doc = await docRef.get();
  return doc.exists;
}

/**
 * Get or create a user by phone number
 * Used during OTP verification
 * @param phone - Phone number
 * @param preferredLanguage - User's preferred language from the UI locale
 * @returns User and whether it was newly created
 */
export async function getOrCreateUser(
  phone: string,
  preferredLanguage?: "ar" | "en"
): Promise<{ user: BnoonUser; isNew: boolean }> {
  const existingUser = await getUserByPhone(phone);

  if (existingUser) {
    await updateLastLogin(phone);
    return { user: existingUser, isNew: false };
  }

  const newUser = await createUser({ phone, preferredLanguage });
  return { user: newUser, isNew: true };
}

/**
 * Delete a user (for testing purposes only)
 * @param phone - Phone number (will be normalized)
 */
export async function deleteUser(phone: string): Promise<void> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection(USERS_COLLECTION).doc(normalizedPhone);
  await docRef.delete();
}
