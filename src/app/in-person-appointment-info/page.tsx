"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FormData {
  fullName: string;
}

interface FormErrors {
  fullName?: string;
}

export default function InPersonAppointmentInfoPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = useMemo((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }
    // setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.fullName]);

  // const handleSubmit = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsSubmitting(false);
  //     // Navigate to next page or show success
  //     alert("Information saved successfully!");
  //     // router.push("/next-page");
  //   }, 1500);
  // };

  const getNextPageUrl = useMemo(() => {
    if (!validateForm) return "#";
    return `/appointment-confirmation${window.location.search}`;
  }, [validateForm]);

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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Full Name *
                </div>
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white",
                  errors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
              <ArrowLeft /> Back
            </Button>
            <Link href={getNextPageUrl}>
              <Button
                disabled={!formData.fullName || isSubmitting}
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
              >
                {isSubmitting ? "Saving..." : "Continue"} <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>

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
