"use client";
import { ClinicLocation } from "@/models/ClinicModel";
import { FC, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import LoadingOverlay from "./LoadingOverlay";
import { useTranslations, useLocale } from "next-intl";

const ClinicCard: FC<ClinicCardProps> = ({ clinic }) => {
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
    router.push(`/interest?${newUrlSearchParams.toString()}`);
  };

  return (
    <LoadingOverlay visible={loadingSwitchBranch}>
      <Card
        key={clinic.id}
        onClick={handleSelectClinic}
        className={`gap-0 cursor-pointer relative h-[420px] w-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden p-0 border-0 group ${
          clinic.isCommingSoon ? "opacity-80" : ""
        }`}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={clinic.imageSrc}
            alt={`${clinic.name} clinic`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Coming Soon Badge */}
          {clinic.isCommingSoon && !clinic.hideComingSoonBadge && (
            <div className="absolute top-4 ltr:right-4 rtl:left-4 z-20">
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-bnoon-navy px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                <Clock className="w-3.5 h-3.5" />
                {t("buttons.openingSoon")}
              </div>
            </div>
          )}

          {/* Clinic Name on Image */}
          <div className="absolute bottom-4 ltr:left-4 rtl:right-4 ltr:right-4 rtl:left-4 z-10">
            <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
              {t(`clinics.${clinic.id}.name`)}
            </h3>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{t(`clinics.${clinic.id}.address`)}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          {/* Decorative Line */}
          <div className="w-12 h-1 bg-gradient-to-r from-bnoon-teal to-cyan-400 rounded-full mb-4" />
          
          {/* Description or Features */}
          <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-2">
            {locale === "ar"
              ? "مركز متخصص في علاجات الخصوبة وصحة المرأة مع أحدث التقنيات الطبية"
              : "Specialized center for fertility treatments and women's health with latest medical technologies"}
          </p>

          {/* Action Button */}
          {clinic.hideComingSoonBadge ? null : (
            <Button
              onClick={handleSelectClinic}
              disabled={clinic.isCommingSoon || loadingSwitchBranch}
              className={`w-full mt-4 group/btn ${
                clinic.isCommingSoon
                  ? "bg-gray-100 text-gray-500 hover:bg-gray-100 cursor-not-allowed"
                  : "bg-bnoon-teal hover:bg-bnoon-teal/90 text-white"
              }`}
              size="lg"
            >
              {clinic.isCommingSoon ? (
                t("buttons.openingSoon")
              ) : (
                <>
                  {t("buttons.selectClinic")}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 rtl:scale-x-[-1] rtl:group-hover/btn:-translate-x-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </LoadingOverlay>
  );
};

interface ClinicCardProps {
  clinic: ClinicLocation;
}

export default ClinicCard;
