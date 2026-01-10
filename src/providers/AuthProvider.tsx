"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface AuthUser {
  userId: string;
  phone: string;
  firstName: string;
  middleName: string;
  lastName: string;
  emailAddress: string;
  sex?: 0 | 1 | null;
  iat?: number;
  exp?: number;
}

interface AuthMeResponse {
  isAuthenticated: boolean;
  reason?: string;
  user: AuthUser | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  fullName: string;
  /** Re-validate the token by calling /api/auth/me */
  revalidate: () => void;
  /** Set user data directly (e.g., after OTP verification) */
  setUser: (user: AuthUser) => void;
  /** Clear auth state (e.g., after logout) */
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Global authentication state management
 *
 * Validates the auth-token cookie via /api/auth/me endpoint.
 * Uses server-side route because auth-token is httpOnly (can't be read from JS).
 * Shares the auth state across all components to prevent multiple validation calls.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const validateToken = useCallback(async () => {
    try {
      // Call server-side endpoint that can read httpOnly cookie
      const response = await fetch("/api/auth/me");
      const result: AuthMeResponse = await response.json();

      if (!result.isAuthenticated || !result.user) {
        setUser(null);
        setIsLoading(false);

        // If token was invalid/expired, redirect to home (unless already there)
        if (result.reason === "expired" || result.reason === "invalid") {
          const isHomePage = pathname.match(/^\/(en|ar)?$/);
          if (!isHomePage) {
            router.replace("/");
          }
        }
        return;
      }

      // Token is valid - set user data
      setUser(result.user);
      setIsLoading(false);
    } catch (err) {
      console.error("[AuthProvider] Failed to validate token:", err);
      setError(err instanceof Error ? err : new Error("Failed to validate token"));
      setUser(null);
      setIsLoading(false);
    }
  }, [pathname, router]);

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const fullName = useMemo(() => {
    let name = "";
    if (user?.firstName && user.firstName !== "-") {
      name += ` ${user.firstName}`;
    }
    if (user?.middleName && user.middleName !== "-") {
      name += ` ${user.middleName}`;
    }
    if (user?.lastName && user.lastName !== "-") {
      name += ` ${user.lastName}`;
    }
    return name.trim();
  }, [user?.firstName, user?.lastName, user?.middleName]);

  const revalidate = useCallback(() => {
    setIsLoading(true);
    validateToken();
  }, [validateToken]);

  const setUserDirectly = useCallback((userData: AuthUser) => {
    setUser(userData);
    setIsLoading(false);
    setError(null);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      fullName,
      revalidate,
      setUser: setUserDirectly,
      clearAuth,
    }),
    [user, isLoading, error, fullName, revalidate, setUserDirectly, clearAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access global auth state
 *
 * Must be used within an AuthProvider.
 * Returns:
 * - user: The authenticated user data or null
 * - isLoading: True while validating token
 * - isAuthenticated: True if user is logged in
 * - error: Any error that occurred during validation
 * - fullName: Formatted full name of the user
 * - revalidate: Function to re-validate the token
 * - clearAuth: Function to clear auth state (logout)
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
