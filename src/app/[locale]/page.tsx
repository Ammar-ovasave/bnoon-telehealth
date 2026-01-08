"use client";
import { Suspense, useMemo } from "react";
import { groupClinicsByCity } from "@/models/ClinicModel";
import ClinicCard from "@/components/ClinicCard";
import LoadingPage from "./loading";
import { useTranslations, useLocale } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const clinicsByCity = useMemo(() => groupClinicsByCity(), []);

  const getTranslatedCity = (city: string) => {
    return t(`cities.${city}`) || city;
  };

  // Flatten all clinics into a single array
  const allClinics = useMemo(() => {
    return Object.values(clinicsByCity).flat();
  }, [clinicsByCity]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Booking Interface - Clinic Selection */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold text-bnoon-gray dark:text-white mb-3">
              {locale === "ar"
                ? "اختر أقرب مركز بنون إليك"
                : "Select Your Nearest Bnoon Clinic"}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {locale === "ar"
                ? "بنون تقرّب الرعاية المتقدمة إليك — بأطباء موثوقين، وتقنيات مبتكرة، والتزام بالرعاية الشخصية والمتعاطفة؛ مكرسين لوضع معايير جديدة في رعاية الخصوبة وصحة المرأة."
                : "Bnoon brings advanced care closer to you — with trusted doctors, innovative technologies, and a commitment to compassionate, personalized care; dedicated to setting new benchmarks in fertility and women's health care."}
            </p>
          </div>

          {/* Clinics Grid - Primary Content */}
          <Suspense fallback={<LoadingPage />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {allClinics.map((clinic, index) => (
                <div
                  key={clinic.id}
                  className={`animate-fade-in-up animation-delay-${(index % 4) * 100}`}
                >
                  <ClinicCard clinic={clinic} />
                </div>
              ))}
            </div>
          </Suspense>

          {/* City Labels */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {Object.entries(clinicsByCity).map(([city, clinics]) => (
              <div
                key={city}
                className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-base shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="w-1.5 h-1.5 bg-bnoon-navy rounded-full" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{getTranslatedCity(city)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({clinics.length})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
