"use client";
import { Suspense, useMemo } from "react";
import BranchCard from "@/components/BranchCard";
import LoadingPage from "./loading";
import { useLocale } from "next-intl";
import useFertiSmartBranches from "@/hooks/useFertiSmartBranches";
import { BranchDto } from "@/services/bnoon-api/types";

export default function Home() {
  const locale = useLocale();
  const { branches, isLoading, error } = useFertiSmartBranches();

  // Group branches by location (city) for the city labels
  const branchesByCity = useMemo(() => {
    if (!branches) return {};
    return branches.reduce(
      (acc, branch) => {
        // Extract city from location (e.g., "Granada District, Riyadh" -> "Riyadh")
        const city = branch.location.split(",").pop()?.trim() || branch.location;
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(branch);
        return acc;
      },
      {} as Record<string, BranchDto[]>
    );
  }, [branches]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Booking Interface - Clinic Selection */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-xl md:text-2xl font-bold text-bnoon-navy dark:text-white mb-3">
              {locale === "ar"
                ? "اختر أقرب مركز بنون إليك"
                : "Select Your Nearest Bnoon Clinic"}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {locale === "ar"
                ? "بنون تقرّب الرعاية المتقدمة إليك — بأطباء موثوقين، وتقنيات مبتكرة، والتزام بالرعاية الشخصية والمتعاطفة؛ مكرسين لوضع معايير جديدة في رعاية الخصوبة وصحة المرأة."
                : "Bnoon brings advanced care closer to you — with trusted doctors, innovative technologies, and a commitment to compassionate, personalized care; dedicated to setting new benchmarks in fertility and women's health care."}
            </p>
          </div>

          {/* Branches Grid - Primary Content */}
          <Suspense fallback={<LoadingPage />}>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full aspect-[4/5] rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">
                  {locale === "ar"
                    ? "حدث خطأ في تحميل الفروع. يرجى المحاولة مرة أخرى."
                    : "Failed to load branches. Please try again."}
                </p>
              </div>
            ) : branches && branches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {branches.map((branch, index) => (
                  <div key={branch.branchId}>
                    <BranchCard branch={branch} priority={index === 0} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  {locale === "ar"
                    ? "لا توجد فروع متاحة حالياً."
                    : "No branches available at the moment."}
                </p>
              </div>
            )}
          </Suspense>

          {/* City Labels */}
          {branches && branches.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {Object.entries(branchesByCity).map(([city, cityBranches]) => (
                <div
                  key={city}
                  className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-1.5 h-1.5 bg-bnoon-navy rounded-full" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {city}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({cityBranches.length})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
