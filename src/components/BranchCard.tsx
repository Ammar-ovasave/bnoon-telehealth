"use client";
import { BranchDto } from "@/services/bnoon-api/types";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

interface BranchCardProps {
  branch: BranchDto;
  priority?: boolean;
}

/**
 * Branch selection card - navigates with URL params only (no cookies).
 */
const BranchCard: FC<BranchCardProps> = ({ branch, priority = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("selectedClinicLocation", branch.branchId);
    return params.toString();
  }, [branch.branchId, searchParams]);

  const handleSelectBranch = () => {
    if (!branch.available) return;
    // Navigate with branch in URL params - no cookie needed
    router.push(`/${locale}/interest?${newUrlSearchParams}`);
  };

  const isComingSoon = !branch.available;

  return (
    <>
      <Card
        key={branch.branchId}
        onClick={handleSelectBranch}
        className={`gap-0 cursor-pointer relative w-full aspect-[4/5] transition-all duration-300 hover:shadow-xl overflow-hidden p-0 rounded-2xl`}
      >
        <Image
          src={branch.imageUrl || "/images/placeholder-clinic.jpg"}
          alt={`${branch.name} clinic`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        <div className="p-4 relative z-10 h-full flex flex-col justify-end gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold text-white">{branch.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-white">{branch.location}</span>
            </CardDescription>
          </CardHeader>
          <Button
            onClick={handleSelectBranch}
            disabled={isComingSoon}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold rounded-lg"
            size="lg"
          >
            {isComingSoon ? t("buttons.openingSoon") : t("buttons.selectClinic")}
          </Button>
          {isComingSoon && (
            <p className="text-white text-sm absolute top-2 z-20 ltr:right-2 rtl:left-2 bg-white/20 rounded-sm px-2 backdrop-blur-2xl">
              {t("buttons.openingSoon")}
            </p>
          )}
        </div>
      </Card>
    </>
  );
};

export default BranchCard;
