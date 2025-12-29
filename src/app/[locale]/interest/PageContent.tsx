"use client";
import { services } from "@/models/ServiceModel";
import { FC } from "react";
import { Spinner } from "@/components/ui/spinner";
import ServiceCard from "@/components/ServiceCard";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { doctors } from "@/models/DoctorModel";

export const PageContent: FC = () => {
  const { isLoading, data: servicesData } = useFertiSmartAPIServices();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedClinicLocationId = searchParams.get("selectedClinicLocation");
  const t = useTranslations("ServicesPage");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light to-white">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-bnoon-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl pb-24">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-bnoon-teal/10 text-bnoon-teal px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>{locale === "ar" ? "خدماتنا" : "Our Services"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bnoon-navy mb-4 leading-tight">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center min-h-[40vh] gap-4">
            <div className="w-16 h-16 bg-bnoon-teal/10 rounded-full flex items-center justify-center">
              <Spinner className="w-8 h-8 text-bnoon-teal" />
            </div>
            <p className="text-gray-500 text-sm">
              {locale === "ar" ? "جاري تحميل الخدمات..." : "Loading services..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 md:gap-6 animate-fade-in-up animation-delay-200">
            {services
              .filter((service) => {
                return servicesData?.some((s) => s.name?.toLocaleLowerCase().includes(service.title.toLocaleLowerCase()));
              })
              .filter((service) => {
                const hasDoctors = doctors.some((doc) => {
                  return doc.services.some((s) => s === service.id) && doc.branchId === selectedClinicLocationId;
                });
                return hasDoctors;
              })
              .map((service, index) => (
                <div
                  key={service.id}
                  className={`w-full sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] animate-fade-in-up animation-delay-${(index % 6) * 100}`}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
          </div>
        )}

        {/* Back Button */}
        <div className="w-full flex justify-center mt-12 animate-fade-in-up animation-delay-300">
          <Button variant="outline" className="max-w-md w-full" onClick={() => router.back()}>
            <ChevronLeft className="rtl:scale-x-[-1]" />
            {t("buttons.backToClinicSelection")}
          </Button>
        </div>
      </div>
    </div>
  );
};
