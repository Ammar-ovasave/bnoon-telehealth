"use client";
import { FC, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import APIServiceCard from "@/components/APIServiceCard";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export const PageContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedClinicLocationId = searchParams.get("selectedClinicLocation");
  const { isLoading, services, error } = useFertiSmartAPIServices(selectedClinicLocationId ?? undefined);
  const t = useTranslations("ServicesPage");
  const locale = useLocale();

  // Sort services by displayOrder and filter active ones
  const sortedServices = useMemo(() => {
    if (!services) return [];
    return services
      .filter((s) => s.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [services]);

  const row1Services = sortedServices.slice(0, 3);
  const row2Services = sortedServices.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-60 h-60 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl pb-24">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bnoon-navy dark:text-white mb-4 leading-tight">
            {t("title")}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center min-h-[40vh] gap-4">
            <div className="w-16 h-16 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center">
              <Spinner className="w-8 h-8 text-bnoon-teal" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {locale === "ar" ? "جاري تحميل الخدمات..." : "Loading services..."}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">
              {locale === "ar"
                ? "حدث خطأ في تحميل الخدمات. يرجى المحاولة مرة أخرى."
                : "Failed to load services. Please try again."}
            </p>
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              {locale === "ar"
                ? "لا توجد خدمات متاحة حالياً لهذا الفرع."
                : "No services available for this branch at the moment."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 md:gap-6">
            {/* Row 1: First 3 services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
              {row1Services.map((service) => (
                <APIServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Row 2: Remaining services centered with same width as row 1 */}
            {row2Services.length > 0 && (
              <div className="flex flex-wrap justify-center gap-5 md:gap-6">
                {row2Services.map((service) => (
                  <div key={service.id} className="w-full sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-1rem)]">
                    <APIServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="w-full flex justify-center mt-12">
          <Button variant="outline" className="max-w-md w-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => router.push(`/${locale}`)}>
            <ChevronLeft className="rtl:scale-x-[-1]" />
            {t("buttons.backToClinicSelection")}
          </Button>
        </div>
      </div>
    </div>
  );
};
