"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Mail, Globe, Users, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { clinicLocations } from "@/models/ClinicModel";
import { services } from "@/models/ServiceModel";
import { FC, useMemo } from "react";
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

export const PageContent: FC = () => {
  const t = useTranslations("AppointmentConfirmationPage");
  const tServices = useTranslations("ServicesPage");
  const tHomePage = useTranslations("HomePage");
  const tIdTypes = useTranslations("idTypes");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointmentId");
  const selectedVisitType = searchParams.get("selectedVisitType") || "-";
  const selectedDoctor = searchParams.get("selectedDoctor") || "-";
  const selectedService = searchParams.get("selectedService") || "-";
  const selectedClinicLocation = searchParams.get("selectedClinicLocation") || "-";

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
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      {loadingAppointment || loadingCurrentUser || loadingPatient || loadingCountries ? (
        <LoadingPage />
      ) : (
        <div className="mx-auto px-4 py-8 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
            <div className="mt-4 bg-primary/10 rounded-lg p-4 border border-primary">
              <p className="text-primary font-medium">
                {t("confirmationNumber")}: <span className="font-bold">{confirmationNumber}</span>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Appointment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Image
                  src={"/icons/Calender.png"}
                  alt={t("appointmentDetails.title")}
                  width={40}
                  height={40}
                  className="h-[30px] w-[20px] object-cover"
                />
                {t("appointmentDetails.title")}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t("appointmentDetails.dateTime")}</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTimeSlot}</span>
                    {selectedTimeSlotKSA && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t("appointmentDetails.ksaTime")}: {selectedTimeSlotKSA}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t("appointmentDetails.visitType")}</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{tVisitTypes(selectedVisitType)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t("appointmentDetails.doctor")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{getDoctorName(doctor, locale)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t("appointmentDetails.service")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{serviceTitle}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">{t("appointmentDetails.location")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{clinicName}</span>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t("patientInformation.title")}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("patientInformation.fullName")}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("patientInformation.mobileNumber")}
                  </span>
                  <span dir="ltr" className="font-medium text-gray-900 dark:text-white">
                    {currentUserData?.contactNumber}
                  </span>
                </div>
                {patientCountry?.name && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t("patientInformation.nationality")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{patientCountry?.name ?? "-"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t("patientInformation.gender")}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{gender}</span>
                </div>
                {idType || idNumber ? (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {idType}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{idNumber}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-primary/10 rounded-lg p-6 border border-primary">
            <h3 className="text-lg font-semibold text-primary dark:text-primary mb-3">{t("nextSteps.title")}</h3>
            <div className="space-y-2 text-primary">
              <p>• {t("nextSteps.confirmationMessage")}</p>
              <p>• {t("nextSteps.virtualVisitMessage")}</p>
              <p>• {t("nextSteps.inPersonVisitMessage")}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center sm:flex-row gap-4 justify-center mt-8">
            <Link href="/manage-appointments">
              <Button size="lg" className="px-8 py-3">
                <CalendarDays className="h-4 w-4 mr-2" />
                {t("buttons.manageAppointments")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
