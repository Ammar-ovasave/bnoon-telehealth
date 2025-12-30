import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../current-user/_services";
import {
  getUserPreferences,
  setDefaultBranch,
  clearDefaultBranch,
} from "@/firestore/userPreferences";
import { ClinicBranchID, clinicLocations } from "@/models/ClinicModel";

/**
 * GET /api/user-preferences
 * Fetch the current user's preferences (including default branch)
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.mrn) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const preferences = await getUserPreferences(currentUser.mrn);

    if (!preferences) {
      // Return empty preferences if none exist
      return NextResponse.json({
        mrn: currentUser.mrn,
        defaultBranchId: null,
        createdAt: null,
        updatedAt: null,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user-preferences
 * Update user preferences (set/clear default branch)
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.mrn) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { defaultBranchId } = body as { defaultBranchId: ClinicBranchID | null };

    // Validate branch ID if provided
    if (defaultBranchId !== null) {
      const validBranch = clinicLocations.find((c) => c.id === defaultBranchId);
      if (!validBranch) {
        return NextResponse.json(
          { error: "Invalid branch ID" },
          { status: 400 }
        );
      }
    }

    // Update or clear the default branch
    if (defaultBranchId === null) {
      await clearDefaultBranch(currentUser.mrn);
      return NextResponse.json({
        mrn: currentUser.mrn,
        defaultBranchId: null,
        message: "Default branch cleared",
      });
    }

    const updatedPreferences = await setDefaultBranch(
      currentUser.mrn,
      defaultBranchId
    );

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
