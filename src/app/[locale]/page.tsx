"use client";
import { Suspense, useMemo } from "react";
import { groupClinicsByCity } from "@/models/ClinicModel";
import ClinicCard from "@/components/ClinicCard";
import LoadingPage from "./loading";
import { useTranslations, useLocale } from "next-intl";
import { MapPin } from "lucide-react";

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
          {/* Action Header */}
          <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
            <MapPin className="w-5 h-5 text-bnoon-navy dark:text-white" />
            <h1 className="text-lg md:text-xl font-semibold text-bnoon-navy dark:text-white">
              {locale === "ar" ? "اختر المركز" : "Select a Center"}
            </h1>
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
                className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
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
