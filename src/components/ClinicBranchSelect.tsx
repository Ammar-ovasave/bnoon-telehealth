"use client";
import { ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { clinicLocations } from "@/models/ClinicModel";
import { cn } from "@/lib/utils";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ClinicBranchSelectProps {
  className?: string;
  isSwitching?: boolean;
}

export default function ClinicBranchSelect({ className, isSwitching }: ClinicBranchSelectProps) {
  const t = useTranslations("ManageAppointmentsPage.clinicBranchSelect");
  const tHomePage = useTranslations("HomePage");
  const { data, isLoading } = useCurrentBranch();

  const selectedBranchId = data?.branch?.id ?? "";

  const { handleSwitchBranch, loading: switchingBranch } = useSwitchBranch();

  // Use external isSwitching if provided, otherwise use internal state
  const isCurrentlySwitching = isSwitching ?? switchingBranch;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextBranchId = event.target.value;
    if (!nextBranchId || nextBranchId === selectedBranchId) {
      return;
    }
    handleSwitchBranch({ payload: { branchId: nextBranchId } });
  };

  return (
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

        <div className="flex min-w-[240px] flex-col gap-2">
          <label htmlFor="clinic-branch-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("selectBranch")}
          </label>
          <div className="relative w-fit">
            <NativeSelect
              id="clinic-branch-select"
              value={selectedBranchId}
              onChange={handleChange}
              disabled={isLoading || isCurrentlySwitching}
              className={cn(
                "border-bnoon-teal/30 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 dark:border-bnoon-teal/40 font-semibold text-bnoon-navy dark:text-white focus-visible:border-bnoon-teal focus-visible:ring-bnoon-teal/30",
                isCurrentlySwitching && "opacity-60 cursor-not-allowed"
              )}
            >
              {clinicLocations
                .filter((item) => !item.isCommingSoon)
                .map((clinic) => {
                  const clinicName = tHomePage(`clinics.${clinic.id}.name`);
                  return (
                    <NativeSelectOption key={clinic.id} value={clinic.id} disabled={clinic.isCommingSoon}>
                      {clinicName}
                    </NativeSelectOption>
                  );
                })}
            </NativeSelect>
            {(isLoading || isCurrentlySwitching) && (
              <Loader2
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-bnoon-teal"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
