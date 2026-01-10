"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { Button } from "./ui/button";
import Link from "next/link";
import { FC, useCallback, useState } from "react";
import { logout } from "@/services/client";
import { Spinner } from "./ui/spinner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { clearAllUserData } from "@/lib/clearUserData";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, LogOut, Menu, X, User } from "lucide-react";
import Image from "next/image";

function NavHeader() {
  const { data: currentUserData, isLoading } = useCurrentUser();
  const t = useTranslations("NavHeader");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build display name from first and last name only
  const displayName = [currentUserData?.firstName, currentUserData?.lastName]
    .filter((name) => name && name !== "-")
    .join(" ")
    .trim();

  // Logo URL based on locale - English goes to /en, Arabic goes to root
  const logoUrl = locale === "en" ? "https://bnoon.sa/en" : "https://bnoon.sa";

  return (
    <header className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - links to bnoon.sa */}
          <a href={logoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image
              src="/images/bnoon-logo.svg"
              alt="Bnoon - بنون"
              width={120}
              height={50}
              className="h-9 md:h-10 w-auto"
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Primary Navigation */}
            {!isLoading && currentUserData?.userId && (
              <Link
                href={"/manage-appointments"}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-bnoon-teal hover:bg-bnoon-teal/5 dark:hover:bg-bnoon-teal/10 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {t("myAppointments")}
              </Link>
            )}

            {/* Separator */}
            {!isLoading && currentUserData?.userId && (
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
            )}

            {/* User Area - grouped together */}
            {!isLoading && currentUserData?.userId ? (
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-base border border-gray-200 dark:border-gray-700">
                  <div className="w-7 h-7 bg-bnoon-teal/10 rounded-base flex items-center justify-center">
                    <User className="w-4 h-4 text-bnoon-teal" />
                  </div>
                  <span className="text-sm font-medium text-bnoon-navy dark:text-white max-w-[120px] truncate">
                    {displayName || currentUserData.phone}
                  </span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <Link href={"/login"}>
                <Button
                  variant="outline"
                  className="rounded-base px-6 border-gray-200 text-bnoon-navy hover:bg-bnoon-teal hover:text-white hover:border-bnoon-teal transition-all duration-300"
                >
                  {t("login")}
                </Button>
              </Link>
            )}

            {/* Language Switcher - always at the end */}
            <LanguageSwitcher />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-3">
              {/* User Info Card - Mobile */}
              {!isLoading && currentUserData?.userId && (
                <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-gray-50 to-bnoon-teal/5 dark:from-gray-800 dark:to-bnoon-teal/10 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 bg-bnoon-teal/10 rounded-base flex items-center justify-center">
                    <User className="w-6 h-6 text-bnoon-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bnoon-navy dark:text-white truncate">
                      {displayName || t("guest")}
                    </p>
                    <span dir="ltr" className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUserData.phone}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {!isLoading && currentUserData?.userId && (
                <Link
                  href={"/manage-appointments"}
                  className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-bnoon-teal bg-white dark:bg-gray-800 hover:bg-bnoon-teal/5 dark:hover:bg-bnoon-teal/10 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5" />
                  {t("myAppointments")}
                </Link>
              )}

              {/* Auth Actions */}
              {!isLoading && currentUserData?.userId ? (
                <LogoutButton isMobile />
              ) : (
                <Link href={"/login"} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full rounded-base bg-bnoon-teal hover:bg-bnoon-teal/90 h-12 text-base"
                  >
                    {t("login")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

const LanguageSwitcher: FC = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "عربي";

  // Build the URL with the other locale
  // Remove the current locale prefix and add the new one
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "");
  const queryString = searchParams.toString();
  const newUrl = `/${otherLocale}${pathWithoutLocale}${queryString ? `?${queryString}` : ""}`;

  return (
    <Link
      href={newUrl}
      className="px-4 py-2 text-base font-medium text-bnoon-navy border border-gray-200 rounded-base hover:bg-gray-50 transition-colors"
    >
      {label}
    </Link>
  );
};

const LogoutButton: FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("NavHeader");
  const { mutate } = useSWRConfig();

  const handleClick = useCallback(async () => {
    setLoading(true);
    // Clear cookies on server first
    await logout();
    // Clear all user data from sessionStorage and localStorage
    clearAllUserData();
    // Clear ENTIRE SWR cache to prevent previous user's data from appearing
    // This is critical for security - prevents data leakage between users
    await mutate(() => true, undefined, { revalidate: false });
    // Navigate to home page
    router.replace("/");
    setLoading(false);
  }, [router, mutate]);

  if (isMobile) {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        disabled={loading}
        className="w-full justify-center gap-2 rounded-base text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30"
      >
        {loading ? <Spinner className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
        {t("logout")}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      disabled={loading}
      className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 gap-2 rounded-base"
    >
      {loading ? <Spinner className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
      {t("logout")}
    </Button>
  );
};

export default NavHeader;
