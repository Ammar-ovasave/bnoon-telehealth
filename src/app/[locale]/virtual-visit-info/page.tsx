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
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto px-4 py-8 max-w-2xl pb-30">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <div className="bg-bnoon-navy/10 dark:bg-bnoon-navy/20 p-4 rounded-2xl">
              <User className="h-8 w-8 text-bnoon-navy dark:text-bnoon-teal" />
            </div>
          </div>
          <h1 className="text-4xl rtl:text-3xl font-bold text-bnoon-navy dark:text-white mb-4">{t("title")}</h1>
          <p className="ltr:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
        </div>
        {/* Form */}
        {isLoading || loadingPatientData || loadingCountries || loadingIdTypes ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="w-16 h-16 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center mb-4">
              <Spinner className="w-8 h-8 text-bnoon-teal" />
            </div>
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
        <div className="mt-6 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-2xl p-4 border border-bnoon-teal/20 dark:border-bnoon-teal/30">
          <div className="flex items-start gap-3">
            <div className="bg-bnoon-teal/10 dark:bg-bnoon-teal/20 p-2 rounded-xl mt-0.5">
              <User className="h-4 w-4 text-bnoon-teal" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-bnoon-teal mb-1">{t("privacy.title")}</h4>
              <p className="text-sm text-bnoon-navy dark:text-gray-300">{t("privacy.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
