"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { doctors } from "@/models/DoctorModel";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Filter, MapPin, Video, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import DoctorCard from "@/components/DoctorCard";

type AvailabilityFilter = "all" | "clinic" | "virtual" | "both";

export default function DoctorsListPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("selectedService");
  const selectedClinicLocation = searchParams.get("selectedClinicLocation");

  const handleBack = () => {
    router.back();
  };

  const handleDoctorChange = (doctor: string) => {
    setSelectedDoctor(doctor);
  };

  const filteredDoctors = useMemo(() => {
    if (availabilityFilter === "all") {
      return doctors;
    }
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
  }, [availabilityFilter]);

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
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
              <Button
                variant={availabilityFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setAvailabilityFilter("all")}
                className={cn(
                  "flex items-center justify-center gap-2",
                  availabilityFilter === "all" && "bg-primary text-primary-foreground"
                )}
              >
                <span className="hidden sm:inline">All Doctors</span>
                <span className="sm:hidden">All</span>
              </Button>
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
              {availabilityFilter !== "all" && ` with ${availabilityFilter} availability`}
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
                <Button variant="outline" onClick={() => setAvailabilityFilter("all")} className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Show All Doctors
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between container">
            <Button
              onClick={handleBack}
              variant="outline"
              size="lg"
              className={cn("px-6 py-3 w-full md:w-auto", selectedDoctor && "opacity-50")}
            >
              <ArrowLeft /> Back to Service Selection
            </Button>
            <Link
              href={
                selectedDoctor
                  ? `/appointment?selectedDoctor=${encodeURIComponent(
                      selectedDoctor
                    )}&selectedService=${selectedService}&selectedClinicLocation=${selectedClinicLocation}`
                  : "#"
              }
            >
              <Button
                disabled={!selectedDoctor}
                id="continue-button"
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
              >
                Continue with Selected Doctor <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
