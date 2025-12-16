"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Mail, Globe, Users, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { createAppointment, getCurrentUser, updatePatient } from "@/services/client";
import useFertiSmartAppointmentStatuses from "@/hooks/useFertiSmartAppointmentStatuses";
import useFertiSmartBranches from "@/hooks/useFertiSmartBranches";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { addMinutes } from "date-fns";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import { doctors } from "@/models/DoctorModel";
import useFertiSmartIDTypes from "@/hooks/useFertiSmartIDTypes";
import { services } from "@/models/ServiceModel";
import { containsArabic } from "@/services/containsArabic";
import { useTranslations } from "next-intl";

interface FormData {
  fullName: string;
  email: string;
  nationality: string;
  gender: string;
  idType?: string;
  idNumber: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  nationality?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
}

function isOnlyDigits(str: string) {
  return /^[0-9]+$/.test(str);
}

interface VirtualVisitFormProps {
  defaultValues: FormData;
}

export default function VirtualVisitForm({ defaultValues }: VirtualVisitFormProps) {
  const t = useTranslations("VirtualVisitInfoPage");
  const tIdTypes = useTranslations("idTypes");
  const { data: currentUserData, mutate: mutateCurrentUser } = useCurrentUser();
  const { nationalities, data: nationalitiesData } = useFertiSmartCountries();
  const { data: patientData, mutate: mutatePatient } = useFertiSmartPatient();

  const genders = [
    { id: "male", label: t("genders.male") },
    { id: "female", label: t("genders.female") },
  ];
  const [formData, setFormData] = useState<FormData>(defaultValues);

  const isSaudiNational = formData.nationality === "Saudi Arabia";

  const { data: idTypeDataList } = useFertiSmartIDTypes();

  const selectedIdType = useMemo(
    () => idTypeDataList?.find((type) => type.id?.toString() === formData.idType),
    [formData.idType, idTypeDataList]
  );

  const didSelectIqamaNo = useMemo(() => selectedIdType?.name?.toLocaleLowerCase().includes("iqama no"), [selectedIdType?.name]);

  const idTypeData = useMemo(() => {
    if (isSaudiNational) {
      return idTypeDataList?.filter((type) => type.name?.toLocaleLowerCase().includes("national id"));
    }
    return idTypeDataList?.filter((type) => !type.name?.toLocaleLowerCase().includes("national id"));
  }, [idTypeDataList, isSaudiNational]);

  useEffect(() => {
    if (isSaudiNational) {
      setFormData((val) => {
        return {
          ...val,
          idType: idTypeDataList?.find((type) => type.name?.toLocaleLowerCase().includes("national id"))?.id?.toString(),
        };
      });
    } else {
      setFormData((val) => {
        return {
          ...val,
          idType: patientData?.identityIdType?.id?.toString(),
        };
      });
    }
  }, [idTypeDataList, isSaudiNational, patientData?.identityIdType?.id]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = useMemo((): string | undefined => {
    if (!formData.fullName.trim()) {
      return t("errors.fullNameRequired");
    } else if (formData.fullName.trim().length < 2) {
      return t("errors.fullNameMinLength");
    }
    if (!formData.email.trim()) {
      return t("errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return t("errors.emailInvalid");
    }
    if (!formData.nationality) {
      return t("errors.nationalityRequired");
    }
    if (!formData.gender) {
      return t("errors.genderRequired");
    }
    if (!formData.idType) {
      return t("errors.idTypeRequired");
    }
    if (!formData.idNumber.trim()) {
      return t("errors.idNumberRequired");
    }
    if (isSaudiNational) {
      if (!formData.idNumber.startsWith("1")) {
        return t("errors.nationalIdStartWith1");
      } else if (!isOnlyDigits(formData.idNumber.trim())) {
        return t("errors.nationalIdDigitsOnly");
      } else if (formData.idNumber.trim().length !== 10) {
        return t("errors.nationalIdLength");
      }
    }
    if (didSelectIqamaNo) {
      if (!formData.idNumber.startsWith("2")) {
        return t("errors.iqamaStartWith2");
      } else if (!isOnlyDigits(formData.idNumber.trim())) {
        return t("errors.iqamaDigitsOnly");
      } else if (formData.idNumber.trim().length !== 10) {
        return t("errors.iqamaLength");
      }
    }
  }, [
    formData.fullName,
    formData.email,
    formData.nationality,
    formData.gender,
    formData.idType,
    formData.idNumber,
    isSaudiNational,
    didSelectIqamaNo,
    t,
  ]);

  const { data: statusesData } = useFertiSmartAppointmentStatuses();
  const { data: branchesData } = useFertiSmartBranches();
  const { data: apiServicesData } = useFertiSmartAPIServices();
  const { data: fertiSmartResources } = useFertiSmartResources();

  const searchParams = useSearchParams();
  const isVirtualVisit = searchParams.get("selectedVisitType") === "virtual";
  const selectedTimeSlot = decodeURIComponent(searchParams.get("selectedTimeSlot") ?? "");
  const selectedDoctorId = decodeURIComponent(searchParams.get("selectedDoctor") ?? "");
  const selectedServiceId = decodeURIComponent(searchParams.get("selectedService") ?? "");

  const selectedFertiSmartService = useMemo(() => {
    const serviceName = services.find((item) => item.id === selectedServiceId)?.title.toLocaleLowerCase() ?? "";
    const fertiSmartService = apiServicesData?.find((item) => item.name?.toLocaleLowerCase().includes(serviceName));
    if (fertiSmartService) return fertiSmartService;
    return apiServicesData?.[0];
  }, [apiServicesData, selectedServiceId]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => doc.id === selectedDoctorId);
  }, [selectedDoctorId]);

  const selectedResource = useMemo(() => {
    return fertiSmartResources?.find((resource) => {
      return resource.linkedUserFullName?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? "");
    });
  }, [fertiSmartResources, selectedDoctor?.name]);

  const handleFormSubmit = useCallback(async () => {
    if (validateForm) {
      console.log("invalid data");
      return toast.error(validateForm);
    }
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
      const splitName = formData.fullName.split(" ");
      const [createAppointmentResponse] = await Promise.all([
        createAppointment({
          firstName: splitName[0],
          middleName: splitName.length > 2 ? splitName[1] : "",
          lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
          phoneNumber: currentUserData.contactNumber ?? "",
          email: formData.email,
          statusId: status.id ?? 0,
          branchId: branchesData?.[0].id ?? 0,
          description: isVirtualVisit ? `Virtual Visit` : ``,
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
      await updatePatient({
        arabicName: containsArabic(formData.fullName) ? formData.fullName : undefined,
        mrn: newCurrentUser?.mrn ?? "",
        emailAddress: formData.email,
        firstName: splitName[0],
        middleName: splitName.length > 2 ? splitName[1] : "",
        lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
        identityId: formData.idNumber,
        nationalityId: nationalitiesData?.find((item) => item.name === formData.nationality)?.id,
        identityIdTypeId: Number(formData.idType),
      });
      mutateCurrentUser(undefined);
      mutatePatient(undefined);
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.append("appointmentId", createAppointmentResponse.id.toString());
      router.replace(`/appointment-confirmation?${newSearchParams.toString()}`);
    } catch (e) {
      console.log("--- create appointment error", e);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [
    apiServicesData?.length,
    branchesData,
    currentUserData?.contactNumber,
    currentUserData?.mrn,
    formData.email,
    formData.fullName,
    formData.idNumber,
    formData.idType,
    formData.nationality,
    isVirtualVisit,
    mutateCurrentUser,
    mutatePatient,
    nationalitiesData,
    router,
    selectedFertiSmartService?.id,
    selectedResource?.id,
    selectedTimeSlot,
    statusesData,
    validateForm,
    t,
  ]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmit();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                {t("labels.fullName")} *
              </div>
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder={t("placeholders.fullName")}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                {t("labels.emailAddress")} *
              </div>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={t("placeholders.emailAddress")}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                {t("labels.nationality")} *
              </div>
            </label>
            <select
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.nationality ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              )}
            >
              <option value="">{t("labels.selectNationality")}</option>
              {nationalities?.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
            {errors.nationality && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nationality}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                {t("labels.gender")} *
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {genders.map((gender) => (
                <button
                  key={gender.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleInputChange("gender", gender.id);
                  }}
                  className={cn(
                    "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                    formData.gender === gender.id
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary"
                  )}
                >
                  {gender.label}
                </button>
              ))}
            </div>
            {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
          </div>

          {/* ID Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                {t("labels.idType")} *
              </div>
            </label>
            <div
              className={cn(
                "grid grid-cols-2 gap-3",
                idTypeData?.length === 3 && "grid-cols-3",
                idTypeData?.length === 4 && "grid-cols-4"
              )}
            >
              {idTypeData?.map((idType) => (
                <button
                  key={idType.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleInputChange("idType", idType.id?.toString() ?? "");
                  }}
                  className={cn(
                    "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                    formData.idType === idType.id?.toString()
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary"
                  )}
                >
                  {tIdTypes(idType.name ?? "") || idType.name}
                </button>
              ))}
            </div>
            {errors.idType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idType}</p>}
          </div>

          {/* ID Number */}
          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                {tIdTypes(selectedIdType?.name ?? "idTypes") || selectedIdType?.name} *
              </div>
            </label>
            <input
              id="idNumber"
              type="text"
              maxLength={didSelectIqamaNo || isSaudiNational ? 10 : undefined}
              value={formData.idNumber}
              onChange={(e) => handleInputChange("idNumber", e.target.value)}
              placeholder={
                selectedIdType?.name?.toLocaleLowerCase().includes("passport")
                  ? t("placeholders.passportNumber")
                  : isSaudiNational
                  ? t("placeholders.nationalIdNumber")
                  : t("placeholders.idNumber")
              }
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.idNumber ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.idNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idNumber}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
          <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
            <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
          </Button>
          <Button
            type="submit"
            disabled={
              loading ||
              !formData.fullName ||
              !formData.email ||
              !formData.nationality ||
              !formData.gender ||
              !formData.idType ||
              !formData.idNumber
            }
            size="lg"
            className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
          >
            {loading ? t("buttons.loading") : t("buttons.confirm")} <ArrowRight className="rtl:scale-x-[-1]" />
          </Button>
        </div>
      </div>
    </form>
  );
}
