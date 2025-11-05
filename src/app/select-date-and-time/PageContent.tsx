"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { add, format } from "date-fns";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import useFertiSmartResourceAvailability from "@/hooks/useFertiSmartResourceAvailability";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import { Spinner } from "@/components/ui/spinner";
import { doctors } from "@/models/DoctorModel";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function SelectDateAndTimePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const router = useRouter();

  const searchParams = useSearchParams();
  const selectedDoctorId = searchParams.get("selectedDoctor");

  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => {
      return doc.id === selectedDoctorId;
    });
  }, [selectedDoctorId]);

  const { data: resourcesData, isLoading: loadingResources } = useFertiSmartResources();

  const selectedResource = useMemo(() => {
    return resourcesData?.find((item) => item.name?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? ""));
  }, [resourcesData, selectedDoctor?.name]);

  const { data: availabilityData, isLoading: loadingTimeslots } = useFertiSmartResourceAvailability({
    resourceId: selectedResource?.id?.toString(),
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
    serviceDuration: VISIT_DURATION_IN_MINUTES,
  });

  const handleBack = () => {
    router.back();
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
  };

  const isDateDisabled = (date: Date) => {
    const today = add(new Date(), { days: 1 });
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedDate) params.set("selectedDate", format(selectedDate, "yyyy-MM-dd"));
    if (selectedTimeSlot) params.set("selectedTimeSlot", selectedTimeSlot);
    return params.toString();
  }, [selectedDate, selectedTimeSlot, searchParams]);

  const { data: currentUserData, isLoading: loadingCurrentUser } = useCurrentUser();

  const getNextPageUrl = () => {
    if (!selectedDate || !selectedTimeSlot) return "#";
    if (currentUserData?.mrn) {
      const selectedVisitType = searchParams.get("selectedVisitType");
      if (selectedVisitType === "clinic") {
        return `/in-person-appointment-info?${newUrlSearchParams}`;
      } else {
        return `/virtual-visit-info?${newUrlSearchParams}`;
      }
    } else {
      return `/verify-phone?${newUrlSearchParams.toString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-40">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Date & Time</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose your preferred appointment date and time. Available slots are highlighted in green.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-primary dark:text-primary-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Date</h2>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(value) => {
                  setSelectedDate(value);
                  setSelectedTimeSlot(undefined);
                }}
                disabled={isDateDisabled}
                className="rounded-md border"
                classNames={{
                  day: "hover:bg-green-50 dark:hover:bg-green-900/20",
                  day_selected: "bg-green-600 text-white hover:bg-green-700",
                  day_today: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                }}
              />
            </div>
            {selectedDate && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Selected: <span className="font-medium">{format(selectedDate, "EEEE, MMMM do, yyyy")}</span>
                </p>
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="bg-white flex flex-col dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Time</h2>
            </div>

            {!selectedDate ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Please select a date first to view available time slots</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 flex-1 overflow-y-auto">
                {loadingTimeslots || loadingResources || loadingCurrentUser ? (
                  <div className="col-span-2 flex justify-center">
                    <Spinner className="size-8" />
                  </div>
                ) : (availabilityData?.length ?? 0) > 0 ? (
                  availabilityData?.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleTimeSlotSelect(slot.start ?? "")}
                      className={cn(
                        "p-3 rounded-md border text-sm font-medium transition-all duration-200 cursor-pointer",
                        selectedTimeSlot === slot.start
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 hover:border-primary"
                      )}
                    >
                      {format(slot.start ?? new Date().toISOString(), "hh:mm aa")}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
                    No availability on {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "the selected date"}. Please select a
                    different date.
                  </p>
                )}
              </div>
            )}

            {selectedTimeSlot && (availabilityData?.length ?? 0) > 0 && (
              <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-md">
                <p className="text-sm text-primary dark:text-primary-200">
                  Selected:{" "}
                  <span className="font-medium">
                    {format(
                      availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                      "hh:mm aa"
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        {(selectedDate || selectedTimeSlot) && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedTimeSlot && (availabilityData?.length ?? 0) > 0
                    ? format(
                        availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                        "hh:mm aa"
                      )
                    : "Not selected"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between container">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
              <ArrowLeft /> Back
            </Button>
            <Link href={getNextPageUrl()}>
              <Button
                disabled={!selectedDate || !selectedTimeSlot}
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
              >
                Continue <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
