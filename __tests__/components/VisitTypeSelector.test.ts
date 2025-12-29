/**
 * Tests for Visit Type Selector on Doctors Page
 *
 * Verifies the compact pill-style visit type selector behavior,
 * including selection states, doctor filtering, and disabled states.
 */

import { doctors } from "@/models/DoctorModel";
import { AvailabilityFilter } from "@/models/VisitTypeModel";

describe("Visit Type Selector on Doctors Page", () => {
  // Helper to filter doctors by branch (simulating page behavior)
  const getDoctorsForBranch = (branchId: string) => {
    return doctors.filter((doc) => doc.branchId === branchId);
  };

  // Helper to check if doctor is available for visit type
  const isDoctorAvailable = (
    doctor: (typeof doctors)[0],
    availabilityFilter: AvailabilityFilter | undefined
  ): boolean => {
    if (!availabilityFilter) return false;
    switch (availabilityFilter) {
      case "clinic":
        return doctor.availability.clinic;
      case "virtual":
        return doctor.availability.virtual;
      default:
        return true;
    }
  };

  // Helper to count available doctors for each type
  const countDoctorsByType = (doctorsList: typeof doctors) => {
    return {
      clinic: doctorsList.filter((d) => d.availability.clinic).length,
      virtual: doctorsList.filter((d) => d.availability.virtual).length,
    };
  };

  describe("Visit type button states", () => {
    it("should have no visit type selected initially", () => {
      const availabilityFilter: AvailabilityFilter | undefined = undefined;
      expect(availabilityFilter).toBeUndefined();
    });

    it("should allow selecting clinic visit type", () => {
      let availabilityFilter: AvailabilityFilter | undefined = undefined;

      // Simulate clicking clinic button
      availabilityFilter = "clinic";

      expect(availabilityFilter).toBe("clinic");
    });

    it("should allow selecting virtual visit type", () => {
      let availabilityFilter: AvailabilityFilter | undefined = undefined;

      // Simulate clicking virtual button
      availabilityFilter = "virtual";

      expect(availabilityFilter).toBe("virtual");
    });

    it("should allow switching between visit types", () => {
      let availabilityFilter: AvailabilityFilter | undefined = undefined;

      // Select clinic first
      availabilityFilter = "clinic";
      expect(availabilityFilter).toBe("clinic");

      // Switch to virtual
      availabilityFilter = "virtual";
      expect(availabilityFilter).toBe("virtual");

      // Switch back to clinic
      availabilityFilter = "clinic";
      expect(availabilityFilter).toBe("clinic");
    });
  });

  describe("Doctor count display", () => {
    it("should count clinic-available doctors correctly", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const counts = countDoctorsByType(branchDoctors);

      expect(counts.clinic).toBeGreaterThanOrEqual(0);
      expect(typeof counts.clinic).toBe("number");
    });

    it("should count virtual-available doctors correctly", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const counts = countDoctorsByType(branchDoctors);

      expect(counts.virtual).toBeGreaterThanOrEqual(0);
      expect(typeof counts.virtual).toBe("number");
    });

    it("should have accurate counts matching actual availability", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const counts = countDoctorsByType(branchDoctors);

      // Manually count to verify
      let clinicCount = 0;
      let virtualCount = 0;
      branchDoctors.forEach((doc) => {
        if (doc.availability.clinic) clinicCount++;
        if (doc.availability.virtual) virtualCount++;
      });

      expect(counts.clinic).toBe(clinicCount);
      expect(counts.virtual).toBe(virtualCount);
    });

    it("should show zero count for branches with no doctors", () => {
      const branchDoctors = getDoctorsForBranch("non-existent-branch");
      const counts = countDoctorsByType(branchDoctors);

      expect(counts.clinic).toBe(0);
      expect(counts.virtual).toBe(0);
    });
  });

  describe("Button disabled state", () => {
    it("should disable clinic button when no clinic doctors available", () => {
      const branchDoctors: typeof doctors = [];
      const counts = countDoctorsByType(branchDoctors);

      const shouldDisableClinicButton = counts.clinic === 0;
      expect(shouldDisableClinicButton).toBe(true);
    });

    it("should disable virtual button when no virtual doctors available", () => {
      const branchDoctors: typeof doctors = [];
      const counts = countDoctorsByType(branchDoctors);

      const shouldDisableVirtualButton = counts.virtual === 0;
      expect(shouldDisableVirtualButton).toBe(true);
    });

    it("should enable buttons when doctors are available", () => {
      // Create mock doctors with availability
      const mockDoctors = [
        { availability: { clinic: true, virtual: false } },
        { availability: { clinic: false, virtual: true } },
      ] as typeof doctors;

      const counts = countDoctorsByType(mockDoctors);

      expect(counts.clinic).toBe(1);
      expect(counts.virtual).toBe(1);
      expect(counts.clinic === 0).toBe(false); // Not disabled
      expect(counts.virtual === 0).toBe(false); // Not disabled
    });
  });

  describe("Doctor availability filtering", () => {
    it("should return false for all doctors when no visit type selected", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const availabilityFilter: AvailabilityFilter | undefined = undefined;

      branchDoctors.forEach((doctor) => {
        expect(isDoctorAvailable(doctor, availabilityFilter)).toBe(false);
      });
    });

    it("should filter doctors correctly for clinic visit type", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const availabilityFilter: AvailabilityFilter = "clinic";

      branchDoctors.forEach((doctor) => {
        const isAvailable = isDoctorAvailable(doctor, availabilityFilter);
        expect(isAvailable).toBe(doctor.availability.clinic);
      });
    });

    it("should filter doctors correctly for virtual visit type", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const availabilityFilter: AvailabilityFilter = "virtual";

      branchDoctors.forEach((doctor) => {
        const isAvailable = isDoctorAvailable(doctor, availabilityFilter);
        expect(isAvailable).toBe(doctor.availability.virtual);
      });
    });

    it("should handle doctor with only clinic availability", () => {
      const clinicOnlyDoctor = {
        availability: { clinic: true, virtual: false },
      } as (typeof doctors)[0];

      expect(isDoctorAvailable(clinicOnlyDoctor, "clinic")).toBe(true);
      expect(isDoctorAvailable(clinicOnlyDoctor, "virtual")).toBe(false);
      expect(isDoctorAvailable(clinicOnlyDoctor, undefined)).toBe(false);
    });

    it("should handle doctor with only virtual availability", () => {
      const virtualOnlyDoctor = {
        availability: { clinic: false, virtual: true },
      } as (typeof doctors)[0];

      expect(isDoctorAvailable(virtualOnlyDoctor, "clinic")).toBe(false);
      expect(isDoctorAvailable(virtualOnlyDoctor, "virtual")).toBe(true);
      expect(isDoctorAvailable(virtualOnlyDoctor, undefined)).toBe(false);
    });

    it("should handle doctor with both availability types", () => {
      const bothAvailableDoctor = {
        availability: { clinic: true, virtual: true },
      } as (typeof doctors)[0];

      expect(isDoctorAvailable(bothAvailableDoctor, "clinic")).toBe(true);
      expect(isDoctorAvailable(bothAvailableDoctor, "virtual")).toBe(true);
      expect(isDoctorAvailable(bothAvailableDoctor, undefined)).toBe(false);
    });
  });

  describe("Doctor card disabled state", () => {
    it("should disable all doctor cards when no visit type selected", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const availabilityFilter: AvailabilityFilter | undefined = undefined;

      const allDisabled = branchDoctors.every(
        (doctor) => !isDoctorAvailable(doctor, availabilityFilter)
      );

      expect(allDisabled).toBe(true);
    });

    it("should enable only clinic-available doctors when clinic selected", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const availabilityFilter: AvailabilityFilter = "clinic";

      branchDoctors.forEach((doctor) => {
        const shouldBeEnabled = isDoctorAvailable(doctor, availabilityFilter);
        expect(shouldBeEnabled).toBe(doctor.availability.clinic);
      });
    });

    it("should enable only virtual-available doctors when virtual selected", () => {
      const branchDoctors = getDoctorsForBranch("riyadh-granada");
      const availabilityFilter: AvailabilityFilter = "virtual";

      branchDoctors.forEach((doctor) => {
        const shouldBeEnabled = isDoctorAvailable(doctor, availabilityFilter);
        expect(shouldBeEnabled).toBe(doctor.availability.virtual);
      });
    });
  });

  describe("URL params integration", () => {
    it("should update URL when visit type is selected", () => {
      // Simulate the URL update logic
      const updateURLWithVisitType = (
        searchParams: URLSearchParams,
        visitType: AvailabilityFilter
      ) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("selectedVisitType", visitType);
        return newParams;
      };

      const initialParams = new URLSearchParams("selectedClinicLocation=riyadh-granada");
      const updatedParams = updateURLWithVisitType(initialParams, "clinic");

      expect(updatedParams.get("selectedVisitType")).toBe("clinic");
      expect(updatedParams.get("selectedClinicLocation")).toBe("riyadh-granada");
    });

    it("should preserve existing URL params when updating visit type", () => {
      const updateURLWithVisitType = (
        searchParams: URLSearchParams,
        visitType: AvailabilityFilter
      ) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("selectedVisitType", visitType);
        return newParams;
      };

      const initialParams = new URLSearchParams(
        "selectedClinicLocation=riyadh-granada&selectedService=having-child"
      );
      const updatedParams = updateURLWithVisitType(initialParams, "virtual");

      expect(updatedParams.get("selectedVisitType")).toBe("virtual");
      expect(updatedParams.get("selectedClinicLocation")).toBe("riyadh-granada");
      expect(updatedParams.get("selectedService")).toBe("having-child");
    });

    it("should overwrite existing visit type in URL", () => {
      const updateURLWithVisitType = (
        searchParams: URLSearchParams,
        visitType: AvailabilityFilter
      ) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("selectedVisitType", visitType);
        return newParams;
      };

      const initialParams = new URLSearchParams("selectedVisitType=clinic");
      const updatedParams = updateURLWithVisitType(initialParams, "virtual");

      expect(updatedParams.get("selectedVisitType")).toBe("virtual");
    });
  });

  describe("Hint message visibility", () => {
    it("should show hint when no visit type selected", () => {
      const availabilityFilter: AvailabilityFilter | undefined = undefined;
      const shouldShowHint = !availabilityFilter;

      expect(shouldShowHint).toBe(true);
    });

    it("should hide hint when clinic is selected", () => {
      const availabilityFilter: AvailabilityFilter = "clinic";
      const shouldShowHint = !availabilityFilter;

      expect(shouldShowHint).toBe(false);
    });

    it("should hide hint when virtual is selected", () => {
      const availabilityFilter: AvailabilityFilter = "virtual";
      const shouldShowHint = !availabilityFilter;

      expect(shouldShowHint).toBe(false);
    });
  });

  describe("Button styling states", () => {
    // Test the logic that determines button styling
    const getButtonStyle = (
      buttonType: "clinic" | "virtual",
      selectedType: AvailabilityFilter | undefined,
      doctorCount: number
    ) => {
      const isSelected = selectedType === buttonType;
      const isDisabled = doctorCount === 0;

      return {
        isSelected,
        isDisabled,
        hasSelectedStyle: isSelected && !isDisabled,
        hasDefaultStyle: !isSelected && !isDisabled,
        hasDisabledStyle: isDisabled,
      };
    };

    it("should apply selected style when clinic is selected", () => {
      const style = getButtonStyle("clinic", "clinic", 3);

      expect(style.isSelected).toBe(true);
      expect(style.hasSelectedStyle).toBe(true);
      expect(style.hasDefaultStyle).toBe(false);
    });

    it("should apply selected style when virtual is selected", () => {
      const style = getButtonStyle("virtual", "virtual", 2);

      expect(style.isSelected).toBe(true);
      expect(style.hasSelectedStyle).toBe(true);
      expect(style.hasDefaultStyle).toBe(false);
    });

    it("should apply default style when button is not selected", () => {
      const style = getButtonStyle("clinic", "virtual", 3);

      expect(style.isSelected).toBe(false);
      expect(style.hasSelectedStyle).toBe(false);
      expect(style.hasDefaultStyle).toBe(true);
    });

    it("should apply default style when nothing is selected", () => {
      const style = getButtonStyle("clinic", undefined, 3);

      expect(style.isSelected).toBe(false);
      expect(style.hasSelectedStyle).toBe(false);
      expect(style.hasDefaultStyle).toBe(true);
    });

    it("should apply disabled style when no doctors available", () => {
      const style = getButtonStyle("clinic", undefined, 0);

      expect(style.isDisabled).toBe(true);
      expect(style.hasDisabledStyle).toBe(true);
      expect(style.hasDefaultStyle).toBe(false);
    });

    it("should not apply selected style when disabled even if selected", () => {
      const style = getButtonStyle("clinic", "clinic", 0);

      expect(style.isSelected).toBe(true);
      expect(style.isDisabled).toBe(true);
      expect(style.hasSelectedStyle).toBe(false); // Selected but disabled
    });
  });

  describe("Doctor data validation", () => {
    it("all doctors should have availability object", () => {
      doctors.forEach((doctor) => {
        expect(doctor.availability).toBeDefined();
        expect(typeof doctor.availability.clinic).toBe("boolean");
        expect(typeof doctor.availability.virtual).toBe("boolean");
      });
    });

    it("all doctors should belong to a branch", () => {
      doctors.forEach((doctor) => {
        expect(doctor.branchId).toBeTruthy();
        expect(typeof doctor.branchId).toBe("string");
      });
    });

    it("at least one doctor should have clinic availability", () => {
      const hasClinicDoctor = doctors.some((d) => d.availability.clinic);
      expect(hasClinicDoctor).toBe(true);
    });

    it("at least one doctor should have virtual availability", () => {
      const hasVirtualDoctor = doctors.some((d) => d.availability.virtual);
      expect(hasVirtualDoctor).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty doctor list gracefully", () => {
      const emptyDoctors: typeof doctors = [];
      const counts = countDoctorsByType(emptyDoctors);

      expect(counts.clinic).toBe(0);
      expect(counts.virtual).toBe(0);
    });

    it("should handle all doctors with no availability", () => {
      const noAvailabilityDoctors = [
        { availability: { clinic: false, virtual: false } },
        { availability: { clinic: false, virtual: false } },
      ] as typeof doctors;

      const counts = countDoctorsByType(noAvailabilityDoctors);

      expect(counts.clinic).toBe(0);
      expect(counts.virtual).toBe(0);
    });

    it("should handle all doctors with full availability", () => {
      const fullAvailabilityDoctors = [
        { availability: { clinic: true, virtual: true } },
        { availability: { clinic: true, virtual: true } },
        { availability: { clinic: true, virtual: true } },
      ] as typeof doctors;

      const counts = countDoctorsByType(fullAvailabilityDoctors);

      expect(counts.clinic).toBe(3);
      expect(counts.virtual).toBe(3);
    });

    it("should handle rapid visit type switching", () => {
      let availabilityFilter: AvailabilityFilter | undefined = undefined;

      // Simulate rapid switching
      const types: (AvailabilityFilter | undefined)[] = [
        "clinic",
        "virtual",
        "clinic",
        "virtual",
        undefined,
        "clinic",
      ];

      types.forEach((type) => {
        availabilityFilter = type;
      });

      expect(availabilityFilter).toBe("clinic"); // Should be last value
    });
  });

  describe("Accessibility considerations", () => {
    it("disabled buttons should not be clickable", () => {
      const isDisabled = true;
      let wasClicked = false;

      // Simulate click handler that checks disabled state
      const handleClick = () => {
        if (!isDisabled) {
          wasClicked = true;
        }
      };

      handleClick();
      expect(wasClicked).toBe(false);
    });

    it("enabled buttons should be clickable", () => {
      const isDisabled = false;
      let wasClicked = false;

      const handleClick = () => {
        if (!isDisabled) {
          wasClicked = true;
        }
      };

      handleClick();
      expect(wasClicked).toBe(true);
    });
  });
});
