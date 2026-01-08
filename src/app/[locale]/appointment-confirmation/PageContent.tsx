"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Mail, Globe, Users, CreditCard, CalendarDays, Sparkles, Video, Building, Copy, Check } from "lucide-react";
import Link from "next/link";
import { clinicLocations } from "@/models/ClinicModel";
import { services } from "@/models/ServiceModel";
import { FC, useMemo, useState, useCallback } from "react";
import { doctors } from "@/models/DoctorModel";
import useCurrentUser from "@/hooks/useCurrentUser";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import useFertiSmartAppointment from "@/hooks/useFertiSmartAppointment";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import LoadingPage from "../loading";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getDoctorName } from "@/lib/getDoctorName";
import { toast } from "sonner";

export const PageContent: FC = () => {
  const t = useTranslations("AppointmentConfirmationPage");
  const tServices = useTranslations("ServicesPage");
  const tHomePage = useTranslations("HomePage");
  const tIdTypes = useTranslations("idTypes");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointmentId");
  const selectedVisitType = searchParams.get("visitType") || searchParams.get("selectedVisitType") || "-";
  const selectedDoctor = searchParams.get("selectedDoctor") || "-";
  const selectedService = searchParams.get("selectedService") || "-";
  const selectedClinicLocation = searchParams.get("selectedClinicLocation") || "-";

  const [copied, setCopied] = useState(false);

  const handleCopyConfirmation = useCallback(async () => {
    if (!appointmentId) return;
    try {
      await navigator.clipboard.writeText(appointmentId);
      setCopied(true);
      toast.success(t("confirmationCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }, [appointmentId, t]);

  const { data: countriesData, isLoading: loadingCountries } = useFertiSmartCountries();

  const { data: appointmentData, isLoading: loadingAppointment } = useFertiSmartAppointment({ id: appointmentId ?? undefined });

  const { data: currentUserData, isLoading: loadingCurrentUser } = useCurrentUser();

  const { data: patientData, isLoading: loadingPatient, fullName } = useFertiSmartPatient();
  const gender = useMemo(() => {
    return patientData?.sex === 0 ? t("patientInformation.genders.female") : t("patientInformation.genders.male");
  }, [patientData?.sex, t]);

  const idType = useMemo(() => {
    if (!patientData?.identityIdType?.name) return undefined;
    const idTypeName = patientData.identityIdType.name;
    return tIdTypes(idTypeName) || idTypeName;
  }, [patientData?.identityIdType?.name, tIdTypes]);

  const patientCountry = useMemo(
    () => countriesData?.find((item) => item.id === patientData?.nationality?.id),
    [countriesData, patientData?.nationality?.id]
  );

  const idNumber = patientData?.identityId ?? "-";

  const userTimezone = useMemo(() => {
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "UTC";
  }, []);

  const isKSA = userTimezone === "Asia/Riyadh";
  const KSA_TIMEZONE = "Asia/Riyadh";

  const tVisitTypes = useTranslations("visitTypes");

  const dateFnsLocale = useMemo(() => {
    return locale === "ar" ? ar : enUS;
  }, [locale]);

  const selectedTimeSlot = useMemo(() => {
    if (!appointmentData?.time?.start) return "-";
    try {
      return format(appointmentData?.time?.start ?? "", "yyyy-MM-dd hh:mm a", { locale: dateFnsLocale });
    } catch (e) {
      console.log("--- no time slot found error", e);
      return "-";
    }
  }, [appointmentData?.time?.start, dateFnsLocale]);

  const selectedTimeSlotKSA = useMemo(() => {
    if (!appointmentData?.time?.start || isKSA) return null;
    try {
      return formatInTimeZone(appointmentData?.time?.start ?? "", KSA_TIMEZONE, "yyyy-MM-dd hh:mm a", { locale: dateFnsLocale });
    } catch (e) {
      console.log("--- no KSA time slot found error", e);
      return null;
    }
  }, [appointmentData?.time?.start, isKSA, dateFnsLocale]);

  const confirmationNumber = appointmentData?.id;

  const clinic = useMemo(() => clinicLocations.find((clinic) => clinic.id === selectedClinicLocation), [selectedClinicLocation]);

  const clinicName = useMemo(() => {
    if (!clinic?.id) return clinic?.name ?? "-";
    return tHomePage(`clinics.${clinic.id}.name`) || clinic.name;
  }, [clinic?.id, clinic?.name, tHomePage]);

  const service = useMemo(() => services.find((service) => service.id === selectedService), [selectedService]);

  const serviceTitle = useMemo(() => {
    if (!service?.id) return service?.title ?? "-";
    return tServices(`services.${service.id}.title`);
  }, [service?.id, service?.title, tServices]);

  const doctor = useMemo(() => doctors.find((doc) => doc.id === selectedDoctor), [selectedDoctor]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {loadingAppointment || loadingCurrentUser || loadingPatient || loadingCountries ? (
        <LoadingPage />
      ) : (
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-bnoon-teal/10 rounded-full flex items-center justify-center border-2 border-bnoon-teal">
                <Check className="h-8 w-8 text-bnoon-teal" strokeWidth={3} />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-bnoon-gray dark:text-white mb-4">{t("title")}</h1>
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

          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-200">
            {/* Appointment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-bnoon-gray dark:text-white mb-6 flex items-center gap-3">
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
                  <span className="font-semibold text-bnoon-navy dark:text-white capitalize">{tVisitTypes(selectedVisitType)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.doctor")}</span>
                  <span className="font-semibold text-bnoon-navy dark:text-white">{getDoctorName(doctor, locale)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.service")}</span>
                  <span className="font-semibold text-bnoon-navy dark:text-white">{serviceTitle}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t("appointmentDetails.location")}</span>
                  <span className="font-semibold text-bnoon-navy dark:text-white">{clinicName}</span>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-bnoon-gray dark:text-white mb-6 flex items-center gap-3">
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
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("patientInformation.mobileNumber")}
                  </span>
                  <span dir="ltr" className="font-semibold text-bnoon-navy dark:text-white">
                    {currentUserData?.contactNumber}
                  </span>
                </div>
                {patientCountry?.name && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t("patientInformation.nationality")}
                    </span>
                    <span className="font-semibold text-bnoon-navy">{patientCountry?.name ?? "-"}</span>
                  </div>
                )}
                {idType || idNumber ? (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {idType}
                    </span>
                    <span className="font-semibold text-bnoon-navy dark:text-white">{idNumber}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 animate-fade-in-up animation-delay-300">
            <h3 className="text-lg font-bold text-bnoon-gray dark:text-white mb-4">{t("nextSteps.title")}</h3>

            {/* General confirmation message - varies by visit type */}
            <div className="p-4 bg-gradient-to-r from-bnoon-teal/10 to-cyan-500/10 dark:from-bnoon-teal/20 dark:to-cyan-500/20 rounded-xl border border-bnoon-teal/20 dark:border-bnoon-teal/30 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="w-2 h-2 bg-bnoon-teal rounded-full mt-1.5 flex-shrink-0" />
                {selectedVisitType === "virtual"
                  ? t("nextSteps.confirmationMessageVirtual")
                  : t("nextSteps.confirmationMessageClinic")}
              </p>
            </div>

            {/* Show tips based on visit type */}
            {selectedVisitType === "virtual" ? (
              <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <Video className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">{t("nextSteps.virtualTitle")}</h4>
                </div>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    {t("nextSteps.virtualTip1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    {t("nextSteps.virtualTip2")}
                  </li>
                </ul>
              </div>
            ) : (
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
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-400">
            <Link href="/manage-appointments">
              <Button size="lg" className="px-8">
                <CalendarDays className="h-4 w-4" />
                {t("buttons.manageAppointments")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
