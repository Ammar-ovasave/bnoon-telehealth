"use client";
import { ChangeEvent, useState } from "react";
import { Loader2, Star, Check } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { clinicLocations, ClinicBranchID } from "@/models/ClinicModel";
import { cn } from "@/lib/utils";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import useUserPreferences from "@/hooks/useUserPreferences";
import LoadingOverlay from "./LoadingOverlay";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "./ui/button";

interface ClinicBranchSelectProps {
  className?: string;
}

export default function ClinicBranchSelect({ className }: ClinicBranchSelectProps) {
  const t = useTranslations("ManageAppointmentsPage.clinicBranchSelect");
  const tHomePage = useTranslations("HomePage");
  const locale = useLocale();
  const { data, isLoading } = useCurrentBranch();
  const { defaultBranchId, setDefaultBranch, isLoading: isLoadingPreferences } = useUserPreferences();
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const selectedBranchId = data?.branch?.id ?? "";
  const isCurrentBranchDefault = selectedBranchId === defaultBranchId;

  const { handleSwitchBranch, loading: switchingBranch } = useSwitchBranch();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextBranchId = event.target.value;
    if (!nextBranchId || nextBranchId === selectedBranchId) {
      return;
    }
    handleSwitchBranch({ payload: { branchId: nextBranchId } });
  };

  const handleSetAsDefault = async () => {
    if (!selectedBranchId || isCurrentBranchDefault) return;
    setIsSettingDefault(true);
    await setDefaultBranch(selectedBranchId as ClinicBranchID);
    setIsSettingDefault(false);
  };

  return (
    <LoadingOverlay visible={switchingBranch}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-bnoon-teal/20 dark:border-bnoon-teal/30 bg-white dark:bg-gray-800 p-6 shadow-sm transition hover:border-bnoon-teal/40",
          className
        )}
      >
        <div className="absolute -top-16 -right-16 size-40 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20 blur-3xl" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20 text-bnoon-teal">
              <Image src={`/icons/ClinicBuilding.png`} alt={t("label")} width={100} height={100} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-bnoon-teal">{t("label")}</p>
              <h2 className="text-xl font-bold text-bnoon-navy dark:text-white">{t("heading")}</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Branch Selector */}
            <div className="flex min-w-[240px] flex-col gap-2">
              <label htmlFor="clinic-branch-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("selectBranch")}
              </label>
              <div className="relative w-fit">
                <NativeSelect
                  id="clinic-branch-select"
                  value={selectedBranchId}
                  onChange={handleChange}
                  disabled={isLoading || switchingBranch}
                  className="border-bnoon-teal/30 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 dark:border-bnoon-teal/40 font-semibold text-bnoon-navy dark:text-white focus-visible:border-bnoon-teal focus-visible:ring-bnoon-teal/30"
                >
                  {clinicLocations
                    .filter((item) => !item.isCommingSoon)
                    .map((clinic) => {
                      const clinicName = tHomePage(`clinics.${clinic.id}.name`);
                      const isDefault = clinic.id === defaultBranchId;
                      return (
                        <NativeSelectOption key={clinic.id} value={clinic.id} disabled={clinic.isCommingSoon}>
                          {isDefault ? `★ ${clinicName}` : clinicName}
                        </NativeSelectOption>
                      );
                    })}
                </NativeSelect>
                {(isLoading || switchingBranch) && (
                  <Loader2
                    className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-bnoon-teal"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            {/* Set as Default Button */}
            {selectedBranchId && !isLoadingPreferences && (
              <Button
                variant={isCurrentBranchDefault ? "outline" : "ghost"}
                size="sm"
                onClick={handleSetAsDefault}
                disabled={isCurrentBranchDefault || isSettingDefault}
                className={cn(
                  "gap-1.5 text-xs transition-all",
                  isCurrentBranchDefault
                    ? "border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 cursor-default"
                    : "text-gray-500 dark:text-gray-400 hover:text-bnoon-teal hover:bg-bnoon-teal/5 dark:hover:bg-bnoon-teal/10"
                )}
              >
                {isSettingDefault ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isCurrentBranchDefault ? (
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                ) : (
                  <Star className="w-3 h-3" />
                )}
                {isCurrentBranchDefault
                  ? locale === "ar"
                    ? "الفرع الافتراضي"
                    : "Default Branch"
                  : locale === "ar"
                    ? "تعيين كافتراضي"
                    : "Set as Default"}
              </Button>
            )}
          </div>
        </div>

        {/* Default Branch Info */}
        {defaultBranchId && !isCurrentBranchDefault && !isLoadingPreferences && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {locale === "ar" ? "فرعك الافتراضي:" : "Your default branch:"}{" "}
              <span className="font-medium text-bnoon-navy dark:text-white">
                {tHomePage(`clinics.${defaultBranchId}.name`)}
              </span>
            </p>
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
}
