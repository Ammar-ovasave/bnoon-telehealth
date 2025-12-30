"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";
import { useLocale } from "next-intl";

const themes = [
  { value: "system", labelEn: "System", labelAr: "تلقائي", icon: Monitor },
  { value: "light", labelEn: "Light", labelAr: "فاتح", icon: Sun },
  { value: "dark", labelEn: "Dark", labelAr: "داكن", icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
        aria-label={locale === "ar" ? "تغيير المظهر" : "Change theme"}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon className="w-4 h-4 text-bnoon-teal" />
        <ChevronDown 
          className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full mt-2 ltr:right-0 rtl:left-0 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in"
          role="listbox"
          aria-label={locale === "ar" ? "اختر المظهر" : "Select theme"}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {locale === "ar" ? "المظهر" : "Theme"}
            </p>
          </div>
          
          {/* Options */}
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                  ${isSelected 
                    ? "bg-bnoon-teal/10 text-bnoon-teal dark:bg-bnoon-teal/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-bnoon-teal" : "text-gray-400 dark:text-gray-500"}`} />
                <span className="flex-1 text-start">
                  {locale === "ar" ? themeOption.labelAr : themeOption.labelEn}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-bnoon-teal" />
                )}
              </button>
            );
          })}
          
          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 mt-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              {locale === "ar" 
                ? "تلقائي يتبع إعدادات جهازك" 
                : "System follows your device settings"
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  const nextTheme = () => {
    if (theme === "system") return "light";
    if (theme === "light") return "dark";
    return "system";
  };

  const getLabel = () => {
    if (theme === "system") return locale === "ar" ? "تلقائي" : "System";
    if (theme === "light") return locale === "ar" ? "فاتح" : "Light";
    return locale === "ar" ? "داكن" : "Dark";
  };

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <button
      onClick={() => setTheme(nextTheme())}
      className="w-full flex items-center justify-between gap-3 py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <CurrentIcon className="w-5 h-5 text-bnoon-teal" />
        <span>{locale === "ar" ? "المظهر" : "Theme"}</span>
      </div>
      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400">
        {getLabel()}
      </span>
    </button>
  );
}

