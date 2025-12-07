"use client";
import { services } from "@/models/ServiceModel";
import { FC } from "react";
import { Spinner } from "@/components/ui/spinner";
import ServiceCard from "@/components/ServiceCard";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export const PageContent: FC = () => {
  const { isLoading, data: servicesData } = useFertiSmartAPIServices();
  const router = useRouter();
  const t = useTranslations("ServicesPage");

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
        </div>
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {services
              .filter((service) => {
                return servicesData?.some((s) => s.name?.toLocaleLowerCase().includes(service.title.toLocaleLowerCase()));
              })
              .map((service) => (
                <div key={service.id} className="w-full sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)]">
                  <ServiceCard service={service} />
                </div>
              ))}
          </div>
        )}
        <div className="w-full flex justify-center mt-12">
          <Button variant={"outline"} className="max-w-md w-full" onClick={() => router.back()}>
            <ChevronLeft className="rtl:scale-x-[-1]" />
            {t("buttons.backToClinicSelection")}
          </Button>
        </div>
      </div>
    </div>
  );
};
