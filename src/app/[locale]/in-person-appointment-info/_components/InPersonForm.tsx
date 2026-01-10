"use client";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import type { CurrentUserType } from "@/models/CurrentUserType";
import useCurrentUser from "@/hooks/useCurrentUser";
import { completeGuestRegistration } from "@/services/client";

interface FormData {
  fullName: string;
}

interface FormErrors {
  fullName?: string;
}

interface InPersonFormProps {
  defaultValus: FormData;
  userData: CurrentUserType | null;
}

export default function InPersonForm({ defaultValus, userData }: InPersonFormProps) {
  const t = useTranslations("InPersonAppointmentInfoPage");
  const locale = useLocale();
  const { data: currentUserData, mutate: mutateCurrentUser } = useCurrentUser();
  console.log({ currentUserData });
  // Submitting state for registration
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is registered (has existing profile with name OR is authenticated)
  // Registered users should not be able to edit their name
  // After completeGuestRegistration(), currentUserData will be populated via mutateCurrentUser()
  const isRegisteredUser = useMemo(() => {
    // User is authenticated (JWT token exists) - they just registered
    const isAuthenticated = !!currentUserData;
    // User has existing profile with name from prop
    const hasNameFromProp = !!(userData?.firstName && userData.firstName !== "-");
    return isAuthenticated || hasNameFromProp;
  }, [currentUserData, userData?.firstName]);

  const [formData, setFormData] = useState<FormData>(defaultValus);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if this is a guest flow (new user needs registration)
  const isGuestFlow = searchParams.get("guestFlow") === "true";

  const handleBack = () => {
    // Explicitly navigate to select-date-and-time page with current locale and preserved params
    const backParams = new URLSearchParams();
    const selectedClinicLocation = searchParams.get("selectedClinicLocation");
    const selectedService = searchParams.get("selectedService");
    const selectedServiceCode = searchParams.get("selectedServiceCode");
    const selectedVisitType = searchParams.get("selectedVisitType");
    const selectedDoctor = searchParams.get("selectedDoctor");
    const selectedDate = searchParams.get("selectedDate");
    const selectedTimeSlot = searchParams.get("selectedTimeSlot");

    if (selectedClinicLocation) backParams.set("selectedClinicLocation", selectedClinicLocation);
    if (selectedService) backParams.set("selectedService", selectedService);
    if (selectedServiceCode) backParams.set("selectedServiceCode", selectedServiceCode);
    if (selectedVisitType) backParams.set("selectedVisitType", selectedVisitType);
    if (selectedDoctor) backParams.set("selectedDoctor", selectedDoctor);
    if (selectedDate) backParams.set("selectedDate", selectedDate);
    if (selectedTimeSlot) backParams.set("selectedTimeSlot", selectedTimeSlot);

    router.push(`/${locale}/select-date-and-time?${backParams.toString()}`);
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
  const handleContinueToReview = useCallback(async () => {
    if (validateForm) {
      return toast.error(validateForm);
    }

    setIsSubmitting(true);

    try {
      // For guest flow: complete registration first (skip if already registered)
      const needsRegistration = isGuestFlow && !currentUserData;

      if (needsRegistration) {
        const registrationResult = await completeGuestRegistration({
          fullName: formData.fullName,
          preferredLanguage: locale as "ar" | "en",
          // No email for in-person visits
        });

        if (!registrationResult?.success) {
          toast.error(t("errors.registrationFailed"));
          setIsSubmitting(false);
          return;
        }

        // Update current user data directly with registration response
        // Transform BnoonUserResponse to CurrentUserType
        const user = registrationResult.user;
        await mutateCurrentUser({
          userId: user.id,
          phone: user.phone,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          sex: user.sex,
        });
      }

      // Build URL with all existing params plus the new form data
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("fullName", formData.fullName);
      newSearchParams.set("visitType", "clinic");

      // Remove guestFlow params (user is now registered)
      newSearchParams.delete("guestFlow");
      newSearchParams.delete("guestPhone");

      router.push(`/${locale}/review-appointment?${newSearchParams.toString()}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(t("errors.registrationFailed"));
      setIsSubmitting(false);
    }
  }, [validateForm, searchParams, formData.fullName, router, locale, isGuestFlow, currentUserData, mutateCurrentUser, t]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleContinueToReview();
      }}
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
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
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent",
                errors.fullName ? "border-red-500" : "border-gray-300",
                isRegisteredUser && "bg-gray-100 cursor-not-allowed opacity-75"
              )}
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}

            {/* Registered user notice - moved under full name input */}
            {isRegisteredUser && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      {t("registeredUserNotice.message")}
                    </p>
                    <a
                      href="mailto:info@bnoon.sa"
                      className="text-sm text-blue-600 hover:underline font-medium mt-1 inline-block"
                    >
                      {t("registeredUserNotice.contactSupport")}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
          <Button type="button" onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
            <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
            disabled={isSubmitting || !formData.fullName}
          >
            {isSubmitting ? t("buttons.processing") : t("buttons.confirm")} {!isSubmitting && <ArrowRight className="rtl:scale-x-[-1]" />}
          </Button>
        </div>
      </div>
    </form>
  );
}
