"use client";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Stethoscope,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Video,
  Building,
  CheckCircle2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatInTimeZone } from "date-fns-tz";
import { parseISO, addMinutes } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import Image from "next/image";
import { toast } from "sonner";

import useCurrentUser from "@/hooks/useCurrentUser";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useFertiSmartAppointmentStatuses from "@/hooks/useFertiSmartAppointmentStatuses";
import useFertiSmartBranches from "@/hooks/useFertiSmartBranches";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";

import { createAppointment, getCurrentUser, updatePatient } from "@/services/client";
import { containsArabic } from "@/services/containsArabic";
import { doctors } from "@/models/DoctorModel";
import { services } from "@/models/ServiceModel";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";

const KSA_TIMEZONE = "Asia/Riyadh";

export function PageContent() {
  const t = useTranslations("ReviewAppointmentPage");
  const tGenders = useTranslations("VirtualVisitInfoPage.genders");
  const tDoctors = useTranslations("DoctorsPage");
  const tServices = useTranslations("InterestPage.services");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);

  // Get all URL params
  const selectedDoctorId = decodeURIComponent(searchParams.get("selectedDoctor") ?? "");
  const selectedServiceId = decodeURIComponent(searchParams.get("selectedService") ?? "");
  const selectedTimeSlot = decodeURIComponent(searchParams.get("selectedTimeSlot") ?? "");
  const visitType = searchParams.get("visitType") as "clinic" | "virtual";
  const fullName = decodeURIComponent(searchParams.get("fullName") ?? "");
  const email = decodeURIComponent(searchParams.get("email") ?? "");
  const nationality = decodeURIComponent(searchParams.get("nationality") ?? "");
  const gender = searchParams.get("gender") as "male" | "female" | null;
  const idType = searchParams.get("idType") ?? "";
  const idTypeName = decodeURIComponent(searchParams.get("idTypeName") ?? "");
  const idNumber = decodeURIComponent(searchParams.get("idNumber") ?? "");

  // Hooks
  const { data: currentUserData, mutate: mutateCurrentUser } = useCurrentUser();
  const { data: branchData } = useCurrentBranch();
  const { data: statusesData } = useFertiSmartAppointmentStatuses();
  const { data: branchesData } = useFertiSmartBranches();
  const { data: apiServicesData } = useFertiSmartAPIServices();
  const { data: fertiSmartResources } = useFertiSmartResources();
  const { data: nationalitiesData } = useFertiSmartCountries();
  const { mutate: mutatePatient } = useFertiSmartPatient();

  // Get selected data
  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => doc.id === selectedDoctorId);
  }, [selectedDoctorId]);

  const selectedService = useMemo(() => {
    return services.find((item) => item.id === selectedServiceId);
  }, [selectedServiceId]);

  const selectedResource = useMemo(() => {
    return fertiSmartResources?.find((resource) => {
      return resource.linkedUserFullName?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? "");
    });
  }, [fertiSmartResources, selectedDoctor?.name]);

  const selectedFertiSmartService = useMemo(() => {
    const serviceName = selectedService?.title.toLocaleLowerCase() ?? "";
    const fertiSmartService = apiServicesData?.find((item) => item.name?.toLocaleLowerCase().includes(serviceName));
    if (fertiSmartService) return fertiSmartService;
    return apiServicesData?.[0];
  }, [apiServicesData, selectedService?.title]);

  // Format date and time
  const dateObj = selectedTimeSlot ? parseISO(selectedTimeSlot) : new Date();
  const formattedDate = formatInTimeZone(dateObj, KSA_TIMEZONE, "EEEE, d MMMM yyyy", {
    locale: isArabic ? ar : enUS,
  });
  const formattedTime = formatInTimeZone(dateObj, KSA_TIMEZONE, "h:mm a", {
    locale: isArabic ? ar : enUS,
  });

  // Display names
  const doctorDisplayName = isArabic && selectedDoctor?.arName ? selectedDoctor.arName : selectedDoctor?.name ?? "";

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = useCallback(async () => {
    if (!currentUserData?.mrn) {
      console.log("--- no current user mrn");
      return toast.error(t("errors.somethingWentWrong"));
    }
    const status = statusesData?.find((item) => item.name === "Approved/Confirmed");
    if (!status) {
      console.log("could not find status");
      return toast.error(t("errors.somethingWentWrong"));
    }
    if (!apiServicesData?.length) {
      console.log("could not find api service");
      return toast.error(t("errors.somethingWentWrong"));
    }
    if (!branchesData?.length) {
      console.log("could not find branch");
      return toast.error(t("errors.somethingWentWrong"));
    }

    setLoading(true);
    try {
      const splitName = fullName.split(" ");
      const isVirtualVisit = visitType === "virtual";

      const [createAppointmentResponse] = await Promise.all([
        createAppointment({
          statusName: status.name ?? "",
          serviceName: selectedFertiSmartService?.name ?? "",
          email: isVirtualVisit ? email : null,
          phoneNumber: currentUserData.contactNumber ?? "",
          firstName: splitName[0],
          lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
          middleName: splitName.length > 2 ? splitName[1] : "",
          statusId: status.id ?? 0,
          branchId: branchesData?.[0].id ?? 0,
          description: isVirtualVisit ? "Virtual Visit" : "In Clinic",
          patientMrn: currentUserData.mrn ?? "",
          serviceId: selectedFertiSmartService?.id ?? 0,
          resourceIds: [selectedResource?.id ?? 0],
          startTime: selectedTimeSlot,
          endTime: addMinutes(selectedTimeSlot, VISIT_DURATION_IN_MINUTES).toISOString(),
        }),
      ]);

      const newCurrentUser = await getCurrentUser();
      if (!newCurrentUser) {
        console.log("no new current user");
        return toast.error(t("errors.somethingWentWrong"));
      }
      if (!createAppointmentResponse?.id) {
        console.log("could not create appointment", createAppointmentResponse);
        return toast.error(t("errors.somethingWentWrong"));
      }

      // Update patient with form data
      if (isVirtualVisit) {
        await updatePatient({
          arabicName: containsArabic(fullName) ? fullName : undefined,
          mrn: newCurrentUser?.mrn ?? "",
          emailAddress: email,
          firstName: splitName[0],
          middleName: splitName.length > 2 ? splitName[1] : "",
          lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
          identityId: idNumber,
          gender: gender === "female" ? 0 : 1,
          nationalityId: nationalitiesData?.find((item) => item.name === nationality)?.id,
          identityIdTypeId: Number(idType),
        });
      } else {
        await updatePatient({
          arabicName: containsArabic(fullName) ? fullName : undefined,
          mrn: currentUserData.mrn,
          firstName: splitName[0],
          middleName: splitName.length > 2 ? splitName[1] : "",
          lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
          gender: 0,
        });
      }

      mutatePatient(undefined);
      mutateCurrentUser(undefined);

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.append("appointmentId", createAppointmentResponse.id.toString());
      router.replace(`/appointment-confirmation?${newSearchParams.toString()}`);
    } catch (e) {
      console.log("--- create appointment error", e);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [
    currentUserData?.mrn,
    currentUserData?.contactNumber,
    statusesData,
    apiServicesData?.length,
    branchesData,
    t,
    fullName,
    visitType,
    email,
    selectedFertiSmartService?.name,
    selectedFertiSmartService?.id,
    selectedResource?.id,
    selectedTimeSlot,
    idNumber,
    gender,
    nationality,
    nationalitiesData,
    idType,
    mutatePatient,
    mutateCurrentUser,
    searchParams,
    router,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in-up">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-bnoon-teal to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-bnoon-teal/20">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mb-3 text-2xl sm:text-3xl font-bold text-bnoon-navy dark:text-white">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-md mx-auto">{t("description")}</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up animation-delay-100">
          {/* Doctor Section */}
          {selectedDoctor && (
            <div className="flex items-center gap-4 p-6 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 border-b border-bnoon-teal/10 dark:border-bnoon-teal/20">
              {selectedDoctor.photo && (
                <Image
                  src={selectedDoctor.photo}
                  alt={doctorDisplayName}
                  width={72}
                  height={72}
                  className="rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-bnoon-navy dark:text-white text-lg">{doctorDisplayName}</h3>
                {selectedDoctor.specialty && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {tDoctors(`doctors.${selectedDoctor.id}.specialty`) || selectedDoctor.specialty}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-bnoon-navy dark:text-white uppercase tracking-wide mb-4">
              {t("appointmentDetails")}
            </h4>

            <div className="space-y-4">
              {/* Service */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20">
                  <Stethoscope className="h-5 w-5 text-bnoon-teal" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("service")}</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedService ? tServices(`${selectedService.id}.title`) : ""}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20">
                  <Calendar className="h-5 w-5 text-bnoon-teal" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("date")}</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20">
                  <Clock className="h-5 w-5 text-bnoon-teal" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("time")}</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formattedTime} <span className="text-xs text-gray-500 dark:text-gray-400">({t("ksaTime")})</span>
                  </p>
                </div>
              </div>

              {/* Visit Type */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20">
                  {visitType === "virtual" ? (
                    <Video className="h-5 w-5 text-bnoon-teal" />
                  ) : (
                    <Building className="h-5 w-5 text-bnoon-teal" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("visitType")}</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {visitType === "virtual" ? t("virtualVisit") : t("clinicVisit")}
                  </p>
                </div>
              </div>

              {/* Location (for clinic visits) */}
              {visitType === "clinic" && branchData?.branch && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20">
                    <MapPin className="h-5 w-5 text-bnoon-teal" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t("location")}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{branchData.branch.name}</p>
                    {branchData.branch.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{branchData.branch.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-bnoon-navy dark:text-white uppercase tracking-wide mb-4">
              {t("patientInformation")}
            </h4>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("fullName")}</span>
                  <p className="font-medium text-gray-900 dark:text-white">{fullName}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("phone")}</span>
                  <p className="font-medium text-gray-900 dark:text-white ltr">{currentUserData?.contactNumber}</p>
                </div>
              </div>

              {/* Email (for virtual visits) */}
              {visitType === "virtual" && email && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                    <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t("email")}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{email}</p>
                  </div>
                </div>
              )}

              {/* Nationality (for virtual visits) */}
              {visitType === "virtual" && nationality && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                    <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t("nationality")}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{nationality}</p>
                  </div>
                </div>
              )}

              {/* Gender (for virtual visits) */}
              {visitType === "virtual" && gender && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t("gender")}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{tGenders(gender)}</p>
                  </div>
                </div>
              )}

              {/* ID Type & Number (for virtual visits) */}
              {visitType === "virtual" && idTypeName && idNumber && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{idTypeName}</span>
                    <p className="font-medium text-gray-900 dark:text-white">{idNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notice */}
          <div className="p-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {visitType === "virtual" ? t("virtualNotice") : t("clinicNotice")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8 animate-fade-in-up animation-delay-200">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" />
            {t("buttons.edit")}
          </Button>
          <Button
            size="lg"
            onClick={handleConfirm}
            className="flex-1"
            disabled={loading}
          >
            {loading ? t("buttons.confirming") : t("buttons.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
