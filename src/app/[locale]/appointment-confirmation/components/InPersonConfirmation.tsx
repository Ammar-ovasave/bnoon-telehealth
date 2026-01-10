"use client";
import { FC, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { User, CalendarDays, Sparkles, Building, Copy, Check, Phone } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ConfirmationProps } from "./types";

const KSA_TIMEZONE = "Asia/Riyadh";

export const InPersonConfirmation: FC<ConfirmationProps> = ({
  appointmentData,
  fullName,
  phone,
}) => {
  const t = useTranslations("AppointmentConfirmationPage");
  const tVisitTypes = useTranslations("visitTypes");
  const locale = useLocale();

  const [copied, setCopied] = useState(false);

  const handleCopyConfirmation = useCallback(async () => {
    if (!appointmentData?.appointmentId) return;
    try {
      await navigator.clipboard.writeText(String(appointmentData.appointmentId));
      setCopied(true);
      toast.success(t("confirmationCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }, [appointmentData?.appointmentId, t]);

  const userTimezone = useMemo(() => {
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "UTC";
  }, []);

  const isKSA = userTimezone === "Asia/Riyadh";

  const dateFnsLocale = useMemo(() => {
    return locale === "ar" ? ar : enUS;
  }, [locale]);

  const selectedTimeSlot = useMemo(() => {
    if (!appointmentData?.startTime) return "-";
    try {
      return format(appointmentData.startTime, "yyyy-MM-dd hh:mm a", { locale: dateFnsLocale });
    } catch {
      return "-";
    }
  }, [appointmentData?.startTime, dateFnsLocale]);

  const selectedTimeSlotKSA = useMemo(() => {
    if (!appointmentData?.startTime || isKSA) return null;
    try {
      return formatInTimeZone(appointmentData.startTime, KSA_TIMEZONE, "yyyy-MM-dd hh:mm a", { locale: dateFnsLocale });
    } catch {
      return null;
    }
  }, [appointmentData?.startTime, isKSA, dateFnsLocale]);

  const confirmationNumber = appointmentData?.appointmentId;
  const clinicName = appointmentData?.branchName ?? "-";
  const doctorName = appointmentData?.doctorName ?? "-";
  const serviceName = appointmentData?.serviceName ?? "-";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-bnoon-teal/10 rounded-full flex items-center justify-center border-2 border-bnoon-teal">
              <Check className="h-8 w-8 text-bnoon-teal" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bnoon-navy dark:text-white mb-4">{t("title")}</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">{t("description")}</p>

          {/* Confirmation Badge */}
          <div className="mt-6 inline-flex items-center gap-3 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-2xl px-6 py-4 border border-bnoon-teal/20 dark:border-bnoon-teal/30">
            <Sparkles className="w-5 h-5 text-bnoon-teal" />
            <div className="text-left">
              <p className="text-xs text-bnoon-teal font-medium">{t("confirmationNumber")}</p>
              <p className="text-lg font-bold text-bnoon-navy dark:text-white">{confirmationNumber}</p>
            </div>
            <button
              onClick={handleCopyConfirmation}
              className="p-2 rounded-lg hover:bg-bnoon-teal/20 active:scale-95 transition-all cursor-pointer"
              title={t("copyConfirmation")}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-bnoon-teal" />
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appointment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-bnoon-navy dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-xl flex items-center justify-center">
                <Image
                  src={"/icons/Calender.png"}
                  alt={t("appointmentDetails.title")}
                  width={40}
                  height={40}
                  className="h-5 w-5 object-contain"
                />
              </div>
              {t("appointmentDetails.title")}
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.dateTime")}</span>
                <div className="text-right">
                  <span className="font-semibold text-bnoon-navy dark:text-white">{selectedTimeSlot}</span>
                  {selectedTimeSlotKSA && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t("appointmentDetails.ksaTime")}: {selectedTimeSlotKSA}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.visitType")}</span>
                <span className="font-semibold text-bnoon-navy dark:text-white">{tVisitTypes("clinic")}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.doctor")}</span>
                <span className="font-semibold text-bnoon-navy dark:text-white">{doctorName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.service")}</span>
                <span className="font-semibold text-bnoon-navy dark:text-white">{serviceName}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.location")}</span>
                <span className="font-semibold text-bnoon-navy dark:text-white">{clinicName}</span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-bnoon-navy dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-bnoon-teal" />
              </div>
              {t("patientInformation.title")}
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("patientInformation.fullName")}
                </span>
                <span className="font-semibold text-bnoon-navy dark:text-white">{fullName}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t("patientInformation.mobileNumber")}
                </span>
                <span dir="ltr" className="font-semibold text-bnoon-navy dark:text-white">
                  {phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps - In-Person Specific */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-bnoon-navy dark:text-white mb-4">{t("nextSteps.title")}</h3>

          {/* Confirmation message for in-person */}
          <div className="p-4 bg-gradient-to-r from-bnoon-teal/10 to-cyan-500/10 dark:from-bnoon-teal/20 dark:to-cyan-500/20 rounded-xl border border-bnoon-teal/20 dark:border-bnoon-teal/30 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="w-2 h-2 bg-bnoon-teal rounded-full mt-1.5 flex-shrink-0" />
              {t("nextSteps.confirmationMessageClinic")}
            </p>
          </div>

          {/* In-Person Tips */}
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">{t("nextSteps.clinicTitle")}</h4>
            </div>
            <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                {t("nextSteps.clinicTip1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                {t("nextSteps.clinicTip2")}
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center sm:flex-row gap-4 justify-center mt-10">
          <Link href={`/manage-appointments?branch=${appointmentData.branchId}`}>
            <Button size="lg" className="px-8">
              <CalendarDays className="h-4 w-4" />
              {t("buttons.manageAppointments")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
