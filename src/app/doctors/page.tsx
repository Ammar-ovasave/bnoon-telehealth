"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { doctors as fullDoctorsList } from "@/models/DoctorModel";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Filter, MapPin, Video } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import DoctorCard from "@/components/DoctorCard";
import AvailabilityPicker, { AvailabilityOption } from "@/components/AvailabilityPicker";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { AvailabilityFilter } from "@/models/VisitTypeModel";

export default function DoctorsListPage() {
  const searchParams = useSearchParams();
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  // const availabilityFilter: AvailabilityFilter = (searchParams.get("selectedVisitType") as AvailabilityFilter) || "clinic";
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>();
  const router = useRouter();

  const handleSetAvailabilityFilter = (value: AvailabilityFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("selectedVisitType", value);
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
    setAvailabilityFilter(value);
  };

  const handleBack = () => {
    router.back();
  };

  const handleDoctorChange = (doctor: string) => {
    setSelectedDoctor(doctor);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("selectedDoctor", doctor);
    router.push(`/select-date-and-time?${searchParams.toString()}`);
  };

  const { data: resourcesData, isLoading: isLoadingResources } = useFertiSmartResources();

  const doctors = useMemo(() => {
    return fullDoctorsList
      .filter((item) => {
        const matchBranch = item.branchId === searchParams.get("selectedClinicLocation");
        if (searchParams.get("selectedService")) {
          return matchBranch && item.services.some((service) => service === searchParams.get("selectedService"));
        }
        return matchBranch;
      })
      .filter((item) => {
        return resourcesData?.some((resource) =>
          resource.linkedUserFullName?.toLocaleLowerCase().includes(item.name.toLocaleLowerCase())
        );
      });
  }, [resourcesData, searchParams]);

  const filteredDoctors = useMemo(() => {
    if (!availabilityFilter) return [];
    return doctors.filter((doctor) => {
      switch (availabilityFilter) {
        case "clinic":
          return doctor.availability.clinic;
        case "virtual":
          return doctor.availability.virtual;
        default:
          return true;
      }
    });
  }, [availabilityFilter, doctors]);

  const availabilityOptions: AvailabilityOption[] = [
    {
      value: "clinic",
      title: "In-Clinic Appointment",
      description: "Visit the clinic for hands-on care and in-person diagnostics.",
      icon: MapPin,
    },
    {
      value: "virtual",
      title: "Virtual Visit",
      description: "Connect from anywhere for consultations, follow-ups, and more.",
      icon: Video,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      {isLoadingResources ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="size-18" />
        </div>
      ) : (
        <div className="mx-auto px-4 py-8 max-w-5xl pb-30">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Your Doctor</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our trusted team of experts — highly qualified, board-certified consultants dedicated to providing
              expert guidance, advanced treatments, and innovative, personalized care.
            </p>
          </div>
          <div>
            {!availabilityFilter ? (
              <AvailabilityPicker
                options={availabilityOptions}
                onSelect={handleSetAvailabilityFilter}
                eyebrow="Choose how you’d like your appointment"
                title="Pick a visit type"
                description="Select in-clinic or virtual care to see doctors who are available for your preferred appointment type."
              />
            ) : filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    selectedDoctor={selectedDoctor}
                    setSelectedDoctor={handleDoctorChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No doctors found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    No doctors match your current filter criteria. Try adjusting your availability filter.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3">
              <ArrowLeft /> Back to Service Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
