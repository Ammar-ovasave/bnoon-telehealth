import { useMemo, useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { clinicLocations } from "@/models/ClinicModel";

/**
 * Read a cookie value by name
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Subscribe to cookie changes (for useSyncExternalStore)
 * Note: Cookies don't have a native change event, so we trigger re-render
 * when the component mounts or when mutate is called
 */
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

function getSnapshot(): string | undefined {
  return getCookie("branchId");
}

function getServerSnapshot(): string | undefined {
  return undefined; // Cookie not available during SSR
}

/**
 * Hook to get the current branch from cookie + static data
 * No API call needed - reads directly from cookie and static clinicLocations
 */
export default function useCurrentBranch() {
  // Track hydration state - we need to wait for client-side cookie access
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const branchId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const branch = useMemo(() => {
    if (!branchId) return undefined;
    return clinicLocations.find((b) => b.id === branchId);
  }, [branchId]);

  // Mutate function to trigger re-render after branch switch
  const mutate = useCallback(() => {
    notifyListeners();
  }, []);

  return {
    data: branch ? { branch } : undefined,
    error: undefined,
    isLoading: !isHydrated, // Loading until hydration completes
    mutate,
  };
}
