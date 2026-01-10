"use client";

import { CurrentUserType } from "@/models/CurrentUserType";
import { useMemo, useCallback } from "react";
import { useAuth, AuthUser } from "@/providers/AuthProvider";

/**
 * Hook to get the current authenticated user
 *
 * This is a thin wrapper around useAuth() for backward compatibility.
 * Uses the global AuthProvider context for shared state across all components.
 *
 * Behavior:
 * - Returns user data from global AuthProvider
 * - Calling mutate() will re-validate the token globally
 * - Calling mutate(userData) will set user data directly
 * - All components using this hook share the same state
 */
export default function useCurrentUser() {
  const { user, isLoading, error, fullName, revalidate, setUser } = useAuth();

  // Map AuthUser to CurrentUserType for backward compatibility
  const data: CurrentUserType | null = useMemo(() => {
    if (!user) return null;
    return {
      userId: user.userId,
      phone: user.phone,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      sex: user.sex,
      iat: user.iat,
      exp: user.exp,
    };
  }, [user]);

  // Mutate function that can either revalidate or set user data directly
  const mutate = useCallback(
    (userData?: CurrentUserType | null) => {
      if (userData) {
        // Set user data directly
        const authUser: AuthUser = {
          userId: userData.userId,
          phone: userData.phone,
          firstName: userData.firstName,
          middleName: userData.middleName,
          lastName: userData.lastName,
          emailAddress: userData.emailAddress,
          sex: userData.sex,
          iat: userData.iat,
          exp: userData.exp,
        };
        setUser(authUser);
      } else {
        // Revalidate token
        revalidate();
      }
    },
    [setUser, revalidate]
  );

  return {
    data,
    error,
    isLoading,
    fullName,
    mutate,
  };
}
