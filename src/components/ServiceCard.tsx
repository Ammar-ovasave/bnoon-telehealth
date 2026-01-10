"use client";
import { Service } from "@/models/ServiceModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: FC<ServiceCardProps> = ({ service }) => {
  const searchParams = useSearchParams();
  const t = useTranslations("ServicesPage");

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("selectedService", service.id);
    return params.toString();
  }, [service.id, searchParams]);

  return (
    <Link href={`/doctors?${newUrlSearchParams.toString()}`}>
      <Card
        className={cn(
          "cursor-pointer relative gap-0 justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden h-full border-0 shadow-md group"
        )}
      >
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bnoon-teal/0 to-cyan-500/0 group-hover:from-bnoon-teal/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />

        <CardHeader className="text-center px-4 py-4 gap-0 relative flex flex-col items-center justify-center">
          {/* Icon Container */}
          <div className="flex justify-center items-center mb-3">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Background Circle */}
              <div className="absolute inset-0 bg-bnoon-teal/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white rounded-2xl shadow-sm" />

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                {service.imageSrc ? (
                  <Image
                    width={service.imageWidth ?? 50}
                    height={service.imageHeight ?? 50}
                    src={service.imageSrc}
                    alt={service.title}
                    className={cn(
                      "h-10 w-10 object-contain transition-all duration-300",
                      service.imageClassName
                    )}
                  />
                ) : (
                  <span className="text-2xl">{service.icon}</span>
                )}
              </div>
            </div>
          </div>

          {/* Title - aligned and bigger */}
          <CardTitle className="text-lg font-bold text-bnoon-gray mb-2 group-hover:text-bnoon-teal transition-colors duration-300 min-h-[3.5rem] flex items-center justify-center">
            {t(`services.${service.id}.title`)}
          </CardTitle>

          {/* Description */}
          <CardDescription className="text-xs text-gray-500 leading-relaxed">
            {t(`services.${service.id}.description`)}
          </CardDescription>

          {/* Arrow Indicator */}
          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-1 text-bnoon-teal text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>{t("buttons.selectService") || "اختر"}</span>
              <ArrowRight className="w-3 h-3 rtl:scale-x-[-1]" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ServiceCard;
