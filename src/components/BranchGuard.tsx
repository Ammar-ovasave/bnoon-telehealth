"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

interface BranchGuardProps {
  children: React.ReactNode;
}

export default function BranchGuard({ children }: BranchGuardProps) {
  const { data, isLoading } = useCurrentBranch();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("BranchGuard");

  useEffect(() => {
    if (!isLoading && !data?.branch?.id) {
      toast.error(t("selectClinicMessage"));
      router.replace(`/${locale}`);
    }
  }, [isLoading, data?.branch?.id, router, locale, t]);

  if (isLoading || !data?.branch?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-bnoon-teal" />
      </div>
    );
  }

  return <>{children}</>;
}
