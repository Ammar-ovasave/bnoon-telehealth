"use client";

import { AvailabilityFilter } from "@/models/VisitTypeModel";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export interface AvailabilityOption {
  value: AvailabilityFilter;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface AvailabilityPickerProps {
  options: AvailabilityOption[];
  onSelect: (value: AvailabilityFilter) => void;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function AvailabilityPicker({ options, onSelect, eyebrow, title, description }: AvailabilityPickerProps) {
  const t = useTranslations("DoctorsPage");

  return (
    <section className="bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
      <div className="text-center max-w-2xl mx-auto mb-8">
        {eyebrow && (
          <p className="text-sm font-semibold text-bnoon-teal uppercase tracking-wider mb-2">{eyebrow}</p>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-bnoon-gray">
          {title ?? "Pick a visit type"}
        </h2>
        <p className="text-gray-600 mt-3 text-sm md:text-base leading-relaxed">
          {description ??
            "Select in-clinic or virtual care to see doctors who are available for your preferred appointment type."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "group w-full cursor-pointer rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-bnoon-light p-6 md:p-8 text-start transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bnoon-teal",
              "hover:border-bnoon-teal/50 hover:shadow-xl hover:-translate-y-1",
              "flex flex-col gap-5"
            )}
          >
            {/* Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-bnoon-teal/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="relative rounded-2xl bg-white p-4 shadow-sm">
                  {option.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-bnoon-gray group-hover:text-bnoon-teal transition-colors">
                  {option.title}
                </h3>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm md:text-base text-gray-600 flex-1 leading-relaxed">
              {option.description}
            </p>
            
            {/* CTA Button */}
            <div className="flex items-center gap-2 text-sm font-bold bg-bnoon-teal text-white px-5 py-3 rounded-full w-fit group-hover:bg-bnoon-navy transition-colors">
              <span>
                {option.value === "clinic" ? t("visitType.clinic.selectButton") : t("visitType.virtual.selectButton")}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:scale-x-[-1] rtl:group-hover:-translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
