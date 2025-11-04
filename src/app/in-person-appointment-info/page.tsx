"use client";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import { Spinner } from "@/components/ui/spinner";
import InPersonForm from "./_components/InPersonForm";
import { MapPin } from "lucide-react";

export default function InPersonAppointmentInfoPage() {
  const { isLoading, data: currentUserData } = useCurrentUser();
  const { isLoading: loadingPatientData } = useFertiSmartPatient({ mrn: currentUserData?.mrn });
  const { isLoading: loadingCountries } = useFertiSmartCountries();

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <MapPin className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">In-Person Visit Information</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {`Please provide your name to complete your in-person appointment booking. We'll use this information to prepare for your visit.`}
          </p>
        </div>

        {/* Form */}
        {isLoading || loadingPatientData || loadingCountries ? (
          <div className="flex justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <InPersonForm />
        )}

        {/* Visit Information */}
        <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-1 rounded-full mt-0.5">
              <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">In-Person Visit Details</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {`You'll receive a confirmation email. Please arrive 10 minutes before your scheduled appointment time.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
