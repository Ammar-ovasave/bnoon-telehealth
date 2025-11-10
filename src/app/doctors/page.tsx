"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { doctors as fullDoctorsList } from "@/models/DoctorModel";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Filter, MapPin, Video } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import DoctorCard from "@/components/DoctorCard";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { AvailabilityFilter } from "@/models/VisitTypeModel";

export default function DoctorsListPage() {
  const searchParams = useSearchParams();
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  // const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>(
  //   (searchParams.get("selectedVisitType") as AvailabilityFilter) ?? "all"
  // );
  const availabilityFilter = (searchParams.get("selectedVisitType") as AvailabilityFilter) || "all";
  const router = useRouter();

  const setAvailabilityFilter = (value: AvailabilityFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("selectedVisitType", value);
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
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
        return item.branchId === searchParams.get("selectedClinicLocation");
      })
      .filter((item) => {
        return resourcesData?.some((resource) => resource.name?.toLocaleLowerCase().includes(item.name.toLocaleLowerCase()));
      });
  }, [resourcesData, searchParams]);

  const filteredDoctors = useMemo(() => {
    // if (availabilityFilter === "all") {
    //   return doctors;
    // }
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

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      {isLoadingResources ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="size-18" />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-6xl pb-30">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Your Doctor</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our experienced team of specialists. All doctors are highly qualified and ready to provide personalized
              care.
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by Availability</h3>
              </div>

              <div className="flex gap-3">
                {/* <Button
                  variant={"outline"}
                  size="sm"
                  onClick={() => setAvailabilityFilter("all")}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    availabilityFilter === "all" && "bg-primary text-primary-foreground"
                  )}
                >
                  <span className="hidden sm:inline">All Doctors</span>
                  <span className="sm:hidden">All</span>
                </Button> */}
                <Button
                  variant={availabilityFilter === "clinic" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvailabilityFilter("clinic")}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    availabilityFilter === "clinic" && "bg-primary text-primary-foreground"
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  <span>On Clinic</span>
                </Button>

                <Button
                  variant={availabilityFilter === "virtual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvailabilityFilter("virtual")}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    availabilityFilter === "virtual" && "bg-primary text-primary-foreground"
                  )}
                >
                  <Video className="h-4 w-4" />
                  <span>Virtual Visit</span>
                </Button>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
                {` with ${availabilityFilter} availability`}
              </div>
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            {filteredDoctors.length > 0 ? (
              <RadioGroup value={selectedDoctor} onValueChange={setSelectedDoctor}>
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
              </RadioGroup>
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

          {/* Back Button */}
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
