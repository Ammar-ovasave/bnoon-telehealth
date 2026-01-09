"use client";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Mail, Globe, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateBnoonUser, BnoonUserResponse } from "@/services/client";
import { UpdateBnoonUserPayload } from "@/models/BnoonUser";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import { useTranslations } from "next-intl";
import { Spinner } from "./ui/spinner";

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  emailAddress: string;
  sex: "male" | "female" | "";
  dob: string;
  nationality: string;
}

interface ProfileCompletionFormProps {
  /**
   * Called when profile is successfully updated
   */
  onProfileComplete: (user: BnoonUserResponse) => void;
  /**
   * Initial values from the user's existing profile
   */
  initialValues?: Partial<FormData>;
}

export default function ProfileCompletionForm({
  onProfileComplete,
  initialValues,
}: ProfileCompletionFormProps) {
  const t = useTranslations("ProfileCompletionForm");
  const { nationalities } = useFertiSmartCountries();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: initialValues?.firstName ?? "",
    middleName: initialValues?.middleName ?? "",
    lastName: initialValues?.lastName ?? "",
    emailAddress: initialValues?.emailAddress ?? "",
    sex: initialValues?.sex ?? "",
    dob: initialValues?.dob ?? "",
    nationality: initialValues?.nationality ?? "",
  });

  const genders = [
    { id: "male", label: t("genders.male"), value: 1 as const },
    { id: "female", label: t("genders.female"), value: 0 as const },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validationError = useMemo((): string | undefined => {
    if (!formData.firstName.trim()) {
      return t("errors.firstNameRequired");
    }
    if (formData.firstName.trim().length < 2) {
      return t("errors.firstNameMinLength");
    }
    if (!formData.lastName.trim()) {
      return t("errors.lastNameRequired");
    }
    if (formData.lastName.trim().length < 2) {
      return t("errors.lastNameMinLength");
    }
    if (!formData.sex) {
      return t("errors.genderRequired");
    }
    if (!formData.dob) {
      return t("errors.dobRequired");
    }
    // Validate email format if provided
    if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      return t("errors.emailInvalid");
    }
    return undefined;
  }, [formData, t]);

  const handleSubmit = useCallback(async () => {
    if (validationError) {
      return toast.error(validationError);
    }

    setIsLoading(true);

    const updatePayload: UpdateBnoonUserPayload = {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
      sex: formData.sex === "male" ? 1 : 0,
      dob: formData.dob,
    };

    // Only include optional fields if provided
    if (formData.emailAddress.trim()) {
      updatePayload.emailAddress = formData.emailAddress.trim();
    }
    if (formData.nationality) {
      updatePayload.nationality = {
        id: 0, // Will be resolved by backend
        name: formData.nationality,
      };
    }

    const response = await updateBnoonUser(updatePayload);

    setIsLoading(false);

    if (!response) {
      return toast.error(t("errors.updateFailed"));
    }

    toast.success(t("messages.profileUpdated"));
    onProfileComplete(response);
  }, [formData, validationError, onProfileComplete, t]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 mx-auto py-8 md:py-12 max-w-xl pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#004e77] rounded-2xl flex items-center justify-center shadow-lg shadow-[#004e77]/20">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-bnoon-navy dark:text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className=""
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {t("labels.firstName")} *
                  </div>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder={t("placeholders.firstName")}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {t("labels.middleName")}
                  </div>
                </label>
                <input
                  id="middleName"
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  placeholder={t("placeholders.middleName")}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {t("labels.lastName")} *
                  </div>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder={t("placeholders.lastName")}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {t("labels.emailAddress")}
                  </div>
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                  placeholder={t("placeholders.emailAddress")}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors"
                />
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
                      type="button"
                      onClick={() => handleInputChange("sex", gender.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        formData.sex === gender.id
                          ? "bg-bnoon-teal text-white border-bnoon-teal shadow-md"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:border-bnoon-teal/50"
                      )}
                    >
                      {gender.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {t("labels.dateOfBirth")} *
                  </div>
                </label>
                <input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors"
                />
              </div>

              {/* Nationality */}
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    {t("labels.nationality")}
                  </div>
                </label>
                <select
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:border-bnoon-teal transition-colors"
                >
                  <option value="">{t("labels.selectNationality")}</option>
                  {nationalities?.map((nationality) => (
                    <option key={nationality} value={nationality}>
                      {nationality}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.firstName.trim() ||
                  !formData.lastName.trim() ||
                  !formData.sex ||
                  !formData.dob
                }
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    {t("buttons.saving")}
                  </>
                ) : (
                  <>
                    {t("buttons.completeProfile")}
                    <ArrowRight className="rtl:scale-x-[-1]" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
