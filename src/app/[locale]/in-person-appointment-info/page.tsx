"use client";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import InPersonForm from "./_components/InPersonForm";
import { MapPin } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import BranchGuard from "@/components/BranchGuard";

export default function InPersonAppointmentInfoPage() {
  const t = useTranslations("InPersonAppointmentInfoPage");
  const searchParams = useSearchParams();
  const { isLoading } = useCurrentUser();
  const { isLoading: loadingPatientData, fullName } = useFertiSmartPatient();
  const { isLoading: loadingCountries } = useFertiSmartCountries();

  // Check if we have form data from URL params (coming back from review page)
  const urlFullName = searchParams.get("fullName");

  return (
    <BranchGuard>
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-2xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#004e77] rounded-2xl flex items-center justify-center shadow-lg shadow-[#004e77]/20">
              <MapPin className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl rtl:text-3xl font-bold text-bnoon-navy dark:text-white mb-4">{t("title")}</h1>
          <p className="ltr:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
        </div>

        {/* Form */}
        {isLoading || loadingPatientData || loadingCountries ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="w-16 h-16 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center mb-4">
              <Spinner className="w-8 h-8 text-bnoon-teal" />
            </div>
          </div>
        ) : (
          <InPersonForm defaultValus={{ fullName: urlFullName || fullName }} />
        )}

        {/* Visit Information */}
        <div className="mt-6 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-2xl p-4 border border-bnoon-teal/20 dark:border-bnoon-teal/30">
          <div className="flex items-start gap-3">
            <div className="bg-bnoon-teal/10 dark:bg-bnoon-teal/20 p-2 rounded-xl mt-0.5">
              <MapPin className="w-6 h-6 text-bnoon-teal" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-bnoon-teal mb-1">{t("visitDetails.title")}</h4>
              <p className="text-sm text-bnoon-navy dark:text-gray-300">{t("visitDetails.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </BranchGuard>
  );
}
