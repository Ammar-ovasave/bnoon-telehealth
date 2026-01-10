"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Filter, Building2, Video, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AvailabilityFilter } from "@/models/VisitTypeModel";
import DoctorCard from "@/components/DoctorCard";
import useDoctorsByService from "@/hooks/useDoctorsByService";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import BranchGuard from "@/components/BranchGuard";
import { FEATURE_FLAGS } from "@/constants";
import { getServiceSlug } from "@/lib/serviceMapping";
import type { BranchId } from "@/services/bnoon-api/types";

export default function DoctorsListPage() {
  const searchParams = useSearchParams();
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [loadingDoctor, setLoadingDoctor] = useState<string | null>(null);
  // Default to "clinic" if virtual appointments are disabled
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter | undefined>(
    FEATURE_FLAGS.VIRTUAL_APPOINTMENTS_ENABLED ? undefined : "clinic"
  );
  const router = useRouter();
  const t = useTranslations("DoctorsPage");
  const locale = useLocale();

  // Get branch and service from URL params
  const branchId = searchParams.get("selectedClinicLocation") as BranchId | null;
  const serviceCode = searchParams.get("selectedServiceCode");
  // Convert service code (API001) to slug (having-child) for bnoon-api
  const serviceSlug = serviceCode ? getServiceSlug(serviceCode) : null;

  // Fetch doctors from bnoon-api
  const { doctors: apiDoctors, isLoading, error } = useDoctorsByService({
    branchId,
    serviceId: serviceSlug,
  });

  // Sync URL with default "clinic" selection when virtual appointments are disabled
  // Only run after searchParams is populated (check for required param)
  useEffect(() => {
    // Wait until searchParams has the required clinic location (ensures hydration is complete)
    const hasClinicLocation = searchParams.get("selectedClinicLocation");
    if (!hasClinicLocation) return;

    if (!FEATURE_FLAGS.VIRTUAL_APPOINTMENTS_ENABLED && !searchParams.get("selectedVisitType")) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("selectedVisitType", "clinic");
      router.replace(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const handleSetAvailabilityFilter = (value: AvailabilityFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("selectedVisitType", value);
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
    setAvailabilityFilter(value);
  };

  const handleBack = () => {
    // Explicitly navigate to interest page with current locale and preserved params
    const backParams = new URLSearchParams();
    const selectedClinicLocation = searchParams.get("selectedClinicLocation");
    if (selectedClinicLocation) {
      backParams.set("selectedClinicLocation", selectedClinicLocation);
    }
    router.push(`/${locale}/interest?${backParams.toString()}`);
  };

  const handleDoctorChange = (doctorId: string) => {
    if (loadingDoctor) return; // Prevent double clicks
    setLoadingDoctor(doctorId);
    setSelectedDoctor(doctorId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedDoctor", doctorId);
    router.push(`/${locale}/select-date-and-time?${params.toString()}`);
  };

  // Filter doctors by availability type
  const doctors = useMemo(() => {
    if (!apiDoctors) return [];

    // Sort by displayOrder
    const sorted = [...apiDoctors].sort((a, b) => a.displayOrder - b.displayOrder);

    // Filter by visit type
    if (!availabilityFilter) return sorted;
    if (availabilityFilter === "clinic") return sorted; // All doctors support clinic
    if (availabilityFilter === "virtual") return sorted.filter((d) => d.supportsVirtual);

    return sorted;
  }, [apiDoctors, availabilityFilter]);

  // Count available doctors for each type
  const clinicDoctorsCount = apiDoctors?.length ?? 0; // All doctors support clinic
  const virtualDoctorsCount = apiDoctors?.filter((d) => d.supportsVirtual).length ?? 0;

  return (
    <BranchGuard>
      <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center">
              <Spinner className="w-8 h-8 text-bnoon-teal" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {locale === "ar" ? "جاري تحميل الأطباء..." : "Loading doctors..."}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
            <p className="text-red-500">
              {locale === "ar"
                ? "حدث خطأ في تحميل الأطباء. يرجى المحاولة مرة أخرى."
                : "Failed to load doctors. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              {locale === "ar" ? "إعادة المحاولة" : "Retry"}
            </Button>
          </div>
        ) : (
          <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl pb-24">
            {/* Header */}
            <div className="text-center mb-10 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bnoon-navy dark:text-white mb-4 leading-tight">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {t("description")}
              </p>
            </div>

            {/* Visit Type Selector - Compact Pills */}
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-bnoon-navy dark:text-white mb-1">{t("visitType.title")}</h2>
                    <p className="text-base text-gray-500 dark:text-gray-400">{t("visitType.description")}</p>
                  </div>

                  {/* Visit Type Pills */}
                  <div className="flex gap-3">
                    {/* Clinic Visit Pill */}
                    <button
                      onClick={() => handleSetAvailabilityFilter("clinic")}
                      disabled={clinicDoctorsCount === 0}
                      className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 cursor-pointer",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bnoon-teal/50",
                        availabilityFilter === "clinic"
                          ? "bg-bnoon-teal text-white border-bnoon-teal shadow-lg shadow-bnoon-teal/30"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 shadow-sm hover:border-bnoon-teal hover:bg-bnoon-teal/5 dark:hover:bg-bnoon-teal/10 hover:shadow-md",
                        clinicDoctorsCount === 0 && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100"
                      )}
                    >
                      {availabilityFilter === "clinic" ? (
                        <Check className="w-4 h-4 scale-[2.5] transform" />
                      ) : (
                        <Building2 className="w-4 h-4 scale-[2.5] transform" />
                      )}
                      <span>{t("visitType.clinic.title")}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-bold",
                          availabilityFilter === "clinic" ? "bg-white/20" : "bg-bnoon-teal/10 text-bnoon-teal"
                        )}
                      >
                        {clinicDoctorsCount}
                      </span>
                    </button>

                    {/* Virtual Visit Pill - Always shown but disabled with "Coming Soon" */}
                    <div className="relative">
                      <button
                        disabled={true}
                        className={cn(
                          "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2",
                          "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700",
                          "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <Video className="w-4 h-4 scale-[2.5] transform" />
                        <span>{t("visitType.virtual.title")}</span>
                      </button>
                      {/* Coming Soon Badge */}
                      <span className="absolute -top-2 ltr:-right-2 rtl:-left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        {t("visitType.virtual.comingSoon")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hint message when no type selected */}
                {!availabilityFilter && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-[#800020] dark:text-amber-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#800020] rounded-full animate-pulse" />
                      {locale === "ar"
                        ? "يرجى اختيار نوع الزيارة لتتمكن من حجز موعد مع الطبيب"
                        : "Please select a visit type to book an appointment with a doctor"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctors Grid - Always Visible */}
            <div>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" layout>
                <AnimatePresence mode="popLayout">
                  {doctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        y: -20,
                        transition: { duration: 0.2, ease: "easeOut" },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        opacity: { duration: 0.2 },
                      }}
                    >
                      <DoctorCard
                        doctor={doctor}
                        selectedDoctor={selectedDoctor}
                        setSelectedDoctor={handleDoctorChange}
                        isLoading={loadingDoctor === doctor.id.toString()}
                        disabled={!availabilityFilter}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Empty State */}
              <AnimatePresence>
                {doctors.length === 0 && (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Filter className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-bnoon-navy dark:text-white mb-3">
                        {t("noDoctorsFound.title")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {t("noDoctorsFound.description")}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
              <Button
                onClick={handleBack}
                variant="outline"
                size="lg"
                className="px-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="rtl:scale-x-[-1]" />
                {t("buttons.backToServiceSelection")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </BranchGuard>
  );
}
