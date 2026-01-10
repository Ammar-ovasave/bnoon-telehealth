"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  FileText,
  Camera,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatInTimeZone } from "date-fns-tz";
import { parseISO, addMinutes } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import Image from "next/image";
import { toast } from "sonner";

import useCurrentUser from "@/hooks/useCurrentUser";
import useDoctorByResourceId from "@/hooks/useDoctorByResourceId";

import { createAppointment, updateBnoonUser } from "@/services/client";
import { ClinicBranchID } from "@/models/ClinicModel";
import { services } from "@/models/ServiceModel";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import { getServiceSlug } from "@/lib/serviceMapping";
import { PaymentSummary } from "@/components/payment/PaymentSummary";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { PendingAppointmentData } from "@/models/PaymentModel";

const KSA_TIMEZONE = "Asia/Riyadh";

export function PageContent() {
  const t = useTranslations("ReviewAppointmentPage");
  const tGenders = useTranslations("VirtualVisitInfoPage.genders");
  const tServices = useTranslations("ServicesPage.services");
  const tClinics = useTranslations("HomePage.clinics");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string>("");
  const [idDocumentFileName, setIdDocumentFileName] = useState<string>("");
  const [idDocumentExpired, setIdDocumentExpired] = useState(false);

  // Get all URL params
  // Note: selectedDoctor param contains the resourceId (numeric) from the doctors page
  const resourceId = searchParams.get("selectedDoctor") ?? "";
  // selectedService contains the numeric FertiSmart service ID from APIServiceCard
  const fertiSmartServiceId = searchParams.get("selectedService") ?? "";
  const selectedServiceSlug = searchParams.get("selectedServiceCode") ?? "";
  const selectedTimeSlot = decodeURIComponent(searchParams.get("selectedTimeSlot") ?? "");
  const visitType = searchParams.get("visitType") as "clinic" | "virtual";
  const branchId = searchParams.get("selectedClinicLocation") ?? "";

  // Retrieve ID document from sessionStorage and verify it exists (for virtual visits)
  useEffect(() => {
    async function checkIdDocument() {
      if (visitType === "virtual" && typeof window !== "undefined") {
        const storedUrl = sessionStorage.getItem("idDocumentUrl");
        const storedFileName = sessionStorage.getItem("idDocumentFileName");

        if (storedUrl && storedFileName) {
          // Verify the file still exists in storage
          try {
            const response = await fetch(`/api/upload-id-document?url=${encodeURIComponent(storedUrl)}`);
            const data = await response.json();

            if (data.exists) {
              setIdDocumentUrl(storedUrl);
              setIdDocumentFileName(storedFileName);
            } else {
              // File expired - clear sessionStorage and show warning
              sessionStorage.removeItem("idDocumentUrl");
              sessionStorage.removeItem("idDocumentFileName");
              sessionStorage.removeItem("uploadSessionId");
              setIdDocumentExpired(true);
            }
          } catch {
            // On error, still try to show the document
            setIdDocumentUrl(storedUrl);
            setIdDocumentFileName(storedFileName);
          }
        }
      }
    }
    checkIdDocument();
  }, [visitType]);
  const fullName = decodeURIComponent(searchParams.get("fullName") ?? "");
  const email = decodeURIComponent(searchParams.get("email") ?? "");
  const nationality = decodeURIComponent(searchParams.get("nationality") ?? "");
  const nationalityId = searchParams.get("nationalityId") ?? "";
  const gender = searchParams.get("gender") as "male" | "female" | null;
  const idType = searchParams.get("idType") ?? "";
  const idTypeName = decodeURIComponent(searchParams.get("idTypeName") ?? "");
  const idNumber = decodeURIComponent(searchParams.get("idNumber") ?? "");

  // Hooks
  const { data: currentUserData, mutate: mutateCurrentUser } = useCurrentUser();

  // Fetch doctor details using resourceId from bnoon-api
  const { doctor } = useDoctorByResourceId({
    branchId: branchId || null,
    resourceId: resourceId || null,
  });

  // Parse IDs as numbers for API calls
  const resourceIdNumber = resourceId ? parseInt(resourceId, 10) : 0;
  const serviceIdNumber = fertiSmartServiceId ? parseInt(fertiSmartServiceId, 10) : 0;
  const nationalityIdNumber = nationalityId ? parseInt(nationalityId, 10) : undefined;

  // Get service from static data for display (convert code to slug for lookup)
  const selectedService = useMemo(() => {
    const serviceSlug = getServiceSlug(selectedServiceSlug);
    return services.find((item) => item.id === serviceSlug);
  }, [selectedServiceSlug]);

  // Prepare appointment data for payment (virtual visits only)
  // Uses the new bnoon-api format (no MRN required, patient created internally)
  const pendingAppointmentData: PendingAppointmentData | null = useMemo(() => {
    if (visitType !== "virtual") return null;
    if (!currentUserData || !branchId || !serviceIdNumber) {
      return null;
    }

    return {
      branchId: branchId as ClinicBranchID,
      serviceId: serviceIdNumber,
      resourceId: resourceIdNumber,
      startTime: selectedTimeSlot,
      endTime: addMinutes(selectedTimeSlot, VISIT_DURATION_IN_MINUTES).toISOString(),
      visitType: "virtual",
      fullName,
      email,
      sex: gender === "female" ? 0 : 1,
      nationalityId: nationalityIdNumber,
      identityIdType: Number(idType) || undefined,
      identityId: idNumber || undefined,
    };
  }, [
    visitType,
    currentUserData,
    branchId,
    serviceIdNumber,
    resourceIdNumber,
    selectedTimeSlot,
    fullName,
    email,
    gender,
    nationalityIdNumber,
    idType,
    idNumber,
  ]);

  // Format date and time
  const dateObj = selectedTimeSlot ? parseISO(selectedTimeSlot) : new Date();
  const formattedDate = formatInTimeZone(dateObj, KSA_TIMEZONE, "EEEE, d MMMM yyyy", {
    locale: isArabic ? ar : enUS,
  });
  const formattedTime = formatInTimeZone(dateObj, KSA_TIMEZONE, "h:mm a", {
    locale: isArabic ? ar : enUS,
  });

  // Display name from fetched doctor data
  const doctorDisplayName = doctor?.name ?? "";

  const handleBack = () => {
    // Navigate back to the form page with all current data preserved
    const formPath = visitType === "virtual" ? "virtual-visit-info" : "in-person-appointment-info";
    const editParams = new URLSearchParams();

    // Preserve appointment selection params
    editParams.set("selectedDoctor", resourceId);
    if (branchId) editParams.set("selectedClinicLocation", branchId);
    // selectedService = numeric FertiSmart ID, selectedServiceCode = code like API001
    if (fertiSmartServiceId) editParams.set("selectedService", fertiSmartServiceId);
    if (selectedServiceSlug) editParams.set("selectedServiceCode", selectedServiceSlug);
    editParams.set("selectedTimeSlot", selectedTimeSlot);
    // Derive selectedDate from selectedTimeSlot for back navigation
    if (selectedTimeSlot) {
      const dateMatch = selectedTimeSlot.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        editParams.set("selectedDate", dateMatch[1]);
      }
    }
    editParams.set("visitType", visitType);
    editParams.set("selectedVisitType", visitType); // Also set selectedVisitType for back navigation

    // Preserve form data so user can edit
    if (fullName) editParams.set("fullName", fullName);
    if (email) editParams.set("email", email);
    if (nationality) editParams.set("nationality", nationality);
    if (nationalityId) editParams.set("nationalityId", nationalityId);
    if (gender) editParams.set("gender", gender);
    if (idType) editParams.set("idType", idType);
    if (idTypeName) editParams.set("idTypeName", idTypeName);
    if (idNumber) editParams.set("idNumber", idNumber);

    router.push(`/${locale}/${formPath}?${editParams.toString()}`);
  };

  // Display phone from current user (user should be registered by now)
  const displayPhone = currentUserData?.phone ?? "";

  const handleConfirm = useCallback(async () => {
    // User should always be authenticated at this point (registered in patient info form)
    if (!currentUserData) {
      return toast.error(t("errors.somethingWentWrong"));
    }
    if (!serviceIdNumber) {
      return toast.error(t("errors.somethingWentWrong"));
    }
    if (!branchId) {
      return toast.error(t("errors.somethingWentWrong"));
    }

    setLoading(true);
    try {
      const isVirtualVisit = visitType === "virtual";

      // Update user profile with name from form
      const splitName = fullName.split(" ");
      const patientName = {
        firstName: splitName[0] || "",
        middleName: splitName.length > 2 ? splitName.slice(1, -1).join(" ") : "",
        lastName: splitName.length > 1 ? splitName[splitName.length - 1] : "",
      };

      await updateBnoonUser({
        firstName: patientName.firstName,
        middleName: patientName.middleName,
        lastName: patientName.lastName,
      });

      // Create appointment via bnoon-api
      // Note: Patient creation is handled internally by bnoon-api
      const createAppointmentResponse = await createAppointment({
        branchId: branchId as ClinicBranchID,
        serviceId: serviceIdNumber,
        resourceId: resourceIdNumber,
        startTime: selectedTimeSlot,
        endTime: addMinutes(selectedTimeSlot, VISIT_DURATION_IN_MINUTES).toISOString(),
        visitType: isVirtualVisit ? "virtual" : "in-person",
        fullName,
        email: isVirtualVisit ? email : undefined,
        sex: isVirtualVisit ? (gender === "female" ? 0 : 1) : 0,
        nationalityId: isVirtualVisit ? nationalityIdNumber : undefined,
        identityIdType: isVirtualVisit ? Number(idType) : undefined,
        identityId: isVirtualVisit ? idNumber : undefined,
      });

      if (!createAppointmentResponse?.success || !createAppointmentResponse?.appointment?.appointmentId) {
        console.log("could not create appointment", createAppointmentResponse);
        return toast.error(t("errors.somethingWentWrong"));
      }

      mutateCurrentUser();

      // Clear ID document from sessionStorage after successful submission
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("idDocumentUrl");
        sessionStorage.removeItem("idDocumentFileName");
        sessionStorage.removeItem("uploadSessionId");
      }

      const newSearchParams = new URLSearchParams(searchParams.toString());
      // Pass UUID (id) not FertiSmart appointmentId - the confirmation page uses UUID to fetch details
      newSearchParams.append("appointmentId", createAppointmentResponse.appointment.id);
      router.replace(`/appointment-confirmation?${newSearchParams.toString()}`);
    } catch (e) {
      console.log("--- create appointment error", e);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [
    currentUserData,
    branchId,
    serviceIdNumber,
    t,
    fullName,
    visitType,
    email,
    resourceIdNumber,
    selectedTimeSlot,
    idNumber,
    gender,
    nationalityIdNumber,
    idType,
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

      <div className="relative mx-auto max-w-2xl lg:max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-[#004e77] rounded-2xl flex items-center justify-center shadow-lg shadow-[#004e77]/20">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mb-3 text-2xl sm:text-3xl font-bold text-bnoon-navy dark:text-white">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-md mx-auto">{t("description")}</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Doctor Section */}
          {doctor && (
            <div className="flex items-center gap-4 p-6 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 border-b border-bnoon-teal/10 dark:border-bnoon-teal/20">
              {doctor.photoUrl && (
                <Image
                  src={doctor.photoUrl}
                  alt={doctorDisplayName}
                  width={72}
                  height={72}
                  className="rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-bnoon-navy dark:text-white text-lg">{doctorDisplayName}</h3>
                {doctor.specialty && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {doctor.specialty}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Two-column grid for Appointment + Patient Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
            {/* Appointment Details */}
            <div className="p-6">
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
                {visitType === "clinic" && branchId && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bnoon-teal/10 dark:bg-bnoon-teal/20">
                      <MapPin className="h-5 w-5 text-bnoon-teal" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t("location")}</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tClinics(`${branchId}.name`)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tClinics(`${branchId}.address`)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Information */}
            <div className="p-6">
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
                  <p className="font-medium text-gray-900 dark:text-white ltr">
                    {displayPhone}
                  </p>
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

              {/* ID Document (for virtual visits) */}
              {visitType === "virtual" && idDocumentUrl && idDocumentFileName && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                    {idDocumentFileName.toLowerCase().endsWith(".pdf") ? (
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t("idDocument")}</span>
                    {idDocumentFileName.toLowerCase().endsWith(".pdf") ? (
                      <a
                        href={idDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium text-bnoon-teal hover:text-bnoon-teal/80 transition-colors truncate"
                      >
                        {idDocumentFileName}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-1 font-medium text-bnoon-teal hover:text-bnoon-teal/80 transition-colors truncate text-start"
                          >
                            {idDocumentFileName}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{t("idDocument")}</DialogTitle>
                          </DialogHeader>
                          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={idDocumentUrl}
                              alt={idDocumentFileName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              )}

              {/* Expired ID Document Warning */}
              {visitType === "virtual" && idDocumentExpired && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {t("idDocumentExpired.title")}
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        {t("idDocumentExpired.message")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

        </div>

        {/* Payment Summary (Virtual Visits Only) */}
        {visitType === "virtual" && selectedService && (
          <div className="mt-8">
            <PaymentSummary
              serviceName={tServices(`${selectedService.id}.title`)}
              price={selectedService.price}
              currency={selectedService.currency}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8">
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

          {/* Virtual visits require payment */}
          {visitType === "virtual" && selectedService && pendingAppointmentData ? (
            <div className="flex-1">
              <PaymentButton
                amount={selectedService.price}
                currency={selectedService.currency}
                email={email}
                fullName={fullName}
                phoneNumber={displayPhone}
                appointmentData={pendingAppointmentData}
                disabled={loading || !pendingAppointmentData}
                onPaymentStarted={() => setLoading(true)}
              />
            </div>
          ) : (
            /* Clinic visits - direct confirmation (payment at clinic) */
            <Button
              size="lg"
              onClick={handleConfirm}
              className="flex-1"
              disabled={loading}
            >
              {loading ? t("buttons.confirming") : t("buttons.confirm")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
