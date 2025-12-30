"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, CalendarDays, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations, useLocale } from "next-intl";
import { useMemo, useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import useUserPreferences from "@/hooks/useUserPreferences";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import AppointmentCard from "./_components/AppointmentCard";
import ClinicBranchSelect from "@/components/ClinicBranchSelect";
import Image from "next/image";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";

export default function ManageAppointmentPageContent() {
  const t = useTranslations("ManageAppointmentsPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data, isLoading } = useCurrentUserAppointments();
  const { defaultBranchId, isLoading: isLoadingPreferences } = useUserPreferences();
  const { data: currentBranchData, isLoading: isLoadingBranch } = useCurrentBranch();
  const { handleSwitchBranch, loading: isSwitchingBranch } = useSwitchBranch();
  const hasAutoSwitched = useRef(false);
  const isAutoSwitching = useRef(false);
  const highlightedAppointmentRef = useRef<HTMLDivElement>(null);
  const [appointmentNotFound, setAppointmentNotFound] = useState(false);

  // Get URL parameters
  const branchFromUrl = searchParams.get("branch");
  const appointmentIdFromUrl = searchParams.get("appointmentId");

  // Validate branch from URL - must exist and not be "coming soon"
  const validBranchFromUrl = useMemo((): ClinicBranchID | null => {
    if (!branchFromUrl) return null;
    const clinic = clinicLocations.find((c) => c.id === branchFromUrl);
    if (!clinic || clinic.isCommingSoon) return null;
    return clinic.id as ClinicBranchID;
  }, [branchFromUrl]);

  // Determine target branch: URL param takes priority over default branch
  const targetBranchId = useMemo((): ClinicBranchID | null => {
    // Priority 1: Valid branch from URL
    if (validBranchFromUrl) return validBranchFromUrl;
    // Priority 2: Default branch from user preferences
    if (defaultBranchId) return defaultBranchId;
    // No target branch
    return null;
  }, [validBranchFromUrl, defaultBranchId]);

  // Determine if we need to auto-switch to target branch
  const needsAutoSwitch = useMemo(() => {
    // Still loading initial data
    if (isLoadingPreferences || isLoadingBranch) return false;
    // No target branch configured
    if (!targetBranchId) return false;
    // Already on the target branch
    if (currentBranchData?.branch?.id === targetBranchId) return false;
    // Haven't switched yet this session
    return !hasAutoSwitched.current;
  }, [isLoadingPreferences, isLoadingBranch, targetBranchId, currentBranchData?.branch?.id]);

  // Perform auto-switch to target branch
  const performAutoSwitch = useCallback(async () => {
    if (!targetBranchId || hasAutoSwitched.current || isAutoSwitching.current) return;

    hasAutoSwitched.current = true;
    isAutoSwitching.current = true;

    await handleSwitchBranch({ payload: { branchId: targetBranchId } });

    isAutoSwitching.current = false;
  }, [targetBranchId, handleSwitchBranch]);

  // Auto-switch to target branch on first load
  useEffect(() => {
    if (needsAutoSwitch) {
      performAutoSwitch();
    }
  }, [needsAutoSwitch, performAutoSwitch]);

  // Show loading while auto-switching or switching branches
  const isInitializing = isLoadingPreferences || isLoadingBranch || needsAutoSwitch || isSwitchingBranch;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-bnoon-teal to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-bnoon-teal/20">
              <Image
                src={`/icons/Calender.png`}
                alt="Manage Your Appointment"
                width={100}
                height={100}
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 text-bnoon-teal px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CalendarDays className="w-4 h-4" />
            <span>{locale === "ar" ? "مواعيدي" : "My Appointments"}</span>
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-bnoon-navy dark:text-white">{t("title")}</h1>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300 text-base leading-relaxed">{t("description")}</p>
        </div>

        {/* Branch Selector */}
        <div className="animate-fade-in-up animation-delay-100">
          <ClinicBranchSelect className="mb-8" />
        </div>

        {/* Appointment Not Found Message */}
        {appointmentNotFound && appointmentIdFromUrl && !isInitializing && !isLoading && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-fade-in-up">
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
        <div className="space-y-4 animate-fade-in-up animation-delay-200">
          {isInitializing || isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="w-16 h-16 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center mb-4">
                <Spinner className="w-8 h-8 text-bnoon-teal" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isInitializing
                  ? locale === "ar"
                    ? "جاري التحميل..."
                    : "Loading..."
                  : locale === "ar"
                    ? "جاري تحميل المواعيد..."
                    : "Loading appointments..."}
              </p>
            </div>
          ) : (currentUserAppointmentsData?.length ?? 0) === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-bnoon-navy dark:text-white">{t("noAppointmentsFound.title")}</h3>
                <p className="mb-8 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t("noAppointmentsFound.description")}</p>
                <Link href="/">
                  <Button size="lg" className="w-full">
                    <Plus className="w-4 h-4" />
                    {t("buttons.bookNewAppointment")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            currentUserAppointmentsData?.map((appointment, index) => {
              const isHighlighted = appointmentIdFromUrl === String(appointment.id);
              return (
                <div
                  key={appointment.id}
                  ref={isHighlighted ? highlightedAppointmentRef : undefined}
                  className={`animate-fade-in-up animation-delay-${(index % 5) * 100}`}
                >
                  <AppointmentCard appointment={appointment} isHighlighted={isHighlighted} />
                </div>
              );
            })
          )}
        </div>

        {/* Book New Appointment */}
        {(currentUserAppointmentsData?.length ?? 0) > 0 && (
          <div className="mt-10 text-center animate-fade-in-up animation-delay-300">
            <Link href="/">
              <Button size="lg" className="px-8">
                <Plus className="w-4 h-4" />
                {t("buttons.bookAnotherAppointment")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
