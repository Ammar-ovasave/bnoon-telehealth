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
import { Calendar, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";

function NavHeader() {
  const { data: currentUserData, isLoading } = useCurrentUser();
  const t = useTranslations("NavHeader");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={"/"} className="flex items-center">
            <Image
              src="/images/bnoon-logo.svg"
              alt="Bnoon - بنون"
              width={140}
              height={58}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!isLoading && currentUserData?.mrn && (
              <Link
                href={"/manage-appointments"}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-bnoon-teal transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {t("myAppointments")}
              </Link>
            )}
            <BranchName />
            {!isLoading && currentUserData?.mrn ? (
              <LogoutButton />
            ) : (
              <Link href={"/login"}>
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-bnoon-teal text-bnoon-teal hover:bg-bnoon-teal hover:text-white transition-all duration-300"
                >
                  {t("login")}
                </Button>
              </Link>
            )}
            {/* Language Switcher */}
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
              <BranchName />
              {!isLoading && currentUserData?.mrn && (
                <Link
                  href={"/manage-appointments"}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-gray-600 hover:text-bnoon-teal hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  {t("myAppointments")}
                </Link>
              )}
              {!isLoading && currentUserData?.mrn ? (
                <LogoutButton isMobile />
              ) : (
                <Link href={"/login"} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full rounded-full bg-bnoon-teal hover:bg-bnoon-teal/90"
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
  const { data } = useCurrentBranch();
  const t = useTranslations("HomePage");

  if (!data?.branch?.id) return null;

  const branchName = t(`clinics.${data.branch.id}.name`);

  return (
    <Badge className="bg-bnoon-teal/10 text-bnoon-teal border-bnoon-teal/20 hover:bg-bnoon-teal/20 px-3 py-1">
      {branchName}
    </Badge>
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
