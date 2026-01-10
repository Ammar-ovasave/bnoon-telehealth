"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useMemo, useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import useNearestUpcomingAppointment from "@/hooks/useNearestUpcomingAppointment";
import AppointmentCard from "./_components/AppointmentCard";
import ClinicBranchSelect from "@/components/ClinicBranchSelect";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";
import AppointmentCardSkeleton from "./_components/AppointmentCardSkeleton";

export default function ManageAppointmentPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const t = useTranslations("ManageAppointmentsPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { appointment: nearestAppointment, isLoading: isLoadingNearestAppointment } = useNearestUpcomingAppointment();
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
  // 2. Nearest upcoming appointment's branch
  // 3. First available branch in dropdown
  const selectedBranchId = useMemo((): ClinicBranchID => {
    // Priority 1: Branch from URL (for deep linking)
    if (validBranchFromUrl) return validBranchFromUrl;

    // Priority 2: Nearest upcoming appointment's branch
    if (nearestAppointment?.branchId) {
      const clinic = clinicLocations.find((c) => c.id === nearestAppointment.branchId);
      if (clinic && !clinic.isCommingSoon) {
        return nearestAppointment.branchId as ClinicBranchID;
      }
    }

    // Priority 3: First available branch
    return firstAvailableBranch;
  }, [validBranchFromUrl, nearestAppointment, firstAvailableBranch]);

  // Fetch appointments based on selected branch (from URL, not cookie)
  const { data, isLoading } = useCurrentUserAppointments({ branchId: selectedBranchId });

  // Show loading while initializing
  const isInitializing = isLoadingUser || isLoadingNearestAppointment;

  // Check if highlighted appointment exists and scroll to it
  useEffect(() => {
    if (!isLoading && !isInitializing && appointmentIdFromUrl && data) {
      const found = data.some((apt) => String(apt.appointmentId) === appointmentIdFromUrl);
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

  // Show all appointments - action buttons are handled by card components based on status
  const currentUserAppointmentsData = data;

  // Build book appointment URL with selected branch and locale
  const bookAppointmentUrl = useMemo(() => {
    return `/${locale}/interest?selectedClinicLocation=${selectedBranchId}`;
  }, [selectedBranchId, locale]);

  // Update URL query param when branch changes
  const handleBranchChange = useCallback((branchId: ClinicBranchID) => {
    // Preserve appointmentId if present, update branch
    const newParams = new URLSearchParams();
    newParams.set("branch", branchId);
    if (appointmentIdFromUrl) {
      newParams.set("appointmentId", appointmentIdFromUrl);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  }, [router, pathname, appointmentIdFromUrl]);

  // Redirect to home if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.replace("/");
    }
  }, [isLoadingUser, currentUser, router]);

  // Show full-page loading while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          {locale === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!currentUser) {
    return null;
  }

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
          <ClinicBranchSelect
            className="mb-6"
            value={selectedBranchId}
            onValueChange={handleBranchChange}
          />
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
              const isHighlighted = appointmentIdFromUrl === String(appointment.appointmentId);
              return (
                <div
                  key={appointment.appointmentId}
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
