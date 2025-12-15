"use client";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import InPersonForm from "./_components/InPersonForm";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

export default function InPersonAppointmentInfoPage() {
  const t = useTranslations("InPersonAppointmentInfoPage");
  const { isLoading } = useCurrentUser();
  const { isLoading: loadingPatientData, fullName } = useFertiSmartPatient();
  const { isLoading: loadingCountries } = useFertiSmartCountries();
  console.log("initial fullName", isLoading, loadingCountries, loadingPatientData, fullName);

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/15 p-3 rounded-full">
              <Image src={`/icons/Location1.png`} alt={t("title")} width={50} height={50} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
        </div>

        {/* Form */}
        {isLoading || loadingPatientData || loadingCountries ? (
          <div className="flex justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <InPersonForm defaultValus={{ fullName }} />
        )}

        {/* Visit Information */}
        <div className="mt-6 bg-primary/5 rounded-lg p-4 border border-primary">
          <div className="flex items-start gap-3">
            <div className="bg-primary/15 p-1 rounded-full mt-0.5">
              <Image src={`/icons/Location1.png`} alt={t("visitDetails.title")} width={25} height={25} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">{t("visitDetails.title")}</h4>
              <p className="text-sm text-primary">{t("visitDetails.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
