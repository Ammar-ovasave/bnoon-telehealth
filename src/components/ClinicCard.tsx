"use client";
import { ClinicLocation } from "@/models/ClinicModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import LoadingOverlay from "./LoadingOverlay";
import { useTranslations, useLocale } from "next-intl";

const clinicImageScaleMap: Record<string, number> = {
  "riyadh-king-salman": 1.4,
  "jeddah": 1.25
}

const ClinicCard: FC<ClinicCardProps> = ({ clinic, priority = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const { handleSwitchBranch, loading: loadingSwitchBranch } = useSwitchBranch();

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("selectedClinicLocation", clinic.id);
    return params.toString();
  }, [clinic.id, searchParams]);

  const handleSelectClinic = async () => {
    if (clinic.isCommingSoon) return;
    await handleSwitchBranch({ payload: { branchId: clinic.id } });
    router.push(`/${locale}/interest?${newUrlSearchParams}`);
  };

  return (
    <LoadingOverlay visible={loadingSwitchBranch}>
      <Card
        key={clinic.id}
        onClick={handleSelectClinic}
        className={`gap-0 cursor-pointer relative w-full aspect-[4/5] transition-all duration-300 hover:shadow-xl overflow-hidden p-0 rounded-2xl`}
      >
        <Image
          src={clinic.imageSrc}
          alt={`${clinic.name} clinic`}
          fill
          className="object-cover"
          style={{
            transform: clinicImageScaleMap[clinic.id]
              ? `scale(${clinicImageScaleMap[clinic.id]})`
              : undefined,
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        <div className="p-4 relative z-10 h-full flex flex-col justify-end gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold text-white">{t(`clinics.${clinic.id}.name`)}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-white">{t(`clinics.${clinic.id}.address`)}</span>
            </CardDescription>
          </CardHeader>
          {clinic.hideComingSoonBadge ? null : (
            <Button
              onClick={handleSelectClinic}
              disabled={clinic.isCommingSoon || loadingSwitchBranch}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold rounded-lg"
              size="lg"
            >
              {clinic.isCommingSoon ? t("buttons.openingSoon") : t("buttons.selectClinic")}
            </Button>
          )}
          {clinic.isCommingSoon && !clinic.hideComingSoonBadge && (
            <p className="text-white text-sm absolute top-2 z-20 ltr:right-2 rtl:left-2 bg-white/20 rounded-sm px-2 backdrop-blur-2xl">
              {t("buttons.openingSoon")}
            </p>
          )}
        </div>
      </Card>
    </LoadingOverlay>
  );
};

interface ClinicCardProps {
  clinic: ClinicLocation;
  priority?: boolean;
}

export default ClinicCard;
