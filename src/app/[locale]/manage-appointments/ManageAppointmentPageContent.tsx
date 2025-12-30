"use client";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations, useLocale } from "next-intl";
import { useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import useUserPreferences from "@/hooks/useUserPreferences";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import AppointmentCard from "./_components/AppointmentCard";
import ClinicBranchSelect from "@/components/ClinicBranchSelect";
import Image from "next/image";

export default function ManageAppointmentPageContent() {
  const t = useTranslations("ManageAppointmentsPage");
  const locale = useLocale();
  const { data, isLoading } = useCurrentUserAppointments();
  const { defaultBranchId, isLoading: isLoadingPreferences } = useUserPreferences();
  const { data: currentBranchData, isLoading: isLoadingBranch } = useCurrentBranch();
  const { handleSwitchBranch, loading: isSwitchingBranch } = useSwitchBranch();
  const hasAutoSwitched = useRef(false);
  const isAutoSwitching = useRef(false);

  // Determine if we need to auto-switch to default branch
  const needsAutoSwitch = useMemo(() => {
    // Still loading initial data
    if (isLoadingPreferences || isLoadingBranch) return false;
    // No default branch configured
    if (!defaultBranchId) return false;
    // Already on the default branch
    if (currentBranchData?.branch?.id === defaultBranchId) return false;
    // Haven't switched yet this session
    return !hasAutoSwitched.current;
  }, [isLoadingPreferences, isLoadingBranch, defaultBranchId, currentBranchData?.branch?.id]);

  // Perform auto-switch to default branch
  const performAutoSwitch = useCallback(async () => {
    if (!defaultBranchId || hasAutoSwitched.current || isAutoSwitching.current) return;

    hasAutoSwitched.current = true;
    isAutoSwitching.current = true;

    await handleSwitchBranch({ payload: { branchId: defaultBranchId } });

    isAutoSwitching.current = false;
  }, [defaultBranchId, handleSwitchBranch]);

  // Auto-switch to default branch on first load
  useEffect(() => {
    if (needsAutoSwitch) {
      performAutoSwitch();
    }
  }, [needsAutoSwitch, performAutoSwitch]);

  // Show loading while auto-switching or switching branches
  const isInitializing = isLoadingPreferences || isLoadingBranch || needsAutoSwitch || isSwitchingBranch;

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
              return (
                <div
                  key={appointment.id}
                  className={`animate-fade-in-up animation-delay-${(index % 5) * 100}`}
                >
                  <AppointmentCard appointment={appointment} />
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
