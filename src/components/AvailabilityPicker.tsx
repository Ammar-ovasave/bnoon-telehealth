"use client";

import { AvailabilityFilter } from "@/models/VisitTypeModel";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface AvailabilityOption {
  value: AvailabilityFilter;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AvailabilityPickerProps {
  options: AvailabilityOption[];
  onSelect: (value: AvailabilityFilter) => void;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function AvailabilityPicker({ options, onSelect, eyebrow, title, description }: AvailabilityPickerProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-center max-w-2xl mx-auto mb-6">
        {eyebrow ? (
          <p className="text-sm font-medium text-primary uppercase tracking-wide">{eyebrow}</p>
        ) : (
          <p className="text-sm font-medium text-primary uppercase tracking-wide">Choose how you’d like to meet</p>
        )}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mt-2">{title ?? "Pick a visit type"}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-3">
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
              "group w-full cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-5 md:p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "hover:border-primary/60 hover:bg-white dark:hover:bg-gray-900",
              "flex flex-col gap-4"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <option.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{option.title}</h3>
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 flex-1">{option.description}</p>
            <div className="flex items-center justify-between text-sm font-medium text-primary">
              <span>Select {option.value === "clinic" ? "an in-person" : "a virtual"} visit</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
