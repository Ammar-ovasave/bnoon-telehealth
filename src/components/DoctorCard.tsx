import { DoctorModel } from "@/models/DoctorModel";
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Video, Building2, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useTranslations, useLocale } from "next-intl";
import { getDoctorName } from "@/lib/getDoctorName";
import clsx from "clsx";

interface DoctorCardProps {
  doctor: DoctorModel;
  selectedDoctor: string;
  setSelectedDoctor: (doctor: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const DoctorCard: FC<DoctorCardProps> = ({ doctor, selectedDoctor, setSelectedDoctor, disabled = false, isLoading = false }) => {
  const t = useTranslations("DoctorsPage");
  const locale = useLocale();
  const doctorName = getDoctorName(doctor, locale);

  const getAvailabilityIcons = () => {
    const icons = [];
    if (doctor.availability.clinic) {
      icons.push(
        <div
          key="clinic"
          className="flex items-center gap-1.5 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 text-bnoon-teal px-2.5 py-1 rounded-base text-xs font-medium"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{locale === "ar" ? "عيادة" : "Clinic"}</span>
        </div>
      );
    }
    if (doctor.availability.virtual) {
      icons.push(
        <div
          key="virtual"
          className="flex items-center gap-1.5 bg-bnoon-navy/10 dark:bg-cyan-500/20 text-bnoon-navy dark:text-cyan-400 px-2.5 py-1 rounded-base text-xs font-medium"
        >
          <Video className="w-3.5 h-3.5" />
          <span>{locale === "ar" ? "عن بُعد" : "Virtual"}</span>
        </div>
      );
    }
    return icons;
  };

  const isSelected = selectedDoctor === doctor.id;

  return (
    <Card
      className={cn(
        "gap-0 relative transition-all duration-300 overflow-hidden h-full py-0 border-0 shadow-md group",
        "dark:bg-gray-800 dark:shadow-lg dark:shadow-black/20",
        disabled
          ? "opacity-50 cursor-not-allowed grayscale"
          : "cursor-pointer hover:shadow-xl",
        isSelected && !disabled
          ? "ring-2 ring-bnoon-teal bg-bnoon-teal/5 dark:bg-bnoon-teal/10 shadow-lg shadow-bnoon-teal/10"
          : !disabled && "hover:-translate-y-1"
      )}
      onClick={() => !disabled && setSelectedDoctor(doctor.id)}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bnoon-teal to-cyan-400" />
      )}

      <CardHeader className="text-center px-5 pt-6 pb-0 gap-1">
        {/* Doctor Photo */}
        <div className="relative w-28 h-28 mx-auto mb-4">
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-300",
              isSelected
                ? "bg-gradient-to-br from-bnoon-teal to-cyan-400 p-1"
                : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 p-0.5 group-hover:from-bnoon-teal/50 group-hover:to-cyan-400/50 group-hover:p-1"
            )}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-700">
              <Image
                src={doctor.photo}
                alt={`${doctorName} photo`}
                fill
                className={clsx(
                  "object-cover rounded-full",
                  doctor.imageClassName
                )}
                sizes="112px"
              />
            </div>
          </div>
        </div>

        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight">
          {doctorName}
        </CardTitle>
        <CardDescription className="text-bnoon-teal text-sm font-semibold">
          {t(`doctors.${doctor.id}.specialty`)}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-5 flex-1 px-5">
        <div className="space-y-4 flex flex-col h-full">
          {/* Languages */}
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{doctor.languages.map((lang) => t(lang)).join(" • ")}</span>
          </div>

          {/* Availability Tags */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {getAvailabilityIcons()}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Book Button */}
          <Button
            className={cn(
              "w-full mt-auto group/btn",
              isSelected && !disabled
                ? "bg-bnoon-teal hover:bg-bnoon-teal/90"
                : "bg-bnoon-navy hover:bg-bnoon-navy/90"
            )}
            variant="default"
            disabled={disabled || isLoading}
            onClick={() => !disabled && !isLoading && setSelectedDoctor(doctor.id)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {locale === "ar" ? "جاري التحميل..." : "Loading..."}
              </>
            ) : (
              <>
                {t("buttons.bookAppointment")}
                <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 rtl:scale-x-[-1] rtl:group-hover/btn:-translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
