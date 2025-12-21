"use client";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
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
import { doctors } from "@/models/DoctorModel";
import { containsArabic } from "@/services/containsArabic";
import { useTranslations } from "next-intl";
import { services } from "@/models/ServiceModel";

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
  const { data: currentUserData, mutate: mutateCurrentUser } = useCurrentUser();
  const { mutate: mutatePatient } = useFertiSmartPatient();
  const [formData, setFormData] = useState<FormData>(defaultValus);
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
      return t("errors.fullNameRequired");
    } else if (formData.fullName.trim().length < 2) {
      return t("errors.fullNameMinLength");
    }
  }, [formData.fullName, t]);

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
      return resource.linkedUserFullName?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? "");
    });
  }, [fertiSmartResources, selectedDoctor?.name]);

  const selectedServiceId = decodeURIComponent(searchParams.get("selectedService") ?? "");

  const selectedFertiSmartService = useMemo(() => {
    const serviceName = services.find((item) => item.id === selectedServiceId)?.title.toLocaleLowerCase() ?? "";
    const fertiSmartService = apiServicesData?.find((item) => item.name?.toLocaleLowerCase().includes(serviceName));
    if (fertiSmartService) return fertiSmartService;
    return apiServicesData?.[0];
  }, [apiServicesData, selectedServiceId]);

  const handleFormSubmit = useCallback(async () => {
    if (validateForm) {
      console.log("invalid data");
      return toast.error(validateForm);
    }
    if (!currentUserData?.mrn) {
      console.log("--- no current user mrn");
      return toast.error(t("errors.somethingWentWrong"));
    }
    const status = statusesData?.find((item) => item.name === "Approved/Confirmed");
    if (!status) {
      console.log("could not find status");
      return toast.error(t("errors.somethingWentWrong"));
    }
    if (!apiServicesData?.length) {
      console.log("could not find api service");
      return toast.error(t("errors.somethingWentWrong"));
    }
    if (!branchesData?.length) {
      console.log("could not find branch");
      return toast.error(t("errors.somethingWentWrong"));
    }
    setLoading(true);
    try {
      const splitName = formData.fullName.split(" ");
      const [createAppointmentResponse] = await Promise.all([
        createAppointment({
          statusName: status.name ?? "",
          serviceName: selectedFertiSmartService?.name ?? "",
          email: null,
          phoneNumber: currentUserData.contactNumber ?? "",
          firstName: splitName[0],
          lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
          middleName: splitName.length > 2 ? splitName[1] : "",
          statusId: status.id ?? 0,
          branchId: branchesData?.[0].id ?? 0,
          description: `In Clinic`,
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
        return toast.error(t("errors.somethingWentWrong"));
      }
      if (!createAppointmentResponse?.id) {
        console.log("could not create appointment", createAppointmentResponse);
        return toast.error(t("errors.somethingWentWrong"));
      }
      await updatePatient({
        arabicName: containsArabic(formData.fullName) ? formData.fullName : undefined,
        mrn: currentUserData.mrn,
        firstName: splitName[0],
        middleName: splitName.length > 2 ? splitName[1] : "",
        lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
        gender: 0,
      });
      mutatePatient(undefined);
      mutateCurrentUser(undefined);
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.append("appointmentId", createAppointmentResponse.id.toString());
      router.replace(`/appointment-confirmation?${newSearchParams.toString()}`);
    } catch (e) {
      console.log("--- create appointment error", e);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    currentUserData?.mrn,
    currentUserData?.contactNumber,
    statusesData,
    apiServicesData?.length,
    branchesData,
    t,
    formData.fullName,
    selectedFertiSmartService?.name,
    selectedFertiSmartService?.id,
    selectedResource?.id,
    selectedTimeSlot,
    mutatePatient,
    mutateCurrentUser,
    router,
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
                {t("labels.fullName")} *
              </div>
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder={t("placeholders.fullName")}
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
            <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
            disabled={loading || !formData.fullName}
          >
            {loading ? t("buttons.loading") : t("buttons.confirm")} <ArrowRight className="rtl:scale-x-[-1]" />
          </Button>
        </div>
      </div>
    </form>
  );
}
