/**
 * Tests for Manage Appointments URL Parameters Feature
 *
 * Verifies the URL parameter functionality including:
 * - Branch parameter parsing and validation
 * - Appointment ID parameter handling
 * - Priority logic (URL > default branch)
 * - Appointment highlighting
 * - Not found state handling
 */

import { ClinicBranchID, clinicLocations } from "@/models/ClinicModel";

describe("Manage Appointments URL Params Feature", () => {
  describe("Branch Parameter Validation", () => {
    // Validates branch from URL - must exist and not be "coming soon"
    const validateBranchFromUrl = (branchFromUrl: string | null): ClinicBranchID | null => {
      if (!branchFromUrl) return null;
      const clinic = clinicLocations.find((c) => c.id === branchFromUrl);
      if (!clinic || clinic.isCommingSoon) return null;
      return clinic.id as ClinicBranchID;
    };

    it("should return valid branch ID for riyadh-granada", () => {
      const result = validateBranchFromUrl("riyadh-granada");
      expect(result).toBe("riyadh-granada");
    });

    it("should return valid branch ID for jeddah", () => {
      const result = validateBranchFromUrl("jeddah");
      expect(result).toBe("jeddah");
    });

    it("should return valid branch ID for al-ahsa", () => {
      const result = validateBranchFromUrl("al-ahsa");
      expect(result).toBe("al-ahsa");
    });

    it("should return null for invalid branch ID", () => {
      const result = validateBranchFromUrl("invalid-branch");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = validateBranchFromUrl("");
      expect(result).toBeNull();
    });

    it("should return null for null input", () => {
      const result = validateBranchFromUrl(null);
      expect(result).toBeNull();
    });

    it("should return null for coming soon branches", () => {
      // Find a coming soon branch to test
      const comingSoonBranch = clinicLocations.find((c) => c.isCommingSoon);
      if (comingSoonBranch) {
        const result = validateBranchFromUrl(comingSoonBranch.id);
        expect(result).toBeNull();
      }
    });
  });

  describe("Target Branch Priority Logic", () => {
    interface PriorityParams {
      validBranchFromUrl: ClinicBranchID | null;
      defaultBranchId: ClinicBranchID | null;
    }

    // Priority: URL param > default branch
    const getTargetBranchId = (params: PriorityParams): ClinicBranchID | null => {
      if (params.validBranchFromUrl) return params.validBranchFromUrl;
      if (params.defaultBranchId) return params.defaultBranchId;
      return null;
    };

    it("should prioritize URL branch over default", () => {
      const result = getTargetBranchId({
        validBranchFromUrl: "jeddah",
        defaultBranchId: "riyadh-granada",
      });
      expect(result).toBe("jeddah");
    });

    it("should use default branch when URL branch is null", () => {
      const result = getTargetBranchId({
        validBranchFromUrl: null,
        defaultBranchId: "riyadh-granada",
      });
      expect(result).toBe("riyadh-granada");
    });

    it("should return null when both are null", () => {
      const result = getTargetBranchId({
        validBranchFromUrl: null,
        defaultBranchId: null,
      });
      expect(result).toBeNull();
    });

    it("should use URL branch when default is null", () => {
      const result = getTargetBranchId({
        validBranchFromUrl: "al-ahsa",
        defaultBranchId: null,
      });
      expect(result).toBe("al-ahsa");
    });
  });

  describe("Auto-Switch with URL Branch", () => {
    interface AutoSwitchParams {
      hasAutoSwitched: boolean;
      isLoadingPreferences: boolean;
      isLoadingBranch: boolean;
      targetBranchId: ClinicBranchID | null;
      currentBranchId: string | null;
    }

    const needsAutoSwitch = (params: AutoSwitchParams): boolean => {
      if (params.isLoadingPreferences || params.isLoadingBranch) return false;
      if (!params.targetBranchId) return false;
      if (params.currentBranchId === params.targetBranchId) return false;
      return !params.hasAutoSwitched;
    };

    it("should switch when URL branch differs from current", () => {
      const result = needsAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        targetBranchId: "jeddah",
        currentBranchId: "riyadh-granada",
      });
      expect(result).toBe(true);
    });

    it("should NOT switch when already on target branch", () => {
      const result = needsAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        targetBranchId: "jeddah",
        currentBranchId: "jeddah",
      });
      expect(result).toBe(false);
    });

    it("should NOT switch when already auto-switched", () => {
      const result = needsAutoSwitch({
        hasAutoSwitched: true,
        isLoadingPreferences: false,
        isLoadingBranch: false,
        targetBranchId: "jeddah",
        currentBranchId: "riyadh-granada",
      });
      expect(result).toBe(false);
    });

    it("should NOT switch while loading", () => {
      const result = needsAutoSwitch({
        hasAutoSwitched: false,
        isLoadingPreferences: true,
        isLoadingBranch: false,
        targetBranchId: "jeddah",
        currentBranchId: "riyadh-granada",
      });
      expect(result).toBe(false);
    });
  });

  describe("Appointment ID Parameter Handling", () => {
    interface AppointmentData {
      id: number;
      status: { name: string };
    }

    const findAppointmentById = (
      appointments: AppointmentData[],
      appointmentId: string | null
    ): AppointmentData | undefined => {
      if (!appointmentId) return undefined;
      return appointments.find((apt) => String(apt.id) === appointmentId);
    };

    const sampleAppointments: AppointmentData[] = [
      { id: 123, status: { name: "Approved/Confirmed" } },
      { id: 456, status: { name: "Cancelled" } },
      { id: 789, status: { name: "Pending" } },
    ];

    it("should find appointment by ID string", () => {
      const result = findAppointmentById(sampleAppointments, "123");
      expect(result).toBeDefined();
      expect(result?.id).toBe(123);
    });

    it("should return undefined for non-existent ID", () => {
      const result = findAppointmentById(sampleAppointments, "999");
      expect(result).toBeUndefined();
    });

    it("should return undefined for null ID", () => {
      const result = findAppointmentById(sampleAppointments, null);
      expect(result).toBeUndefined();
    });

    it("should find cancelled appointment by ID", () => {
      const result = findAppointmentById(sampleAppointments, "456");
      expect(result).toBeDefined();
      expect(result?.status.name).toBe("Cancelled");
    });
  });

  describe("Appointment Not Found State", () => {
    interface CheckParams {
      isLoading: boolean;
      isInitializing: boolean;
      appointmentIdFromUrl: string | null;
      appointments: { id: number }[];
    }

    const shouldShowNotFound = (params: CheckParams): boolean => {
      if (params.isLoading || params.isInitializing) return false;
      if (!params.appointmentIdFromUrl) return false;
      const found = params.appointments.some(
        (apt) => String(apt.id) === params.appointmentIdFromUrl
      );
      return !found;
    };

    it("should show not found when appointment doesn't exist", () => {
      const result = shouldShowNotFound({
        isLoading: false,
        isInitializing: false,
        appointmentIdFromUrl: "999",
        appointments: [{ id: 123 }, { id: 456 }],
      });
      expect(result).toBe(true);
    });

    it("should NOT show not found when appointment exists", () => {
      const result = shouldShowNotFound({
        isLoading: false,
        isInitializing: false,
        appointmentIdFromUrl: "123",
        appointments: [{ id: 123 }, { id: 456 }],
      });
      expect(result).toBe(false);
    });

    it("should NOT show not found while loading", () => {
      const result = shouldShowNotFound({
        isLoading: true,
        isInitializing: false,
        appointmentIdFromUrl: "999",
        appointments: [],
      });
      expect(result).toBe(false);
    });

    it("should NOT show not found while initializing", () => {
      const result = shouldShowNotFound({
        isLoading: false,
        isInitializing: true,
        appointmentIdFromUrl: "999",
        appointments: [],
      });
      expect(result).toBe(false);
    });

    it("should NOT show not found when no appointmentId in URL", () => {
      const result = shouldShowNotFound({
        isLoading: false,
        isInitializing: false,
        appointmentIdFromUrl: null,
        appointments: [],
      });
      expect(result).toBe(false);
    });
  });

  describe("Appointment Highlighting", () => {
    it("should highlight when appointment ID matches URL param", () => {
      const appointmentIdFromUrl = "123";
      const appointmentId = 123;
      const isHighlighted = appointmentIdFromUrl === String(appointmentId);
      expect(isHighlighted).toBe(true);
    });

    it("should NOT highlight when appointment ID doesn't match", () => {
      const appointmentIdFromUrl = "123";
      const appointmentId = 456;
      const isHighlighted = appointmentIdFromUrl === String(appointmentId);
      expect(isHighlighted).toBe(false);
    });

    it("should NOT highlight when URL param is null", () => {
      const appointmentIdFromUrl = null;
      const appointmentId = 123;
      const isHighlighted = appointmentIdFromUrl === String(appointmentId);
      expect(isHighlighted).toBe(false);
    });
  });

  describe("URL Construction for Email/SMS Links", () => {
    it("should construct valid URL with branch and appointment ID", () => {
      const baseUrl = "/manage-appointments";
      const branch = "riyadh-granada";
      const appointmentId = "12345";

      const params = new URLSearchParams();
      params.set("branch", branch);
      params.set("appointmentId", appointmentId);

      const fullUrl = `${baseUrl}?${params.toString()}`;

      expect(fullUrl).toContain("branch=riyadh-granada");
      expect(fullUrl).toContain("appointmentId=12345");
      expect(fullUrl).toBe("/manage-appointments?branch=riyadh-granada&appointmentId=12345");
    });

    it("should construct valid URL with only branch", () => {
      const baseUrl = "/manage-appointments";
      const branch = "jeddah";

      const params = new URLSearchParams();
      params.set("branch", branch);

      const fullUrl = `${baseUrl}?${params.toString()}`;

      expect(fullUrl).toBe("/manage-appointments?branch=jeddah");
    });

    it("should construct valid URL with only appointment ID", () => {
      const baseUrl = "/manage-appointments";
      const appointmentId = "67890";

      const params = new URLSearchParams();
      params.set("appointmentId", appointmentId);

      const fullUrl = `${baseUrl}?${params.toString()}`;

      expect(fullUrl).toBe("/manage-appointments?appointmentId=67890");
    });
  });

  describe("Loading State During Auto-Switch", () => {
    interface LoadingState {
      isLoadingPreferences: boolean;
      isLoadingBranch: boolean;
      needsAutoSwitch: boolean;
      isSwitchingBranch: boolean;
    }

    const isInitializing = (state: LoadingState): boolean => {
      return (
        state.isLoadingPreferences ||
        state.isLoadingBranch ||
        state.needsAutoSwitch ||
        state.isSwitchingBranch
      );
    };

    it("should be initializing while loading preferences", () => {
      const result = isInitializing({
        isLoadingPreferences: true,
        isLoadingBranch: false,
        needsAutoSwitch: false,
        isSwitchingBranch: false,
      });
      expect(result).toBe(true);
    });

    it("should be initializing while loading branch", () => {
      const result = isInitializing({
        isLoadingPreferences: false,
        isLoadingBranch: true,
        needsAutoSwitch: false,
        isSwitchingBranch: false,
      });
      expect(result).toBe(true);
    });

    it("should be initializing when auto-switch needed", () => {
      const result = isInitializing({
        isLoadingPreferences: false,
        isLoadingBranch: false,
        needsAutoSwitch: true,
        isSwitchingBranch: false,
      });
      expect(result).toBe(true);
    });

    it("should be initializing while switching branch", () => {
      const result = isInitializing({
        isLoadingPreferences: false,
        isLoadingBranch: false,
        needsAutoSwitch: false,
        isSwitchingBranch: true,
      });
      expect(result).toBe(true);
    });

    it("should NOT be initializing when all states are false", () => {
      const result = isInitializing({
        isLoadingPreferences: false,
        isLoadingBranch: false,
        needsAutoSwitch: false,
        isSwitchingBranch: false,
      });
      expect(result).toBe(false);
    });
  });
});
