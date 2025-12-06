"use client";
import { ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { clinicLocations } from "@/models/ClinicModel";
import { cn } from "@/lib/utils";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useSwitchBranch from "@/hooks/useSwitchBranch";
import LoadingOverlay from "./LoadingOverlay";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ClinicBranchSelectProps {
  className?: string;
}

export default function ClinicBranchSelect({ className }: ClinicBranchSelectProps) {
  const t = useTranslations("ManageAppointmentsPage.clinicBranchSelect");
  const tHomePage = useTranslations("HomePage");
  const { data, isLoading } = useCurrentBranch();

  const selectedBranchId = data?.branch?.id ?? "";

  const { handleSwitchBranch, loading: switchingBranch } = useSwitchBranch();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextBranchId = event.target.value;
    if (!nextBranchId || nextBranchId === selectedBranchId) {
      return;
    }
    handleSwitchBranch({ payload: { branchId: nextBranchId } });
  };

  return (
    <LoadingOverlay visible={switchingBranch}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-primary/20 bg-white p-6 shadow-sm transition hover:border-primary/40 dark:border-primary/30 dark:bg-slate-900/80",
          className
        )}
      >
        <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Image src={`/icons/ClinicBuilding.png`} alt={t("label")} width={100} height={100} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("label")}</p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("heading")}</h2>
            </div>
          </div>
          <div className="flex min-w-[240px] flex-col gap-2">
            <label htmlFor="clinic-branch-select" className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {t("selectBranch")}
            </label>
            <div className="relative w-fit">
              <NativeSelect
                id="clinic-branch-select"
                value={selectedBranchId}
                onChange={handleChange}
                disabled={isLoading || switchingBranch}
                className="border-primary/30 bg-primary/5 font-semibold text-primary focus-visible:border-primary focus-visible:ring-primary/30 dark:bg-slate-800/90 dark:text-primary-foreground dark:focus-visible:ring-primary"
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
              {(isLoading || switchingBranch) && (
                <Loader2
                  className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </LoadingOverlay>
  );
}
