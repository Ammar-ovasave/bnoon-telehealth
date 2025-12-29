"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { Button } from "./ui/button";
import Link from "next/link";
import { FC, useCallback, useState } from "react";
import { logout } from "@/services/client";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { Badge } from "./ui/badge";
import { useTranslations, useLocale } from "next-intl";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
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

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand Descriptor */}
          <Link href={"/"} className="flex items-center gap-3">
            <Image
              src="/images/bnoon-logo.svg"
              alt="Bnoon - بنون"
              width={140}
              height={58}
              className="h-10 md:h-12 w-auto"
              priority
            />
            <div className="hidden lg:block border-l border-gray-200 pl-3">
              <p className="text-[10px] leading-tight text-bnoon-navy font-medium">
                {locale === "ar" ? "مركز الإخصاب وصحة المرأة" : "The Fertility & Women's Health Center"}
              </p>
              <p className="text-[9px] leading-tight text-gray-500">
                {locale === "ar" ? "جزء من شبكة جلوبال فيرتيليتي" : "Part of Global Fertility Network"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Primary Navigation */}
            {!isLoading && currentUserData?.mrn && (
              <Link
                href={"/manage-appointments"}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-bnoon-teal hover:bg-bnoon-teal/5 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {t("myAppointments")}
              </Link>
            )}

            {/* Separator */}
            {!isLoading && currentUserData?.mrn && (
              <div className="h-6 w-px bg-gray-200" />
            )}

            {/* User Area - grouped together */}
            {!isLoading && currentUserData?.mrn ? (
              <div className="flex items-center gap-3">
                {/* User Info with Branch */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                  <div className="w-7 h-7 bg-bnoon-teal/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-bnoon-teal" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-bnoon-navy max-w-[120px] truncate leading-tight">
                      {displayName || currentUserData.mrn}
                    </span>
                    <BranchNameInline />
                  </div>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <>
                {/* Branch badge for non-logged in users */}
                <BranchName />
                <Link href={"/login"}>
                  <Button
                    variant="outline"
                    className="rounded-full px-6 border-bnoon-teal text-bnoon-teal hover:bg-bnoon-teal hover:text-white transition-all duration-300"
                  >
                    {t("login")}
                  </Button>
                </Link>
              </>
            )}

            {/* Language Switcher - always at the end */}
            <LanguageSwitcher />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col gap-3">
              {/* User Info Card - Mobile */}
              {!isLoading && currentUserData?.mrn && (
                <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-gray-50 to-bnoon-teal/5 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-bnoon-teal/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-bnoon-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bnoon-navy truncate">
                      {displayName || t("guest")}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        MRN: {currentUserData.mrn}
                      </span>
                      <BranchNameMobile />
                    </div>
                  </div>
                </div>
              )}

              {/* Branch badge for non-logged in users */}
              {!currentUserData?.mrn && <BranchName />}

              {/* Navigation Links */}
              {!isLoading && currentUserData?.mrn && (
                <Link
                  href={"/manage-appointments"}
                  className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-gray-700 hover:text-bnoon-teal bg-white hover:bg-bnoon-teal/5 rounded-xl border border-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5" />
                  {t("myAppointments")}
                </Link>
              )}

              {/* Auth Actions */}
              {!isLoading && currentUserData?.mrn ? (
                <LogoutButton isMobile />
              ) : (
                <Link href={"/login"} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full rounded-full bg-bnoon-teal hover:bg-bnoon-teal/90 h-12 text-base"
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
  const otherLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "عربي";

  return (
    <Link
      href={`/${otherLocale}`}
      className="px-3 py-1.5 text-sm font-medium text-bnoon-navy border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
    >
      {label}
    </Link>
  );
};

const BranchName: FC = () => {
  const { data, isLoading } = useCurrentBranch();
  const t = useTranslations("HomePage");

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  if (!data?.branch?.id) return null;

  const branchName = t(`clinics.${data.branch.id}.name`);

  return (
    <Badge className="bg-bnoon-teal/10 text-bnoon-teal border-bnoon-teal/20 hover:bg-bnoon-teal/20 px-3 py-1">
      {branchName}
    </Badge>
  );
};

// Inline version for desktop user card - shows as small text below name
const BranchNameInline: FC = () => {
  const { data, isLoading } = useCurrentBranch();
  const t = useTranslations("HomePage");

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="h-3 w-16 bg-bnoon-teal/20 rounded animate-pulse" />
    );
  }

  if (!data?.branch?.id) return null;

  const branchName = t(`clinics.${data.branch.id}.name`);

  return (
    <span className="text-[10px] text-bnoon-teal font-medium leading-tight truncate max-w-[120px]">
      {branchName}
    </span>
  );
};

// Mobile version - shows as a small pill next to MRN
const BranchNameMobile: FC = () => {
  const { data, isLoading } = useCurrentBranch();
  const t = useTranslations("HomePage");

  // Show skeleton while loading
  if (isLoading) {
    return (
      <>
        <span className="text-gray-300">•</span>
        <div className="h-3 w-14 bg-bnoon-teal/20 rounded animate-pulse" />
      </>
    );
  }

  if (!data?.branch?.id) return null;

  const branchName = t(`clinics.${data.branch.id}.name`);

  return (
    <>
      <span className="text-gray-300">•</span>
      <span className="text-xs text-bnoon-teal font-medium">
        {branchName}
      </span>
    </>
  );
};

const LogoutButton: FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const [loading, setLoading] = useState(false);
  const { mutate: mutateCurrentUser } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations("NavHeader");
  const { mutate: mutatePatient } = useFertiSmartPatient();

  const handleClick = useCallback(async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    mutateCurrentUser(undefined);
    mutatePatient(undefined);
    router.replace("/");
  }, [mutateCurrentUser, mutatePatient, router]);

  if (isMobile) {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        disabled={loading}
        className="w-full justify-center gap-2 rounded-full text-red-600 border-red-200 hover:bg-red-50"
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
      className="text-gray-600 hover:text-red-600 hover:bg-red-50 gap-2 rounded-full"
    >
      {loading ? <Spinner className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
      {t("logout")}
    </Button>
  );
};

export default NavHeader;
