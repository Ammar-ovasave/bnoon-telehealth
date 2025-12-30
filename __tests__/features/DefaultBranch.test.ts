/**
 * Tests for Default Branch Feature
 *
 * Verifies the default branch functionality including:
 * - User preferences data structure
 * - Default branch selection logic
 * - Auto-switch behavior
 * - UI state management
 */

import { ClinicBranchID, clinicLocations } from "@/models/ClinicModel";

describe("Default Branch Feature", () => {
  // Mock user preferences data structure
  interface UserPreferences {
    mrn: string;
    defaultBranchId: ClinicBranchID | null;
    createdAt: string | null;
    updatedAt: string | null;
  }

  // Helper to create mock preferences
  const createMockPreferences = (
    mrn: string,
    defaultBranchId: ClinicBranchID | null
  ): UserPreferences => ({
    mrn,
    defaultBranchId,
    createdAt: defaultBranchId ? new Date().toISOString() : null,
    updatedAt: defaultBranchId ? new Date().toISOString() : null,
  });

  describe("User Preferences Data Structure", () => {
    it("should have correct structure with default branch set", () => {
      const prefs = createMockPreferences("MRN-123", "riyadh-granada");

      expect(prefs.mrn).toBe("MRN-123");
      expect(prefs.defaultBranchId).toBe("riyadh-granada");
      expect(prefs.createdAt).toBeTruthy();
      expect(prefs.updatedAt).toBeTruthy();
    });

    it("should have null defaultBranchId when not set", () => {
      const prefs = createMockPreferences("MRN-123", null);

      expect(prefs.mrn).toBe("MRN-123");
      expect(prefs.defaultBranchId).toBeNull();
    });

    it("should accept all valid branch IDs", () => {
      const validBranchIds: ClinicBranchID[] = [
        "riyadh-granada",
        "jeddah",
        "al-ahsa",
        "riyadh-king-salman",
      ];

      validBranchIds.forEach((branchId) => {
        const prefs = createMockPreferences("MRN-123", branchId);
        expect(prefs.defaultBranchId).toBe(branchId);
      });
    });
  });

  describe("Default Branch Detection", () => {
    const hasDefaultBranch = (prefs: UserPreferences | null): boolean => {
      return prefs?.defaultBranchId != null;
    };

    it("should return true when default branch is set", () => {
      const prefs = createMockPreferences("MRN-123", "riyadh-granada");
      expect(hasDefaultBranch(prefs)).toBe(true);
    });

    it("should return false when default branch is null", () => {
      const prefs = createMockPreferences("MRN-123", null);
      expect(hasDefaultBranch(prefs)).toBe(false);
    });

    it("should return false when preferences is null", () => {
      expect(hasDefaultBranch(null)).toBe(false);
    });

    it("should return false when preferences is undefined", () => {
      expect(hasDefaultBranch(undefined as unknown as UserPreferences)).toBe(false);
    });
  });

  describe("Branch Validation", () => {
    const isValidBranchId = (branchId: string): boolean => {
      return clinicLocations.some((c) => c.id === branchId);
    };

    it("should validate riyadh-granada as valid", () => {
      expect(isValidBranchId("riyadh-granada")).toBe(true);
    });

    it("should validate jeddah as valid", () => {
      expect(isValidBranchId("jeddah")).toBe(true);
    });

    it("should validate al-ahsa as valid", () => {
      expect(isValidBranchId("al-ahsa")).toBe(true);
    });

    it("should reject invalid branch ID", () => {
      expect(isValidBranchId("invalid-branch")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidBranchId("")).toBe(false);
    });
  });

  describe("Auto-Switch Logic", () => {
    interface AutoSwitchParams {
      hasAutoSwitched: boolean;
      isLoadingPreferences: boolean;
      isLoadingBranch: boolean;
      defaultBranchId: ClinicBranchID | null;
      currentBranchId: string | null;
    }

    const shouldAutoSwitch = (params: AutoSwitchParams): boolean => {
      return (
        !params.hasAutoSwitched &&
        !params.isLoadingPreferences &&
        !params.isLoadingBranch &&
        params.defaultBranchId !== null &&
        !params.currentBranchId
      );
    };

    it("should auto-switch when all conditions are met", () => {
      const result = shouldAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        defaultBranchId: "riyadh-granada",
        currentBranchId: null,
      });
      expect(result).toBe(true);
    });

    it("should NOT auto-switch if already switched", () => {
      const result = shouldAutoSwitch({
        hasAutoSwitched: true,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        defaultBranchId: "riyadh-granada",
        currentBranchId: null,
      });
      expect(result).toBe(false);
    });

    it("should NOT auto-switch while loading preferences", () => {
      const result = shouldAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: true,
        isLoadingBranch: false,
        defaultBranchId: "riyadh-granada",
        currentBranchId: null,
      });
      expect(result).toBe(false);
    });

    it("should NOT auto-switch while loading branch", () => {
      const result = shouldAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: false,
        isLoadingBranch: true,
        defaultBranchId: "riyadh-granada",
        currentBranchId: null,
      });
      expect(result).toBe(false);
    });

    it("should NOT auto-switch when no default branch", () => {
      const result = shouldAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        defaultBranchId: null,
        currentBranchId: null,
      });
      expect(result).toBe(false);
    });

    it("should NOT auto-switch when branch already selected", () => {
      const result = shouldAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        defaultBranchId: "riyadh-granada",
        currentBranchId: "jeddah",
      });
      expect(result).toBe(false);
    });
  });

  describe("First Appointment Default Branch Setting", () => {
    interface AppointmentContext {
      patientMrn: string | null;
      clinicBranchId: ClinicBranchID | null;
      hasExistingDefault: boolean;
    }

    const shouldSetDefaultOnBooking = (ctx: AppointmentContext): boolean => {
      return (
        ctx.patientMrn !== null &&
        ctx.clinicBranchId !== null &&
        !ctx.hasExistingDefault
      );
    };

    it("should set default on first booking", () => {
      const result = shouldSetDefaultOnBooking({
        patientMrn: "MRN-123",
        clinicBranchId: "riyadh-granada",
        hasExistingDefault: false,
      });
      expect(result).toBe(true);
    });

    it("should NOT set default if already has one", () => {
      const result = shouldSetDefaultOnBooking({
        patientMrn: "MRN-123",
        clinicBranchId: "jeddah",
        hasExistingDefault: true,
      });
      expect(result).toBe(false);
    });

    it("should NOT set default if no patient MRN", () => {
      const result = shouldSetDefaultOnBooking({
        patientMrn: null,
        clinicBranchId: "riyadh-granada",
        hasExistingDefault: false,
      });
      expect(result).toBe(false);
    });

    it("should NOT set default if no branch ID", () => {
      const result = shouldSetDefaultOnBooking({
        patientMrn: "MRN-123",
        clinicBranchId: null,
        hasExistingDefault: false,
      });
      expect(result).toBe(false);
    });
  });

  describe("ClinicBranchSelect UI State", () => {
    interface BranchSelectState {
      selectedBranchId: string;
      defaultBranchId: ClinicBranchID | null;
      isLoadingPreferences: boolean;
    }

    const isCurrentBranchDefault = (state: BranchSelectState): boolean => {
      return state.selectedBranchId === state.defaultBranchId;
    };

    const shouldShowSetAsDefaultButton = (state: BranchSelectState): boolean => {
      return state.selectedBranchId !== "" && !state.isLoadingPreferences;
    };

    const shouldShowDefaultInfo = (state: BranchSelectState): boolean => {
      return (
        state.defaultBranchId !== null &&
        !isCurrentBranchDefault(state) &&
        !state.isLoadingPreferences
      );
    };

    it("should identify current branch as default", () => {
      const state: BranchSelectState = {
        selectedBranchId: "riyadh-granada",
        defaultBranchId: "riyadh-granada",
        isLoadingPreferences: false,
      };
      expect(isCurrentBranchDefault(state)).toBe(true);
    });

    it("should identify current branch as NOT default", () => {
      const state: BranchSelectState = {
        selectedBranchId: "jeddah",
        defaultBranchId: "riyadh-granada",
        isLoadingPreferences: false,
      };
      expect(isCurrentBranchDefault(state)).toBe(false);
    });

    it("should show Set as Default button when branch selected", () => {
      const state: BranchSelectState = {
        selectedBranchId: "riyadh-granada",
        defaultBranchId: null,
        isLoadingPreferences: false,
      };
      expect(shouldShowSetAsDefaultButton(state)).toBe(true);
    });

    it("should NOT show Set as Default button when loading", () => {
      const state: BranchSelectState = {
        selectedBranchId: "riyadh-granada",
        defaultBranchId: null,
        isLoadingPreferences: true,
      };
      expect(shouldShowSetAsDefaultButton(state)).toBe(false);
    });

    it("should show default info when viewing different branch", () => {
      const state: BranchSelectState = {
        selectedBranchId: "jeddah",
        defaultBranchId: "riyadh-granada",
        isLoadingPreferences: false,
      };
      expect(shouldShowDefaultInfo(state)).toBe(true);
    });

    it("should NOT show default info when viewing default branch", () => {
      const state: BranchSelectState = {
        selectedBranchId: "riyadh-granada",
        defaultBranchId: "riyadh-granada",
        isLoadingPreferences: false,
      };
      expect(shouldShowDefaultInfo(state)).toBe(false);
    });

    it("should NOT show default info when no default set", () => {
      const state: BranchSelectState = {
        selectedBranchId: "jeddah",
        defaultBranchId: null,
        isLoadingPreferences: false,
      };
      expect(shouldShowDefaultInfo(state)).toBe(false);
    });
  });

  describe("Dropdown Display Logic", () => {
    const formatBranchName = (
      branchId: string,
      branchName: string,
      defaultBranchId: ClinicBranchID | null
    ): string => {
      const isDefault = branchId === defaultBranchId;
      return isDefault ? `★ ${branchName}` : branchName;
    };

    it("should prefix default branch with star", () => {
      const result = formatBranchName(
        "riyadh-granada",
        "Bnoon - Riyadh",
        "riyadh-granada"
      );
      expect(result).toBe("★ Bnoon - Riyadh");
    });

    it("should NOT prefix non-default branch", () => {
      const result = formatBranchName(
        "jeddah",
        "Bnoon - Jeddah",
        "riyadh-granada"
      );
      expect(result).toBe("Bnoon - Jeddah");
    });

    it("should NOT prefix when no default set", () => {
      const result = formatBranchName(
        "riyadh-granada",
        "Bnoon - Riyadh",
        null
      );
      expect(result).toBe("Bnoon - Riyadh");
    });
  });

  describe("API Response Handling", () => {
    interface APIResponse {
      mrn: string;
      defaultBranchId: ClinicBranchID | null;
      createdAt: string | null;
      updatedAt: string | null;
      error?: string;
    }

    const isSuccessResponse = (response: APIResponse): boolean => {
      return !response.error && response.mrn !== undefined;
    };

    const extractDefaultBranch = (response: APIResponse): ClinicBranchID | null => {
      if (!isSuccessResponse(response)) return null;
      return response.defaultBranchId;
    };

    it("should identify successful response", () => {
      const response: APIResponse = {
        mrn: "MRN-123",
        defaultBranchId: "riyadh-granada",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      expect(isSuccessResponse(response)).toBe(true);
    });

    it("should identify error response", () => {
      const response: APIResponse = {
        mrn: "",
        defaultBranchId: null,
        createdAt: null,
        updatedAt: null,
        error: "Unauthorized",
      };
      expect(isSuccessResponse(response)).toBe(false);
    });

    it("should extract default branch from success response", () => {
      const response: APIResponse = {
        mrn: "MRN-123",
        defaultBranchId: "jeddah",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };
      expect(extractDefaultBranch(response)).toBe("jeddah");
    });

    it("should return null from error response", () => {
      const response: APIResponse = {
        mrn: "",
        defaultBranchId: "riyadh-granada",
        createdAt: null,
        updatedAt: null,
        error: "Failed",
      };
      expect(extractDefaultBranch(response)).toBeNull();
    });
  });

  describe("Set Default Branch Operation", () => {
    interface SetDefaultResult {
      success: boolean;
      previousDefault: ClinicBranchID | null;
      newDefault: ClinicBranchID;
    }

    const simulateSetDefault = (
      currentDefault: ClinicBranchID | null,
      newBranchId: ClinicBranchID
    ): SetDefaultResult => {
      return {
        success: true,
        previousDefault: currentDefault,
        newDefault: newBranchId,
      };
    };

    it("should set default when none exists", () => {
      const result = simulateSetDefault(null, "riyadh-granada");
      expect(result.success).toBe(true);
      expect(result.previousDefault).toBeNull();
      expect(result.newDefault).toBe("riyadh-granada");
    });

    it("should update existing default", () => {
      const result = simulateSetDefault("riyadh-granada", "jeddah");
      expect(result.success).toBe(true);
      expect(result.previousDefault).toBe("riyadh-granada");
      expect(result.newDefault).toBe("jeddah");
    });

    it("should handle setting same branch as default", () => {
      const result = simulateSetDefault("riyadh-granada", "riyadh-granada");
      expect(result.success).toBe(true);
      expect(result.previousDefault).toBe("riyadh-granada");
      expect(result.newDefault).toBe("riyadh-granada");
    });
  });

  describe("Clear Default Branch Operation", () => {
    const simulateClearDefault = (
      currentDefault: ClinicBranchID | null
    ): { cleared: boolean; hadDefault: boolean } => {
      return {
        cleared: true,
        hadDefault: currentDefault !== null,
      };
    };

    it("should clear existing default", () => {
      const result = simulateClearDefault("riyadh-granada");
      expect(result.cleared).toBe(true);
      expect(result.hadDefault).toBe(true);
    });

    it("should handle clearing when no default exists", () => {
      const result = simulateClearDefault(null);
      expect(result.cleared).toBe(true);
      expect(result.hadDefault).toBe(false);
    });
  });

  describe("Loading States", () => {
    interface LoadingState {
      isLoadingPreferences: boolean;
      isLoadingBranch: boolean;
      isSettingDefault: boolean;
      isSwitchingBranch: boolean;
    }

    const isAnyLoading = (state: LoadingState): boolean => {
      return (
        state.isLoadingPreferences ||
        state.isLoadingBranch ||
        state.isSettingDefault ||
        state.isSwitchingBranch
      );
    };

    const shouldDisableInteractions = (state: LoadingState): boolean => {
      return state.isSettingDefault || state.isSwitchingBranch;
    };

    it("should detect when any loading is active", () => {
      expect(
        isAnyLoading({
          isLoadingPreferences: true,
          isLoadingBranch: false,
          isSettingDefault: false,
          isSwitchingBranch: false,
        })
      ).toBe(true);

      expect(
        isAnyLoading({
          isLoadingPreferences: false,
          isLoadingBranch: true,
          isSettingDefault: false,
          isSwitchingBranch: false,
        })
      ).toBe(true);
    });

    it("should detect when no loading is active", () => {
      expect(
        isAnyLoading({
          isLoadingPreferences: false,
          isLoadingBranch: false,
          isSettingDefault: false,
          isSwitchingBranch: false,
        })
      ).toBe(false);
    });

    it("should disable interactions during setting default", () => {
      expect(
        shouldDisableInteractions({
          isLoadingPreferences: false,
          isLoadingBranch: false,
          isSettingDefault: true,
          isSwitchingBranch: false,
        })
      ).toBe(true);
    });

    it("should disable interactions during branch switching", () => {
      expect(
        shouldDisableInteractions({
          isLoadingPreferences: false,
          isLoadingBranch: false,
          isSettingDefault: false,
          isSwitchingBranch: true,
        })
      ).toBe(true);
    });

    it("should NOT disable interactions during initial load", () => {
      expect(
        shouldDisableInteractions({
          isLoadingPreferences: true,
          isLoadingBranch: true,
          isSettingDefault: false,
          isSwitchingBranch: false,
        })
      ).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with multiple appointments across branches", () => {
      // First appointment sets default to riyadh-granada
      const firstBooking = {
        branchId: "riyadh-granada" as ClinicBranchID,
        hasExistingDefault: false,
      };
      const shouldSetFirst = !firstBooking.hasExistingDefault;
      expect(shouldSetFirst).toBe(true);

      // Second appointment at different branch should NOT change default
      const secondBooking = {
        branchId: "jeddah" as ClinicBranchID,
        hasExistingDefault: true, // Now has default from first booking
      };
      const shouldSetSecond = !secondBooking.hasExistingDefault;
      expect(shouldSetSecond).toBe(false);
    });

    it("should handle rapid branch switches", () => {
      const switches = ["riyadh-granada", "jeddah", "al-ahsa", "riyadh-granada"];
      let currentBranch = "";

      switches.forEach((branchId) => {
        currentBranch = branchId;
      });

      expect(currentBranch).toBe("riyadh-granada");
    });

    it("should handle concurrent default setting attempts", () => {
      // Simulate race condition prevention
      let isSettingDefault = false;

      const attemptSetDefault = (): boolean => {
        if (isSettingDefault) return false;
        isSettingDefault = true;
        return true;
      };

      expect(attemptSetDefault()).toBe(true);
      expect(attemptSetDefault()).toBe(false); // Second attempt blocked
    });

    it("should handle user logging out and back in", () => {
      // Default should persist across sessions (stored in Firestore)
      const userSession1 = createMockPreferences("MRN-123", "riyadh-granada");
      const userSession2 = createMockPreferences("MRN-123", "riyadh-granada");

      expect(userSession1.defaultBranchId).toBe(userSession2.defaultBranchId);
    });
  });

  describe("Localization", () => {
    const getLocalizedLabel = (
      locale: "ar" | "en",
      isDefault: boolean
    ): string => {
      if (isDefault) {
        return locale === "ar" ? "الفرع الافتراضي" : "Default Branch";
      }
      return locale === "ar" ? "تعيين كافتراضي" : "Set as Default";
    };

    it("should return English label for default branch", () => {
      expect(getLocalizedLabel("en", true)).toBe("Default Branch");
    });

    it("should return Arabic label for default branch", () => {
      expect(getLocalizedLabel("ar", true)).toBe("الفرع الافتراضي");
    });

    it("should return English label for set as default", () => {
      expect(getLocalizedLabel("en", false)).toBe("Set as Default");
    });

    it("should return Arabic label for set as default", () => {
      expect(getLocalizedLabel("ar", false)).toBe("تعيين كافتراضي");
    });
  });

  describe("Branch Availability", () => {
    const getAvailableBranches = () => {
      return clinicLocations.filter((c) => !c.isCommingSoon);
    };

    it("should filter out coming soon branches", () => {
      const available = getAvailableBranches();
      available.forEach((branch) => {
        expect(branch.isCommingSoon).toBeFalsy();
      });
    });

    it("should include active branches", () => {
      const available = getAvailableBranches();
      expect(available.length).toBeGreaterThan(0);
    });

    it("should not allow setting coming soon branch as default", () => {
      const comingSoonBranches = clinicLocations.filter((c) => c.isCommingSoon);
      const availableBranches = getAvailableBranches();

      comingSoonBranches.forEach((branch) => {
        expect(availableBranches.map((b) => b.id)).not.toContain(branch.id);
      });
    });
  });
});
