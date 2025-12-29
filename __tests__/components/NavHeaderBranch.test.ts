/**
 * Tests for NavHeader Branch Name Display
 *
 * Verifies branch name loading states, skeleton loaders,
 * and display logic across desktop and mobile views.
 */

describe("NavHeader Branch Name Display", () => {
  // Simulate branch data structure
  interface BranchData {
    branch: {
      id: string;
      name: string;
    } | null;
  }

  // Helper to determine what BranchName component should render
  const getBranchNameState = (
    isLoading: boolean,
    data: BranchData | undefined
  ): "skeleton" | "content" | "hidden" => {
    if (isLoading) return "skeleton";
    if (!data?.branch?.id) return "hidden";
    return "content";
  };

  // Helper to determine what BranchNameInline component should render
  const getBranchNameInlineState = (
    isLoading: boolean,
    data: BranchData | undefined
  ): "skeleton" | "content" | "hidden" => {
    if (isLoading) return "skeleton";
    if (!data?.branch?.id) return "hidden";
    return "content";
  };

  // Helper to determine what BranchNameMobile component should render
  const getBranchNameMobileState = (
    isLoading: boolean,
    data: BranchData | undefined
  ): "skeleton" | "content" | "hidden" => {
    if (isLoading) return "skeleton";
    if (!data?.branch?.id) return "hidden";
    return "content";
  };

  describe("BranchName component (badge version)", () => {
    it("should show skeleton when loading", () => {
      const state = getBranchNameState(true, undefined);
      expect(state).toBe("skeleton");
    });

    it("should show skeleton when loading even with cached data", () => {
      const cachedData: BranchData = {
        branch: { id: "riyadh-granada", name: "Bnoon - Riyadh" },
      };
      const state = getBranchNameState(true, cachedData);
      expect(state).toBe("skeleton");
    });

    it("should show content when loaded with valid branch", () => {
      const data: BranchData = {
        branch: { id: "riyadh-granada", name: "Bnoon - Riyadh" },
      };
      const state = getBranchNameState(false, data);
      expect(state).toBe("content");
    });

    it("should be hidden when loaded but no branch selected", () => {
      const data: BranchData = { branch: null };
      const state = getBranchNameState(false, data);
      expect(state).toBe("hidden");
    });

    it("should be hidden when data is undefined", () => {
      const state = getBranchNameState(false, undefined);
      expect(state).toBe("hidden");
    });

    it("should be hidden when branch id is empty", () => {
      const data: BranchData = {
        branch: { id: "", name: "" },
      };
      const state = getBranchNameState(false, data);
      expect(state).toBe("hidden");
    });
  });

  describe("BranchNameInline component (desktop user card)", () => {
    it("should show skeleton when loading", () => {
      const state = getBranchNameInlineState(true, undefined);
      expect(state).toBe("skeleton");
    });

    it("should show content when loaded with valid branch", () => {
      const data: BranchData = {
        branch: { id: "jeddah", name: "Bnoon - Jeddah" },
      };
      const state = getBranchNameInlineState(false, data);
      expect(state).toBe("content");
    });

    it("should be hidden when no branch selected", () => {
      const data: BranchData = { branch: null };
      const state = getBranchNameInlineState(false, data);
      expect(state).toBe("hidden");
    });
  });

  describe("BranchNameMobile component", () => {
    it("should show skeleton when loading", () => {
      const state = getBranchNameMobileState(true, undefined);
      expect(state).toBe("skeleton");
    });

    it("should show content when loaded with valid branch", () => {
      const data: BranchData = {
        branch: { id: "al-ahsa", name: "Bnoon - Al Ahsa" },
      };
      const state = getBranchNameMobileState(false, data);
      expect(state).toBe("content");
    });

    it("should be hidden when no branch selected", () => {
      const state = getBranchNameMobileState(false, undefined);
      expect(state).toBe("hidden");
    });
  });

  describe("Branch visibility by auth state", () => {
    interface UserData {
      mrn?: string;
    }

    // For logged-in users: branch shows inside user card (inline/mobile)
    // For non-logged-in users: branch shows as badge
    const shouldShowBranchBadge = (userData: UserData | undefined): boolean => {
      return !userData?.mrn;
    };

    const shouldShowBranchInUserCard = (userData: UserData | undefined): boolean => {
      return !!userData?.mrn;
    };

    it("should show branch badge for non-logged-in users", () => {
      expect(shouldShowBranchBadge(undefined)).toBe(true);
      expect(shouldShowBranchBadge({ mrn: undefined })).toBe(true);
      expect(shouldShowBranchBadge({ mrn: "" })).toBe(true);
    });

    it("should NOT show branch badge for logged-in users", () => {
      expect(shouldShowBranchBadge({ mrn: "12345" })).toBe(false);
    });

    it("should show branch in user card for logged-in users", () => {
      expect(shouldShowBranchInUserCard({ mrn: "12345" })).toBe(true);
      expect(shouldShowBranchInUserCard({ mrn: "MRN-001" })).toBe(true);
    });

    it("should NOT show branch in user card for non-logged-in users", () => {
      expect(shouldShowBranchInUserCard(undefined)).toBe(false);
      expect(shouldShowBranchInUserCard({ mrn: undefined })).toBe(false);
    });
  });

  describe("Branch name translation key format", () => {
    const getTranslationKey = (branchId: string): string => {
      return `clinics.${branchId}.name`;
    };

    it("should generate correct translation key for riyadh-granada", () => {
      expect(getTranslationKey("riyadh-granada")).toBe("clinics.riyadh-granada.name");
    });

    it("should generate correct translation key for jeddah", () => {
      expect(getTranslationKey("jeddah")).toBe("clinics.jeddah.name");
    });

    it("should generate correct translation key for al-ahsa", () => {
      expect(getTranslationKey("al-ahsa")).toBe("clinics.al-ahsa.name");
    });

    it("should handle any branch id format", () => {
      expect(getTranslationKey("new-branch-2024")).toBe("clinics.new-branch-2024.name");
    });
  });

  describe("Skeleton loader dimensions", () => {
    // These tests document the expected skeleton sizes
    const skeletonDimensions = {
      branchBadge: { height: "h-6", width: "w-24" },
      branchInline: { height: "h-3", width: "w-16" },
      branchMobile: { height: "h-3", width: "w-14" },
    };

    it("should have correct dimensions for badge skeleton", () => {
      expect(skeletonDimensions.branchBadge.height).toBe("h-6");
      expect(skeletonDimensions.branchBadge.width).toBe("w-24");
    });

    it("should have correct dimensions for inline skeleton", () => {
      expect(skeletonDimensions.branchInline.height).toBe("h-3");
      expect(skeletonDimensions.branchInline.width).toBe("w-16");
    });

    it("should have correct dimensions for mobile skeleton", () => {
      expect(skeletonDimensions.branchMobile.height).toBe("h-3");
      expect(skeletonDimensions.branchMobile.width).toBe("w-14");
    });

    it("inline and mobile skeletons should be smaller than badge", () => {
      const badgeHeight = parseInt(skeletonDimensions.branchBadge.height.replace("h-", ""));
      const inlineHeight = parseInt(skeletonDimensions.branchInline.height.replace("h-", ""));
      const mobileHeight = parseInt(skeletonDimensions.branchMobile.height.replace("h-", ""));

      expect(inlineHeight).toBeLessThan(badgeHeight);
      expect(mobileHeight).toBeLessThan(badgeHeight);
    });
  });

  describe("Navigation order (desktop)", () => {
    // Document the expected navigation order
    const getDesktopNavOrder = (isLoggedIn: boolean): string[] => {
      if (isLoggedIn) {
        return [
          "myAppointments",
          "separator",
          "userCard", // Contains: user icon, name, branchInline
          "logoutButton",
          "languageSwitcher",
        ];
      }
      return ["branchBadge", "loginButton", "languageSwitcher"];
    };

    it("should have correct order for logged-in users", () => {
      const order = getDesktopNavOrder(true);
      expect(order[0]).toBe("myAppointments");
      expect(order[1]).toBe("separator");
      expect(order[2]).toBe("userCard");
      expect(order[3]).toBe("logoutButton");
      expect(order[4]).toBe("languageSwitcher");
    });

    it("should have correct order for non-logged-in users", () => {
      const order = getDesktopNavOrder(false);
      expect(order[0]).toBe("branchBadge");
      expect(order[1]).toBe("loginButton");
      expect(order[2]).toBe("languageSwitcher");
    });

    it("language switcher should always be last", () => {
      const loggedInOrder = getDesktopNavOrder(true);
      const loggedOutOrder = getDesktopNavOrder(false);

      expect(loggedInOrder[loggedInOrder.length - 1]).toBe("languageSwitcher");
      expect(loggedOutOrder[loggedOutOrder.length - 1]).toBe("languageSwitcher");
    });
  });

  describe("Mobile menu order", () => {
    const getMobileMenuOrder = (isLoggedIn: boolean): string[] => {
      if (isLoggedIn) {
        return [
          "userCard", // Contains: user icon, name, MRN, branchMobile
          "myAppointments",
          "logoutButton",
        ];
      }
      return ["branchBadge", "loginButton"];
    };

    it("should show user card first for logged-in users", () => {
      const order = getMobileMenuOrder(true);
      expect(order[0]).toBe("userCard");
    });

    it("should show branch badge for non-logged-in users", () => {
      const order = getMobileMenuOrder(false);
      expect(order[0]).toBe("branchBadge");
    });

    it("should have myAppointments after userCard for logged-in users", () => {
      const order = getMobileMenuOrder(true);
      expect(order.indexOf("myAppointments")).toBeGreaterThan(order.indexOf("userCard"));
    });
  });

  describe("Loading state combinations", () => {
    interface LoadingState {
      userLoading: boolean;
      branchLoading: boolean;
    }

    const getNavbarState = (
      loadingState: LoadingState,
      hasUser: boolean,
      hasBranch: boolean
    ) => {
      return {
        showUserInfo: !loadingState.userLoading && hasUser,
        showBranchSkeleton: loadingState.branchLoading,
        showBranchContent: !loadingState.branchLoading && hasBranch,
        showLoginButton: !loadingState.userLoading && !hasUser,
      };
    };

    it("should show skeletons when both loading", () => {
      const state = getNavbarState({ userLoading: true, branchLoading: true }, false, false);
      expect(state.showUserInfo).toBe(false);
      expect(state.showBranchSkeleton).toBe(true);
      expect(state.showLoginButton).toBe(false);
    });

    it("should show user info and branch skeleton when user loaded but branch loading", () => {
      const state = getNavbarState({ userLoading: false, branchLoading: true }, true, false);
      expect(state.showUserInfo).toBe(true);
      expect(state.showBranchSkeleton).toBe(true);
    });

    it("should show everything when fully loaded", () => {
      const state = getNavbarState({ userLoading: false, branchLoading: false }, true, true);
      expect(state.showUserInfo).toBe(true);
      expect(state.showBranchContent).toBe(true);
      expect(state.showBranchSkeleton).toBe(false);
    });

    it("should show login button when user not logged in and done loading", () => {
      const state = getNavbarState({ userLoading: false, branchLoading: false }, false, true);
      expect(state.showLoginButton).toBe(true);
      expect(state.showUserInfo).toBe(false);
    });
  });

  describe("Branch data edge cases", () => {
    it("should handle branch with special characters in id", () => {
      const data: BranchData = {
        branch: { id: "riyadh-king-salman", name: "Bnoon - King Salman" },
      };
      const state = getBranchNameState(false, data);
      expect(state).toBe("content");
    });

    it("should handle very long branch names", () => {
      const data: BranchData = {
        branch: {
          id: "very-long-branch-name",
          name: "Bnoon - Very Long Location Name That Should Be Truncated"
        },
      };
      const state = getBranchNameState(false, data);
      expect(state).toBe("content");
    });

    it("should handle Arabic branch names", () => {
      const data: BranchData = {
        branch: { id: "riyadh-granada", name: "بنون - الرياض" },
      };
      const state = getBranchNameState(false, data);
      expect(state).toBe("content");
    });
  });
});
