import { BnoonUser, BranchMapping } from "@/models/BnoonUser";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";
import { FertiSmartPatientModel } from "@/models/FertiSmartPatientModel";
import { addBranchMapping, updateBranchSyncTime } from "@/firestore/users";
import axios from "@/services/axios";

interface SyncResult {
  branchId: string;
  success: boolean;
  error?: string;
}

interface BranchMrnResult {
  mrn: string;
  isNew: boolean;
  fertiSmartBranchId: number;
}

/**
 * Get clinic API URL by branch ID
 */
export function getClinicApiUrl(branchId: string): string | null {
  const clinic = clinicLocations.find((c) => c.id === branchId);
  return clinic?.apiUrl ?? null;
}

/**
 * Get FertiSmart branches for a clinic
 */
export async function getFertiSmartBranches(
  apiUrl: string
): Promise<{ id: number; name: string }[]> {
  try {
    const res = await axios.get<{ id: number; name: string; mrnPrefix: string }[]>(
      `${apiUrl}/branches`
    );
    return res.data;
  } catch (error) {
    console.error("--- getFertiSmartBranches error", error);
    return [];
  }
}

/**
 * Create a patient in FertiSmart
 */
async function createFertiSmartPatient(
  apiUrl: string,
  user: BnoonUser,
  fertiSmartBranchId: number
): Promise<FertiSmartPatientModel | null> {
  try {
    const payload = {
      patient: {
        firstName: user.firstName || "-",
        lastName: user.lastName || "-",
        middleName: user.middleName || "-",
        contactNumber: user.phone,
        sex: user.sex,
        dob: user.dob,
      },
      branchId: fertiSmartBranchId,
    };

    console.log("--- Creating FertiSmart patient", { apiUrl, payload });
    const res = await axios.post<FertiSmartPatientModel>(
      `${apiUrl}/patients`,
      payload
    );
    console.log("--- Created FertiSmart patient", res.data);
    return res.data;
  } catch (error) {
    console.error("--- createFertiSmartPatient error", error);
    return null;
  }
}

/**
 * Update a patient in FertiSmart
 */
async function updateFertiSmartPatient(
  apiUrl: string,
  mrn: string,
  user: BnoonUser
): Promise<boolean> {
  try {
    const payload = {
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      contactNumber: user.phone,
      dob: user.dob,
      nationalityId: user.nationality?.id,
      identityIdTypeId: user.identityIdType?.id,
      identityId: user.identityId,
    };

    console.log("--- Updating FertiSmart patient", { apiUrl, mrn, payload });
    await axios.patch(`${apiUrl}/patients/${mrn}`, payload);

    // Also update sex if present
    if (user.sex !== undefined) {
      try {
        await axios.patch(`${apiUrl}/patients/${mrn}/sex`, { sex: user.sex });
      } catch (sexError) {
        // Sex update might fail for couple files, ignore
        console.warn("--- updateFertiSmartPatient sex update failed (might be couple file)", sexError);
      }
    }

    return true;
  } catch (error) {
    console.error("--- updateFertiSmartPatient error", error);
    return false;
  }
}

/**
 * Find existing patient in FertiSmart by phone number
 */
async function findFertiSmartPatientByPhone(
  apiUrl: string,
  phone: string
): Promise<FertiSmartPatientModel | null> {
  try {
    const res = await axios.get<FertiSmartPatientModel[]>(
      `${apiUrl}/patients`,
      { params: { contactNumber: phone } }
    );

    // Filter out patients with empty MRN
    const validPatients = res.data.filter((p) => p.mrn && p.mrn.trim() !== "");
    return validPatients.length > 0 ? validPatients[0] : null;
  } catch (error) {
    console.error("--- findFertiSmartPatientByPhone error", error);
    return null;
  }
}

/**
 * Get or create FertiSmart patient for a specific branch
 * This is the lazy creation logic
 */
export async function getOrCreateBranchMrn(
  user: BnoonUser,
  branchId: ClinicBranchID
): Promise<BranchMrnResult | null> {
  // Check if user already has MRN for this branch
  const existingMapping = user.branchMappings?.[branchId];
  if (existingMapping?.mrn) {
    return {
      mrn: existingMapping.mrn,
      isNew: false,
      fertiSmartBranchId: existingMapping.fertiSmartBranchId,
    };
  }

  // Get the clinic API URL
  const apiUrl = getClinicApiUrl(branchId);
  if (!apiUrl) {
    console.error("--- getOrCreateBranchMrn: No API URL for branch", branchId);
    return null;
  }

  // First, check if patient already exists in FertiSmart by phone
  const existingPatient = await findFertiSmartPatientByPhone(apiUrl, user.phone);
  if (existingPatient?.mrn) {
    // Patient exists, get the FertiSmart branch ID
    const fertiSmartBranchId = existingPatient.branch?.id ?? 0;

    // Save mapping to Firestore
    await addBranchMapping(
      user.phone,
      branchId,
      existingPatient.mrn,
      fertiSmartBranchId
    );

    return {
      mrn: existingPatient.mrn,
      isNew: false,
      fertiSmartBranchId,
    };
  }

  // Get FertiSmart branches to find the branch ID
  const fertiSmartBranches = await getFertiSmartBranches(apiUrl);
  if (fertiSmartBranches.length === 0) {
    console.error("--- getOrCreateBranchMrn: No FertiSmart branches found");
    return null;
  }

  // Use the first branch ID (clinics typically have one branch per API)
  const fertiSmartBranchId = fertiSmartBranches[0].id;

  // Create new patient in FertiSmart
  const newPatient = await createFertiSmartPatient(
    apiUrl,
    user,
    fertiSmartBranchId
  );

  if (!newPatient?.mrn) {
    console.error("--- getOrCreateBranchMrn: Failed to create patient");
    return null;
  }

  // Save mapping to Firestore
  await addBranchMapping(
    user.phone,
    branchId,
    newPatient.mrn,
    fertiSmartBranchId
  );

  return {
    mrn: newPatient.mrn,
    isNew: true,
    fertiSmartBranchId,
  };
}

/**
 * Sync user profile to a specific FertiSmart branch
 */
export async function syncUserToBranch(
  user: BnoonUser,
  branchId: string
): Promise<SyncResult> {
  const mapping = user.branchMappings?.[branchId];
  if (!mapping?.mrn) {
    return {
      branchId,
      success: false,
      error: "No MRN mapping for this branch",
    };
  }

  const apiUrl = getClinicApiUrl(branchId);
  if (!apiUrl) {
    return {
      branchId,
      success: false,
      error: "No API URL for this branch",
    };
  }

  const success = await updateFertiSmartPatient(apiUrl, mapping.mrn, user);

  if (success) {
    // Update sync timestamp in Firestore
    await updateBranchSyncTime(user.phone, branchId);
  }

  return {
    branchId,
    success,
    error: success ? undefined : "Failed to update FertiSmart patient",
  };
}

/**
 * Sync user profile to all FertiSmart branches where user has records
 */
export async function syncUserToAllBranches(
  user: BnoonUser
): Promise<SyncResult[]> {
  const branchIds = Object.keys(user.branchMappings || {});

  if (branchIds.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    branchIds.map((branchId) => syncUserToBranch(user, branchId))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      branchId: branchIds[index],
      success: false,
      error: result.reason?.message || "Unknown error",
    };
  });
}

/**
 * Check if user has any branch mappings
 */
export function hasBranchMappings(user: BnoonUser): boolean {
  return Object.keys(user.branchMappings || {}).length > 0;
}

/**
 * Get all branches where user has MRNs
 */
export function getUserBranches(user: BnoonUser): {
  branchId: string;
  mapping: BranchMapping;
}[] {
  return Object.entries(user.branchMappings || {}).map(([branchId, mapping]) => ({
    branchId,
    mapping,
  }));
}
