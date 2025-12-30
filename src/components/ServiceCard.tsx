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
          "cursor-pointer relative gap-0 justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden h-full border-0 shadow-md group",
          "dark:bg-gray-800 dark:shadow-lg dark:shadow-black/20"
        )}
      >
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bnoon-teal/0 to-cyan-500/0 group-hover:from-bnoon-teal/5 group-hover:to-cyan-500/5 dark:group-hover:from-bnoon-teal/10 dark:group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none" />
        
        <CardHeader className="text-center px-5 py-6 gap-0 relative">
          {/* Icon Container */}
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Background Circle */}
              <div className="absolute inset-0 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white dark:bg-gray-700 rounded-2xl shadow-sm" />
              
              {/* Icon */}
              <div className="relative z-10">
                {service.imageSrc ? (
                  <Image
                    width={service.imageWidth ?? 50}
                    height={service.imageHeight ?? 50}
                    src={service.imageSrc}
                    alt={service.title}
                    className={cn("h-12 w-12 object-contain", service.imageClassName)}
                  />
                ) : (
                  <span className="text-3xl">{service.icon}</span>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <CardTitle className="text-base font-bold text-bnoon-navy dark:text-white mb-2 group-hover:text-bnoon-teal transition-colors duration-300">
            {t(`services.${service.id}.title`)}
          </CardTitle>

          {/* Description */}
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
            {t(`services.${service.id}.description`)}
          </CardDescription>

          {/* Arrow Indicator */}
          <div className="mt-4 flex justify-center">
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
