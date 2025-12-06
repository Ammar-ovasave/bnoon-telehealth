"use client";
import { Suspense, useMemo } from "react";
import { groupClinicsByCity, ClinicLocation } from "@/models/ClinicModel";
import ClinicCard from "@/components/ClinicCard";
import LoadingPage from "./loading";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");
  const clinicsByCity = useMemo(() => groupClinicsByCity(), []);

  const getTranslatedCity = (city: string) => {
    return t(`cities.${city}`) || city;
  };

  const clinicsWithCitySeparators = useMemo(() => {
    const result: Array<{ type: "clinic" | "separator"; data?: ClinicLocation; city?: string }> = [];
    const cityEntries = Object.entries(clinicsByCity);
    cityEntries.forEach(([city, clinics], cityIndex) => {
      if (cityIndex > 0) {
        result.push({ type: "separator", city });
      }
      clinics.forEach((clinic) => {
        result.push({ type: "clinic", data: clinic, city });
      });
    });
    return result;
  }, [clinicsByCity]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t("description")}</p>
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-6">
          {Object.entries(clinicsByCity).map(([city, clinics]) => (
            <div key={city} className="space-y-4">
              {/* City Header */}
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{getTranslatedCity(city)}</h2>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{clinics.length}</span>
              </div>
              {/* Clinics List */}
              <Suspense fallback={<LoadingPage />}>
                <div className="space-y-4">
                  {clinics.map((clinic) => (
                    <ClinicCard key={clinic.id} clinic={clinic} />
                  ))}
                </div>
              </Suspense>
            </div>
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
          <Suspense fallback={<LoadingPage />}>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {clinicsWithCitySeparators.map((item, index) => {
                if (item.type === "separator") {
                  return (
                    <div
                      key={`separator-${item.city}-${index}`}
                      className="flex-shrink-0 flex flex-col items-center justify-center px-4 h-80"
                    >
                      <div className="w-px h-3/4 bg-gray-300 dark:bg-gray-700"></div>
                      {/* <div className="mt-3 px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-full">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {item.city}
                        </span>
                      </div> */}
                      <div className="w-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                  );
                }
                if (item.type === "clinic" && item.data) {
                  return (
                    <div key={item.data.id} className="flex-shrink-0 w-64">
                      <ClinicCard clinic={item.data} />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
