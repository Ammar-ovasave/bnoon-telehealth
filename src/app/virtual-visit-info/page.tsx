"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Mail, Globe, Users, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock nationality options
const nationalities = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Jordan",
  "Lebanon",
  "Egypt",
  "Syria",
  "Iraq",
  "Morocco",
  "Tunisia",
  "Algeria",
  "Sudan",
  "Yemen",
  "Palestine",
  "Other",
];

const genders = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

const idTypes = [
  { id: "passport", label: "Passport" },
  { id: "nationalId", label: "National ID" },
];

interface FormData {
  fullName: string;
  email: string;
  nationality: string;
  gender: string;
  idType: string;
  idNumber: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  nationality?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
}

export default function VirtualVisitInfoPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    nationality: "",
    gender: "",
    idType: "",
    idNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  //   const searchParams = useSearchParams();

  //   // Get URL parameters
  //   const selectedVisitType = searchParams.get("selectedVisitType");
  //   const selectedDoctor = searchParams.get("selectedDoctor");
  //   const selectedService = searchParams.get("selectedService");
  //   const selectedClinicLocation = searchParams.get("selectedClinicLocation");
  //   const selectedDate = searchParams.get("selectedDate");
  //   const selectedTimeSlot = searchParams.get("selectedTimeSlot");

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.nationality) {
      newErrors.nationality = "Please select your nationality";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.idType) {
      newErrors.idType = "Please select your ID type";
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required";
    } else if (formData.idNumber.trim().length < 3) {
      newErrors.idNumber = "ID number must be at least 3 characters";
    }

    // setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.fullName, formData.gender, formData.nationality, formData.idType, formData.idNumber]);

  //   const handleSubmit = async () => {
  //     if (!validateForm()) {
  //       return;
  //     }

  //     setIsSubmitting(true);
  //     // Simulate API call
  //     setTimeout(() => {
  //       setIsSubmitting(false);
  //       // Navigate to next page or show success
  //       alert("Information saved successfully!");
  //       // router.push("/next-page");
  //     }, 1500);
  //   };

  const getNextPageUrl = useMemo(() => {
    if (!validateForm) return "#";
    return `/appointment-confirmation${window.location.search}`;
  }, [validateForm]);

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
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                  errors.fullName ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email Address *
                </div>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                  errors.email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Nationality */}
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  Nationality *
                </div>
              </label>
              <select
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                  errors.nationality ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                )}
              >
                <option value="">Select your nationality</option>
                {nationalities.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
              {errors.nationality && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nationality}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  Gender *
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {genders.map((gender) => (
                  <button
                    key={gender.id}
                    onClick={() => handleInputChange("gender", gender.id)}
                    className={cn(
                      "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                      formData.gender === gender.id
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary"
                    )}
                  >
                    {gender.label}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
            </div>

            {/* ID Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  ID Type *
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {idTypes.map((idType) => (
                  <button
                    key={idType.id}
                    onClick={() => handleInputChange("idType", idType.id)}
                    className={cn(
                      "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                      formData.idType === idType.id
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary"
                    )}
                  >
                    {idType.label}
                  </button>
                ))}
              </div>
              {errors.idType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idType}</p>}
            </div>

            {/* ID Number */}
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  {formData.idType === "passport"
                    ? "Passport Number"
                    : formData.idType === "nationalId"
                    ? "National ID Number"
                    : "ID Number"}{" "}
                  *
                </div>
              </label>
              <input
                id="idNumber"
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange("idNumber", e.target.value)}
                placeholder={
                  formData.idType === "passport"
                    ? "Enter your passport number"
                    : formData.idType === "nationalId"
                    ? "Enter your national ID number"
                    : "Enter your ID number"
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/100 focus:border-transparent dark:bg-gray-700 dark:text-white",
                  errors.idNumber ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.idNumber && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idNumber}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
              <ArrowLeft /> Back
            </Button>
            <Link href={getNextPageUrl}>
              <Button
                disabled={
                  !formData.fullName ||
                  !formData.email ||
                  !formData.nationality ||
                  !formData.gender ||
                  !formData.idType ||
                  !formData.idNumber
                }
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
              >
                {"Continue"} <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>

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
