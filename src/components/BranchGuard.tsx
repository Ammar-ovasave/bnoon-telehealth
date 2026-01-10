"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { clinicLocations } from "@/models/ClinicModel";

interface BranchGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that ensures a valid branch is selected via URL params.
 * No longer uses cookies - relies on `selectedClinicLocation` URL parameter.
 */
export default function BranchGuard({ children }: BranchGuardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("BranchGuard");

  const branchId = searchParams.get("selectedClinicLocation");
  const isValidBranch = branchId && clinicLocations.some((c) => c.id === branchId && !c.isCommingSoon);

  useEffect(() => {
    if (!isValidBranch) {
      toast.error(t("selectClinicMessage"));
      router.replace(`/${locale}`);
    }
  }, [isValidBranch, router, locale, t]);

  if (!isValidBranch) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
