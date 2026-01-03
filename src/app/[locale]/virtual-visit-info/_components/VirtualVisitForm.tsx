"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Mail, Globe, Users, CreditCard, Lock, Camera } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import useFertiSmartIDTypes from "@/hooks/useFertiSmartIDTypes";
import { useTranslations } from "next-intl";
import IDPhotoUpload from "@/components/IDPhotoUpload";
import useCurrentUser from "@/hooks/useCurrentUser";

interface FormData {
  fullName: string;
  email: string;
  nationality: string;
  gender: "male" | "female";
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
  const { nationalities } = useFertiSmartCountries();
  const { data: patientData } = useFertiSmartPatient();
  const { data: currentUserData } = useCurrentUser();

  // ID Document upload state
  const [idDocumentUrl, setIdDocumentUrl] = useState<string>("");
  const [idDocumentFileName, setIdDocumentFileName] = useState<string>("");

  // Generate a unique session ID for temp file uploads
  const [uploadSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const existingSessionId = sessionStorage.getItem("uploadSessionId");
      if (existingSessionId) return existingSessionId;
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("uploadSessionId", newSessionId);
      return newSessionId;
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  // Check if user is registered (has existing profile with identity data)
  // Registered users should not be able to edit their identity fields
  const isRegisteredUser = useMemo(() => {
    return !!(
      patientData?.identityId &&
      patientData?.nationality?.name &&
      patientData?.sex !== undefined
    );
  }, [patientData?.identityId, patientData?.nationality?.name, patientData?.sex]);

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
  const router = useRouter();
  const searchParams = useSearchParams();

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
    // ID document photo is required
    if (!idDocumentUrl) {
      return t("errors.idDocumentRequired");
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
    idDocumentUrl,
    t,
  ]);

  // Navigate to review page with all necessary params
  const handleContinueToReview = useCallback(() => {
    if (validateForm) {
      return toast.error(validateForm);
    }

    // Store ID document info in sessionStorage (cannot pass via URL params)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("idDocumentUrl", idDocumentUrl);
      sessionStorage.setItem("idDocumentFileName", idDocumentFileName);
    }

    // Build URL with all existing params plus the new form data
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("fullName", formData.fullName);
    newSearchParams.set("email", formData.email);
    newSearchParams.set("nationality", formData.nationality);
    newSearchParams.set("gender", formData.gender);
    newSearchParams.set("idType", formData.idType ?? "");
    newSearchParams.set("idTypeName", selectedIdType?.name ?? "");
    newSearchParams.set("idNumber", formData.idNumber);
    newSearchParams.set("visitType", "virtual");

    router.push(`/review-appointment?${newSearchParams.toString()}`);
  }, [
    validateForm,
    searchParams,
    formData.fullName,
    formData.email,
    formData.nationality,
    formData.gender,
    formData.idType,
    formData.idNumber,
    selectedIdType?.name,
    idDocumentUrl,
    idDocumentFileName,
    router,
  ]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleContinueToReview();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Registered user notice */}
        {isRegisteredUser && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t("registeredUserNotice.message")}
                </p>
                <a
                  href="mailto:info@bnoon.sa"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1 inline-block"
                >
                  {t("registeredUserNotice.contactSupport")}
                </a>
              </div>
            </div>
          </div>
        )}

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
              disabled={isRegisteredUser}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600",
                isRegisteredUser && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
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
              disabled={isRegisteredUser}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.nationality ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600",
                isRegisteredUser && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
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
                  disabled={isRegisteredUser}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!isRegisteredUser) {
                      handleInputChange("gender", gender.id);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                    formData.gender === gender.id
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary",
                    isRegisteredUser && "cursor-not-allowed opacity-75"
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
                  disabled={isRegisteredUser}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!isRegisteredUser) {
                      handleInputChange("idType", idType.id?.toString() ?? "");
                    }
                  }}
                  className={cn(
                    "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                    formData.idType === idType.id?.toString()
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary",
                    isRegisteredUser && "cursor-not-allowed opacity-75"
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
              disabled={isRegisteredUser}
              placeholder={
                selectedIdType?.name?.toLocaleLowerCase().includes("passport")
                  ? t("placeholders.passportNumber")
                  : isSaudiNational
                  ? t("placeholders.nationalIdNumber")
                  : t("placeholders.idNumber")
              }
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                errors.idNumber ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600",
                isRegisteredUser && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
              )}
            />
            {errors.idNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idNumber}</p>}
          </div>

          {/* ID Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-gray-500" />
                {t("labels.idDocument")} *
              </div>
            </label>
            <IDPhotoUpload
              sessionId={uploadSessionId}
              onUploadComplete={(url, fileName) => {
                setIdDocumentUrl(url);
                setIdDocumentFileName(fileName);
              }}
              onUploadRemove={() => {
                setIdDocumentUrl("");
                setIdDocumentFileName("");
              }}
              uploadedUrl={idDocumentUrl}
              uploadedFileName={idDocumentFileName}
              disabled={isRegisteredUser}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t("idUpload.helper")}
            </p>
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
              !formData.fullName ||
              !formData.email ||
              !formData.nationality ||
              !formData.gender ||
              !formData.idType ||
              !formData.idNumber ||
              !idDocumentUrl
            }
            size="lg"
            className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
          >
            {t("buttons.confirm")} <ArrowRight className="rtl:scale-x-[-1]" />
          </Button>
        </div>
      </div>
    </form>
  );
}
