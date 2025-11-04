"use client";
import { User } from "lucide-react";
import VirtualVisitForm from "./_components/VirtualVisitForm";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Spinner } from "@/components/ui/spinner";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";

export default function VirtualVisitInfoPage() {
  const { isLoading, data: currentUserData } = useCurrentUser();
  const { isLoading: loadingPatientData } = useFertiSmartPatient({ mrn: currentUserData?.mrn });
  const { isLoading: loadingCountries } = useFertiSmartCountries();

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Personal Information</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Please provide your personal information to complete your virtual visit booking. This information helps us provide you
            with the best possible care.
          </p>
        </div>
        {/* Form */}
        {isLoading || loadingPatientData || loadingCountries ? (
          <div className="flex justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <VirtualVisitForm />
        )}
        {/* Information Notice */}
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mt-0.5">
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Privacy & Security</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your personal information is encrypted and stored securely. We only use this information to provide you with
                healthcare services and will never share it with third parties without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
