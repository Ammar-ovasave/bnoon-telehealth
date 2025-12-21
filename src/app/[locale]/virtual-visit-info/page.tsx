"use client";
import { User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import VirtualVisitForm from "./_components/VirtualVisitForm";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import useFertiSmartIDTypes from "@/hooks/useFertiSmartIDTypes";
import { useTranslations } from "next-intl";

export default function VirtualVisitInfoPage() {
  const { isLoading, fullName: currentUserFullName, data: currentUserData } = useCurrentUser();
  const { isLoading: loadingPatientData, fullName, data: patientData } = useFertiSmartPatient();
  const { isLoading: loadingCountries, nationalities } = useFertiSmartCountries();
  const { isLoading: loadingIdTypes } = useFertiSmartIDTypes();
  const t = useTranslations("VirtualVisitInfoPage");

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto px-4 py-8 max-w-2xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl rtl:text-3xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="ltr:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
        </div>
        {/* Form */}
        {isLoading || loadingPatientData || loadingCountries || loadingIdTypes ? (
          <div className="flex justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <VirtualVisitForm
            defaultValues={{
              fullName: fullName || currentUserFullName || "",
              email: patientData?.emailAddress || currentUserData?.emailAddress || "",
              gender: patientData?.sex === 1 ? "male" : "female",
              idNumber: patientData?.identityId ?? "",
              idType: patientData?.identityIdType?.id?.toString(),
              nationality: patientData?.nationality?.name
                ? nationalities?.find((item) => item === patientData?.nationality?.name) ?? ""
                : "",
            }}
          />
        )}
        {/* Information Notice */}
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mt-0.5">
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">{t("privacy.title")}</h4>
              <p className="text-sm text-green-700 dark:text-green-300">{t("privacy.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
