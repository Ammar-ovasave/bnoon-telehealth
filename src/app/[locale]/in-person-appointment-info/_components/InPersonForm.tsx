"use client";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import { useTranslations } from "next-intl";

interface FormData {
  fullName: string;
}

interface FormErrors {
  fullName?: string;
}

interface InPersonFormProps {
  defaultValus: FormData;
}

export default function InPersonForm({ defaultValus }: InPersonFormProps) {
  const t = useTranslations("InPersonAppointmentInfoPage");
  const { data: patientData } = useFertiSmartPatient();

  // Check if user is registered (has existing profile with name)
  // Registered users should not be able to edit their name
  const isRegisteredUser = useMemo(() => {
    const hasName = !!(patientData?.firstName && patientData.firstName !== "-");
    return hasName;
  }, [patientData?.firstName]);

  const [formData, setFormData] = useState<FormData>(defaultValus);
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
  }, [formData.fullName, t]);

  // Navigate to review page with all necessary params
  const handleContinueToReview = useCallback(() => {
    if (validateForm) {
      return toast.error(validateForm);
    }

    // Build URL with all existing params plus the new form data
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("fullName", formData.fullName);
    newSearchParams.set("visitType", "clinic");

    router.push(`/review-appointment?${newSearchParams.toString()}`);
  }, [validateForm, searchParams, formData.fullName, router]);

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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
          <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
            <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
            disabled={!formData.fullName}
          >
            {t("buttons.confirm")} <ArrowRight className="rtl:scale-x-[-1]" />
          </Button>
        </div>
      </div>
    </form>
  );
}
