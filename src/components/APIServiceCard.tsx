"use client";
import { ServiceDto } from "@/services/bnoon-api/types";
import { FC, useMemo } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Stethoscope } from "lucide-react";

interface APIServiceCardProps {
  service: ServiceDto;
}

const APIServiceCard: FC<APIServiceCardProps> = ({ service }) => {
  const searchParams = useSearchParams();
  const t = useTranslations("ServicesPage");
  const locale = useLocale();

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("selectedService", service.id.toString());
    params.set("selectedServiceCode", service.code);
    return params.toString();
  }, [service.id, service.code, searchParams]);

  // Check if iconUrl is an SVG
  const isSvgIcon = service.iconUrl?.toLowerCase().endsWith(".svg");

  return (
    <Link href={`/${locale}/doctors?${newUrlSearchParams.toString()}`} className="h-full flex flex-col">
      <Card
        className={cn(
          "cursor-pointer relative gap-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden flex-1 border-0 shadow-md group"
        )}
      >
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bnoon-teal/0 to-cyan-500/0 group-hover:from-bnoon-teal/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />

        {/* Custom flex container - bypasses CardHeader grid issues */}
        <div className="flex-1 flex flex-col px-4 py-4 text-center relative">
          {/* Section 1: Icon + Title (fixed height for alignment across cards) */}
          <div className="h-[130px] flex flex-col items-center justify-center shrink-0">
            {/* Icon Container */}
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-bnoon-teal/10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm" />

                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  {service.iconUrl ? (
                    isSvgIcon ? (
                      // For SVG, use img tag to preserve vector quality
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.iconUrl}
                        alt={service.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      // For PNG, use Next.js Image
                      <Image
                        src={service.iconUrl}
                        alt={service.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    )
                  ) : (
                    // Fallback icon
                    <Stethoscope className="w-12 h-12 text-bnoon-teal" />
                  )}
                </div>
              </div>
            </div>

            {/* Title - single line with ellipsis if too long */}
            <h3 className="text-lg font-bold text-bnoon-navy dark:text-white group-hover:text-bnoon-teal transition-colors duration-300 text-center leading-tight line-clamp-1">
              {service.name}
            </h3>
          </div>

          {/* Section 2: Description + Price + Arrow (pushed to bottom with mt-auto) */}
          <div className="mt-auto flex flex-col items-center">
            {/* Description */}
            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              {service.description}
            </p>

            {/* Price */}
            {service.price > 0 && (
              <div className="mt-2 text-sm text-bnoon-teal font-medium">
                {service.price} {service.currency}
              </div>
            )}

            {/* Arrow Indicator */}
            <div className="pt-3 flex justify-center">
              <div className="flex items-center gap-1 text-bnoon-teal text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>{t("buttons.selectService")}</span>
                <ArrowRight className="w-3 h-3 rtl:scale-x-[-1]" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default APIServiceCard;
