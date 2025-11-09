"use client";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Mail, Globe, Users, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { createAppointment, getCurrentUser, updatePatient } from "@/services/client";
import useFertiSmartAppointmentStatuses from "@/hooks/useFertiSmartAppointmentStatuses";
import useFertiSmartBranches from "@/hooks/useFertiSmartBranches";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { addMinutes } from "date-fns";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import { doctors } from "@/models/DoctorModel";
import useFertiSmartIDTypes from "@/hooks/useFertiSmartIDTypes";
import { services } from "@/models/ServiceModel";
import { containsArabic } from "@/services/containsArabic";

const genders = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

// const idTypes = [
//   { id: "passport", label: "Passport" },
//   { id: "nationalId", label: "National ID" },
// ];

interface FormData {
  fullName: string;
  email: string;
  nationality: string;
  gender: string;
  idType?: string;
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

export default function VirtualVisitForm() {
  const { data: currentUserData, mutate: mutateCurrentUser, fullName: currentUserFullName } = useCurrentUser();
  const { nationalities, data: nationalitiesData } = useFertiSmartCountries();
  const { data: patientData, mutate: mutatePatient, fullName } = useFertiSmartPatient();
  const [formData, setFormData] = useState<FormData>({
    fullName: fullName || currentUserFullName || "",
    email: currentUserData?.emailAddress || currentUserData?.emailAddress || "",
    nationality: patientData?.nationality?.name
      ? nationalities?.find((item) => item === patientData?.nationality?.name) ?? ""
      : "",
    gender: patientData?.sex === 1 ? "male" : "female",
    idType: patientData?.identityIdType?.id?.toString(),
    idNumber: patientData?.identityId ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      return "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      return "Full name must be at least 2 characters";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }
    if (!formData.nationality) {
      return "Please select your nationality";
    }
    if (!formData.gender) {
      return "Please select your gender";
    }
    if (!formData.idType) {
      return "Please select your ID type";
    }
    if (!formData.idNumber.trim()) {
      return "ID number is required";
    }
  }, [formData.email, formData.fullName, formData.gender, formData.nationality, formData.idType, formData.idNumber]);

  const { data: statusesData } = useFertiSmartAppointmentStatuses();
  const { data: branchesData } = useFertiSmartBranches();
  const { data: apiServicesData } = useFertiSmartAPIServices();
  const { data: fertiSmartResources } = useFertiSmartResources();

  const searchParams = useSearchParams();
  const isVirtualVisit = searchParams.get("selectedVisitType") === "virtual";
  const selectedTimeSlot = decodeURIComponent(searchParams.get("selectedTimeSlot") ?? "");
  const selectedDoctorId = decodeURIComponent(searchParams.get("selectedDoctor") ?? "");
  const selectedServiceId = decodeURIComponent(searchParams.get("selectedService") ?? "");

  const selectedFertiSmartService = useMemo(() => {
    const serviceName = services.find((item) => item.id === selectedServiceId)?.title.toLocaleLowerCase() ?? "";
    const fertiSmartService = apiServicesData?.find((item) => item.name?.toLocaleLowerCase().includes(serviceName));
    if (fertiSmartService) return fertiSmartService;
    return apiServicesData?.[0];
  }, [apiServicesData, selectedServiceId]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => doc.id === selectedDoctorId);
  }, [selectedDoctorId]);

  const selectedResource = useMemo(() => {
    return fertiSmartResources?.find((resource) => {
      return resource.name?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? "");
    });
  }, [fertiSmartResources, selectedDoctor?.name]);

  const { data: idTypeData } = useFertiSmartIDTypes();

  const handleFormSubmit = useCallback(async () => {
    if (validateForm) {
      console.log("invalid data");
      return toast.error(validateForm);
    }
    if (!currentUserData?.mrn) {
      console.log("--- no current user mrn");
      return toast.error("Something went wrong");
    }
    const status = statusesData?.find((item) => item.name === "Approved/Confirmed");
    if (!status) {
      console.log("could not find status");
      return toast.error("Something went wrong");
    }
    if (!apiServicesData?.length) {
      console.log("could not find api service");
      return toast.error("Something went wrong");
    }
    if (!branchesData?.length) {
      console.log("could not find branch");
      return toast.error("Something went wrong");
    }
    setLoading(true);
    try {
      const splitName = formData.fullName.split(" ");
      const [createAppointmentResponse] = await Promise.all([
        createAppointment({
          firstName: currentUserData.firstName ?? "",
          lastName: currentUserData.lastName ?? "",
          phoneNumber: currentUserData.contactNumber ?? "",
          email: formData.email,
          statusId: status.id ?? 0,
          branchId: branchesData?.[0].id ?? 0,
          description: isVirtualVisit ? `Virtual Visit` : ``,
          patientMrn: currentUserData.mrn ?? "",
          serviceId: selectedFertiSmartService?.id ?? 0,
          resourceIds: [selectedResource?.id ?? 0],
          startTime: selectedTimeSlot,
          endTime: addMinutes(selectedTimeSlot, VISIT_DURATION_IN_MINUTES).toISOString(),
        }),
      ]);
      const newCurrentUser = await getCurrentUser();
      if (!newCurrentUser) {
        console.log("no new current user");
        return toast.error("Something went wrong");
      }
      if (!createAppointmentResponse?.id) {
        console.log("could not create appointment", createAppointmentResponse);
        return toast.error("Something went wrong");
      }
      await updatePatient({
        arabicName: containsArabic(formData.fullName) ? formData.fullName : undefined,
        mrn: newCurrentUser?.mrn ?? "",
        emailAddress: formData.email,
        firstName: splitName[0],
        lastName: splitName.slice(1).join(" "),
        identityId: formData.idNumber,
        nationalityId: nationalitiesData?.find((item) => item.name === formData.nationality)?.id,
        identityIdTypeId: Number(formData.idType),
      });
      mutateCurrentUser(undefined);
      mutatePatient(undefined);
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.append("appointmentId", createAppointmentResponse.id.toString());
      router.replace(`/appointment-confirmation?${newSearchParams.toString()}`);
    } catch (e) {
      console.log("--- create appointment error", e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [
    apiServicesData?.length,
    branchesData,
    currentUserData?.contactNumber,
    currentUserData?.firstName,
    currentUserData?.lastName,
    currentUserData?.mrn,
    formData.email,
    formData.fullName,
    formData.idNumber,
    formData.idType,
    formData.nationality,
    isVirtualVisit,
    mutateCurrentUser,
    mutatePatient,
    nationalitiesData,
    router,
    selectedFertiSmartService?.id,
    selectedResource?.id,
    selectedTimeSlot,
    statusesData,
    validateForm,
  ]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmit();
      }}
    >
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
              {nationalities?.map((nationality) => (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleInputChange("gender", gender.id);
                  }}
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
            <div
              className={cn(
                "grid grid-cols-2 gap-3",
                idTypeData?.length === 3 && "grid-cols-3",
                idTypeData?.length === 4 && "grid-cols-4"
              )}
            >
              {idTypeData?.map((idType) => (
                <button
                  key={idType.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleInputChange("idType", idType.id?.toString() ?? "");
                  }}
                  className={cn(
                    "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                    formData.idType === idType.id?.toString()
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-purple-900/20 hover:border-primary"
                  )}
                >
                  {idType.name}
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
          <Button
            type="submit"
            disabled={
              loading ||
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
            {loading ? "Loading" : "Confirm"} <ArrowRight />
          </Button>
        </div>
      </div>
    </form>
  );
}
