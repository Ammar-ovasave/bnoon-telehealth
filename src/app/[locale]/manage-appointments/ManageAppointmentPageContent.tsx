"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useMemo, useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import useNearestUpcomingAppointment from "@/hooks/useNearestUpcomingAppointment";
import AppointmentCard from "./_components/AppointmentCard";
import ClinicBranchSelect from "@/components/ClinicBranchSelect";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";
import AppointmentCardSkeleton from "./_components/AppointmentCardSkeleton";

export default function ManageAppointmentPageContent() {
  const t = useTranslations("ManageAppointmentsPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data, isLoading } = useCurrentUserAppointments();
  const { data: currentBranchData, isLoading: isLoadingBranch } = useCurrentBranch();
  const { handleSwitchBranch, loading: isSwitchingBranch } = useSwitchBranch();
  const { appointment: nearestAppointment, isLoading: isLoadingNearestAppointment } = useNearestUpcomingAppointment();
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const isAutoSwitching = useRef(false);
  const highlightedAppointmentRef = useRef<HTMLDivElement>(null);
  const [appointmentNotFound, setAppointmentNotFound] = useState(false);

  // Get URL parameters (for deep linking from notifications)
  const branchFromUrl = searchParams.get("branch");
  const appointmentIdFromUrl = searchParams.get("appointmentId");

  // Validate branch from URL - must exist and not be "coming soon"
  const validBranchFromUrl = useMemo((): ClinicBranchID | null => {
    if (!branchFromUrl) return null;
    const clinic = clinicLocations.find((c) => c.id === branchFromUrl);
    if (!clinic || clinic.isCommingSoon) return null;
    return clinic.id as ClinicBranchID;
  }, [branchFromUrl]);

  // Get first available branch (non-coming-soon) as fallback
  const firstAvailableBranch = useMemo((): ClinicBranchID => {
    const availableBranch = clinicLocations.find((c) => !c.isCommingSoon);
    return (availableBranch?.id ?? "riyadh-granada") as ClinicBranchID;
  }, []);

  // Determine target branch with priority:
  // 1. Branch from URL (deep linking)
  // 2. Nearest upcoming appointment's branch from Firestore
  // 3. First available branch in dropdown
  const targetBranchId = useMemo((): ClinicBranchID | null => {
    // Priority 1: Branch from URL (for deep linking)
    if (validBranchFromUrl) return validBranchFromUrl;

    // Priority 2: Nearest upcoming appointment's branch
    if (nearestAppointment?.branchId) {
      const clinic = clinicLocations.find((c) => c.id === nearestAppointment.branchId);
      if (clinic && !clinic.isCommingSoon) {
        return nearestAppointment.branchId as ClinicBranchID;
      }
    }

    // Priority 3: First available branch (if no branch currently selected)
    if (!currentBranchData?.branch?.id) {
      return firstAvailableBranch;
    }

    return null;
  }, [validBranchFromUrl, nearestAppointment, currentBranchData?.branch?.id, firstAvailableBranch]);

  // Determine if we need to auto-switch
  const needsAutoSwitch = useMemo(() => {
    // Still loading initial data
    if (isLoadingBranch || isLoadingNearestAppointment) return false;
    // No target branch determined
    if (!targetBranchId) return false;
    // Already on the target branch
    if (currentBranchData?.branch?.id === targetBranchId) return false;
    // Haven't switched yet this session
    return !hasAutoSwitched;
  }, [isLoadingBranch, isLoadingNearestAppointment, targetBranchId, currentBranchData?.branch?.id, hasAutoSwitched]);

  // Perform auto-switch to target branch
  const performAutoSwitch = useCallback(async () => {
    if (!targetBranchId || hasAutoSwitched || isAutoSwitching.current) return;

    setHasAutoSwitched(true);
    isAutoSwitching.current = true;

    await handleSwitchBranch({ payload: { branchId: targetBranchId } });

    isAutoSwitching.current = false;
  }, [targetBranchId, handleSwitchBranch, hasAutoSwitched]);

  // Auto-switch to target branch on first load
  useEffect(() => {
    if (needsAutoSwitch) {
      performAutoSwitch();
    }
  }, [needsAutoSwitch, performAutoSwitch]);

  // Show loading while auto-switching or switching branches
  const isInitializing = isLoadingBranch || isLoadingNearestAppointment || needsAutoSwitch || isSwitchingBranch;

  // Check if highlighted appointment exists and scroll to it
  useEffect(() => {
    if (!isLoading && !isInitializing && appointmentIdFromUrl && data) {
      const found = data.some((apt) => String(apt.id) === appointmentIdFromUrl);
      setAppointmentNotFound(!found);

      // Scroll to highlighted appointment after a short delay
      if (found && highlightedAppointmentRef.current) {
        setTimeout(() => {
          highlightedAppointmentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    }
  }, [isLoading, isInitializing, appointmentIdFromUrl, data]);

  const currentUserAppointmentsData = useMemo(
    () =>
      data?.filter((appointment) => {
        return appointment.status?.name?.toLocaleLowerCase() !== "cancelled";
      }),
    [data]
  );

  // Build book appointment URL with current branch
  const bookAppointmentUrl = useMemo(() => {
    const currentBranchId = currentBranchData?.branch?.id;
    if (currentBranchId) {
      return `/interest?selectedClinicLocation=${currentBranchId}`;
    }
    return "/";
  }, [currentBranchData?.branch?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-bnoon-navy dark:text-white">{t("title")}</h1>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300 text-base leading-relaxed">{t("description")}</p>
        </div>

        {/* Branch Selector */}
        <div>
          <ClinicBranchSelect className="mb-6" isSwitching={isSwitchingBranch} />
        </div>

        {/* Book Appointment Button - Always visible */}
        <div className="mb-8">
          <Link href={bookAppointmentUrl}>
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              {t("buttons.bookAppointment")}
            </Button>
          </Link>
        </div>

        {/* Appointment Not Found Message */}
        {appointmentNotFound && appointmentIdFromUrl && !isInitializing && !isLoading && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {t("appointmentNotFound.title")}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t("appointmentNotFound.description")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {isInitializing || isLoading ? (
            // Skeleton loading state
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : (currentUserAppointmentsData?.length ?? 0) === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-bnoon-navy dark:text-white">{t("noAppointmentsFound.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t("noAppointmentsFound.description")}</p>
              </div>
            </div>
          ) : (
            currentUserAppointmentsData?.map((appointment) => {
              const isHighlighted = appointmentIdFromUrl === String(appointment.id);
              return (
                <div
                  key={appointment.id}
                  ref={isHighlighted ? highlightedAppointmentRef : undefined}
                >
                  <AppointmentCard appointment={appointment} isHighlighted={isHighlighted} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
