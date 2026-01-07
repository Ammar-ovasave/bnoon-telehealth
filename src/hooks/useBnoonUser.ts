"use client";

import useSWR from "swr";
import { BnoonUserResponse } from "@/services/client";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }
    return res.json();
  });

/**
 * Hook to get the current Bnoon user profile
 * Uses SWR for caching and revalidation
 */
export default function useBnoonUser() {
  const { data, error, isLoading, mutate } = useSWR<BnoonUserResponse>(
    "/api/users/me",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Compute full name
  const fullName = data
    ? [data.firstName, data.middleName, data.lastName]
        .filter((n) => n && n !== "-")
        .join(" ")
        .trim() || null
    : null;

  // Check if profile is complete for booking
  const isProfileComplete = Boolean(
    data?.firstName &&
      data.firstName !== "-" &&
      data?.lastName &&
      data.lastName !== "-" &&
      data?.emailAddress &&
      data?.sex !== undefined
  );

  // Check if user is authenticated
  const isAuthenticated = !error && !isLoading && !!data?.id;

  return {
    user: data,
    error,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    fullName,
    mutate,
  };
}
