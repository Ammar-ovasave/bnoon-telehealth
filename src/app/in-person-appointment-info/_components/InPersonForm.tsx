"use client";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { createAppointment, updatePatient } from "@/services/client";
import useFertiSmartAppointmentStatuses from "@/hooks/useFertiSmartAppointmentStatuses";
import useFertiSmartBranches from "@/hooks/useFertiSmartBranches";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { addMinutes } from "date-fns";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import { doctors } from "@/models/DoctorModel";

interface FormData {
  fullName: string;
}

interface FormErrors {
  fullName?: string;
}

export default function InPersonForm() {
  const { data: currentUserData, mutate: mutateCurrentUser } = useCurrentUser();
  const { mutate: mutatePatient, fullName } = useFertiSmartPatient();
  const [formData, setFormData] = useState<FormData>({
    fullName: fullName,
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
  }, [formData.fullName]);

  const searchParams = useSearchParams();
  const selectedTimeSlot = decodeURIComponent(searchParams.get("selectedTimeSlot") ?? "");
  const selectedDoctorId = decodeURIComponent(searchParams.get("selectedDoctor") ?? "");

  const { data: statusesData } = useFertiSmartAppointmentStatuses();
  const { data: branchesData } = useFertiSmartBranches();
  const { data: apiServicesData } = useFertiSmartAPIServices();
  const { data: fertiSmartResources } = useFertiSmartResources();

  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => doc.id === selectedDoctorId);
  }, [selectedDoctorId]);

  const selectedResource = useMemo(() => {
    return fertiSmartResources?.find((resource) => {
      return resource.name?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? "");
    });
  }, [fertiSmartResources, selectedDoctor?.name]);

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
          email: null,
          phoneNumber: currentUserData.contactNumber ?? "",
          firstName: currentUserData.firstName ?? "",
          lastName: currentUserData.lastName ?? "",
          statusId: status.id ?? 0,
          branchId: branchesData?.[0].id ?? 0,
          description: `In Clinic`,
          patientMrn: currentUserData.mrn ?? "",
          serviceId: apiServicesData?.[0].id ?? 0,
          resourceIds: [selectedResource?.id ?? 0],
          startTime: selectedTimeSlot,
          endTime: addMinutes(selectedTimeSlot, VISIT_DURATION_IN_MINUTES).toISOString(),
        }),
        updatePatient({
          mrn: currentUserData.mrn,
          firstName: splitName[0],
          lastName: splitName.slice(1).join(" "),
        }),
      ]);
      if (!createAppointmentResponse?.id) {
        console.log("could not create appointment", createAppointmentResponse);
        return toast.error("Something went wrong");
      }
      mutatePatient(undefined);
      mutateCurrentUser(undefined);
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
    apiServicesData,
    branchesData,
    currentUserData?.contactNumber,
    currentUserData?.firstName,
    currentUserData?.lastName,
    currentUserData?.mrn,
    formData.fullName,
    mutateCurrentUser,
    mutatePatient,
    router,
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-6 justify-between mt-8">
          <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
            <ArrowLeft /> Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
            disabled={loading || !formData.fullName}
          >
            {loading ? "Loading" : "Confirm"} <ArrowRight />
          </Button>
        </div>
      </div>
    </form>
  );
}
