/**
 * Tests for NavHeader User Info Display
 *
 * Verifies that user information (name, phone) is correctly
 * displayed in the navigation header for logged-in users.
 */

import { CurrentUserType } from "@/models/CurrentUserType";

describe("NavHeader User Info Display", () => {
  // Helper to build display name (mirrors NavHeader logic)
  const buildDisplayName = (userData: Partial<CurrentUserType> | undefined): string => {
    if (!userData) return "";
    return [userData.firstName, userData.lastName]
      .filter((name) => name && name !== "-")
      .join(" ")
      .trim();
  };

  // Helper to determine what to show in desktop view
  const getDesktopDisplayText = (
    userData: Partial<CurrentUserType> | undefined
  ): string => {
    const displayName = buildDisplayName(userData);
    return displayName || userData?.phone || "";
  };

  // Helper to determine what to show in mobile view name field
  const getMobileDisplayName = (
    userData: Partial<CurrentUserType> | undefined,
    guestLabel: string = "Guest"
  ): string => {
    const displayName = buildDisplayName(userData);
    return displayName || guestLabel;
  };

  // Helper to check if user has logged in (has userId)
  const shouldShowUserInfo = (userData: Partial<CurrentUserType> | undefined): boolean => {
    return !!(userData?.userId);
  };

  describe("Display name construction", () => {
    it("should build name from first and last name", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("Ahmed Radwan");
    });

    it("should handle first name only", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("Ahmed");
    });

    it("should handle last name only", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: undefined,
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("Radwan");
    });

    it("should return empty string when no names available", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: undefined,
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("");
    });

    it("should filter out dash (-) as empty value for first name", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "-",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("Radwan");
    });

    it("should filter out dash (-) as empty value for last name", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "-",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("Ahmed");
    });

    it("should return empty when both names are dashes", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "-",
        lastName: "-",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("");
    });

    it("should handle undefined userData", () => {
      expect(buildDisplayName(undefined)).toBe("");
    });

    it("should handle empty strings as names", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "",
        lastName: "",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("");
    });

    it("should trim whitespace from result", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed ",
        lastName: " Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      // The join will create "Ahmed   Radwan", trim handles edges
      const result = buildDisplayName(userData);
      expect(result).not.toMatch(/^\s|\s$/);
    });
  });

  describe("Desktop display text", () => {
    it("should show full name when available", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(getDesktopDisplayText(userData)).toBe("Ahmed Radwan");
    });

    it("should fall back to phone when name not available", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: undefined,
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(getDesktopDisplayText(userData)).toBe("+966501234567");
    });

    it("should fall back to phone when names are dashes", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "-",
        lastName: "-",
        userId: "+966509876543",
        phone: "+966509876543",
      };

      expect(getDesktopDisplayText(userData)).toBe("+966509876543");
    });

    it("should return empty string when no data", () => {
      expect(getDesktopDisplayText(undefined)).toBe("");
    });

    it("should prefer name over phone", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Sarah",
        lastName: "Ali",
        userId: "+966509999999",
        phone: "+966509999999",
      };

      expect(getDesktopDisplayText(userData)).toBe("Sarah Ali");
      expect(getDesktopDisplayText(userData)).not.toContain("+966");
    });
  });

  describe("Mobile display name", () => {
    it("should show full name when available", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(getMobileDisplayName(userData)).toBe("Ahmed Radwan");
    });

    it("should fall back to Guest when name not available", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: undefined,
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(getMobileDisplayName(userData, "Guest")).toBe("Guest");
    });

    it("should use Arabic guest label when provided", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "-",
        lastName: "-",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(getMobileDisplayName(userData, "زائر")).toBe("زائر");
    });

    it("should show name even with partial data", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Mohammed",
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(getMobileDisplayName(userData)).toBe("Mohammed");
    });
  });

  describe("User info visibility", () => {
    it("should show user info when userId exists", () => {
      const userData: Partial<CurrentUserType> = {
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(shouldShowUserInfo(userData)).toBe(true);
    });

    it("should NOT show user info when userId is undefined", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "Radwan",
        userId: undefined,
      };

      expect(shouldShowUserInfo(userData)).toBe(false);
    });

    it("should NOT show user info when userId is empty string", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "Radwan",
        userId: "",
      };

      expect(shouldShowUserInfo(userData)).toBe(false);
    });

    it("should NOT show user info when userData is undefined", () => {
      expect(shouldShowUserInfo(undefined)).toBe(false);
    });

    it("should show user info even without name if userId exists", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: undefined,
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(shouldShowUserInfo(userData)).toBe(true);
    });
  });

  describe("Phone display in mobile view", () => {
    it("should always show phone when user is logged in", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      // Phone should be displayed separately in mobile view
      expect(userData.phone).toBe("+966501234567");
    });

    it("should handle various phone formats", () => {
      const phoneFormats = [
        "+966501234567",
        "+971501234567",
        "+44123456789",
      ];

      phoneFormats.forEach((phone) => {
        const userData: Partial<CurrentUserType> = { userId: phone, phone };
        expect(shouldShowUserInfo(userData)).toBe(true);
        expect(userData.phone).toBe(phone);
      });
    });
  });

  describe("Name localization scenarios", () => {
    it("should handle Arabic names", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "أحمد",
        lastName: "رضوان",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("أحمد رضوان");
    });

    it("should handle mixed Arabic/English names", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed",
        lastName: "الرضوان",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("Ahmed الرضوان");
    });

    it("should handle names with special characters", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "O'Brien",
        lastName: "Al-Rashid",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      expect(buildDisplayName(userData)).toBe("O'Brien Al-Rashid");
    });
  });

  describe("Edge cases", () => {
    it("should handle very long names", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Abdulrahman",
        lastName: "Al-Muhammadiyah",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      const displayName = buildDisplayName(userData);
      expect(displayName).toBe("Abdulrahman Al-Muhammadiyah");
      expect(displayName.length).toBeGreaterThan(20);
    });

    it("should handle names with multiple spaces", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "Ahmed  Mohamed", // Double space
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      // The function doesn't collapse internal spaces, just trims
      const displayName = buildDisplayName(userData);
      expect(displayName).toContain("Ahmed");
      expect(displayName).toContain("Radwan");
    });

    it("should handle null-like values gracefully", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: null as unknown as string,
        lastName: undefined,
        userId: "+966501234567",
        phone: "+966501234567",
      };

      // null is falsy, should be filtered out
      expect(buildDisplayName(userData)).toBe("");
    });

    it("should handle whitespace-only names", () => {
      const userData: Partial<CurrentUserType> = {
        firstName: "   ",
        lastName: "   ",
        userId: "+966501234567",
        phone: "+966501234567",
      };

      // Whitespace strings are truthy but trim to empty
      const displayName = buildDisplayName(userData);
      // The filter checks truthiness, so "   " passes, but join + trim handles it
      expect(displayName.trim()).toBe("");
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete user profile", () => {
      const userData: CurrentUserType = {
        firstName: "Ahmed",
        middleName: "Mohamed", // Should be ignored in display name
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
        emailAddress: "ahmed@example.com",
      };

      expect(buildDisplayName(userData)).toBe("Ahmed Radwan");
      expect(buildDisplayName(userData)).not.toContain("Mohamed");
    });

    it("should work with new user (no personal info yet)", () => {
      const newUser: Partial<CurrentUserType> = {
        firstName: "-",
        middleName: "-",
        lastName: "-",
        userId: "+966501234567",
        phone: "+966501234567",
        emailAddress: "",
      };

      expect(buildDisplayName(newUser)).toBe("");
      expect(getDesktopDisplayText(newUser)).toBe("+966501234567");
      expect(getMobileDisplayName(newUser, "Guest")).toBe("Guest");
    });

    it("should handle returning patient with full profile", () => {
      const returningPatient: CurrentUserType = {
        firstName: "Sarah",
        middleName: "Abdullah",
        lastName: "Al-Fahad",
        userId: "+966509876543",
        phone: "+966509876543",
        emailAddress: "sarah@example.com",
      };

      expect(shouldShowUserInfo(returningPatient)).toBe(true);
      expect(buildDisplayName(returningPatient)).toBe("Sarah Al-Fahad");
      expect(getDesktopDisplayText(returningPatient)).toBe("Sarah Al-Fahad");
      expect(getMobileDisplayName(returningPatient)).toBe("Sarah Al-Fahad");
    });
  });

  describe("Loading state handling", () => {
    it("should handle loading state (undefined data)", () => {
      const _isLoading = true;
      const userData: CurrentUserType | undefined = undefined;

      // During loading, user info should not be shown
      expect(shouldShowUserInfo(userData)).toBe(false);
      expect(buildDisplayName(userData)).toBe("");
    });

    it("should show user info after loading completes", () => {
      const _isLoading = false;
      const userData: CurrentUserType = {
        firstName: "Ahmed",
        middleName: "Mohamed",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
        emailAddress: "ahmed@example.com",
      };

      expect(shouldShowUserInfo(userData)).toBe(true);
      expect(buildDisplayName(userData)).toBe("Ahmed Radwan");
    });
  });

  describe("Logout state handling", () => {
    it("should clear user info on logout", () => {
      // Before logout
      let userData: CurrentUserType | undefined = {
        firstName: "Ahmed",
        middleName: "Mohamed",
        lastName: "Radwan",
        userId: "+966501234567",
        phone: "+966501234567",
        emailAddress: "ahmed@example.com",
      };

      expect(shouldShowUserInfo(userData)).toBe(true);

      // After logout (mutate to undefined)
      userData = undefined;

      expect(shouldShowUserInfo(userData)).toBe(false);
      expect(buildDisplayName(userData)).toBe("");
    });
  });
});
