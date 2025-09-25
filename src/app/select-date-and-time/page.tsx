"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { add, format } from "date-fns";

// Mock time slots data
const timeSlots = [
  { id: "09:00", label: "9:00 AM", available: true },
  { id: "09:30", label: "9:30 AM", available: true },
  //   { id: "10:00", label: "10:00 AM", available: false },
  { id: "10:30", label: "10:30 AM", available: true },
  { id: "11:00", label: "11:00 AM", available: true },
  //   { id: "11:30", label: "11:30 AM", available: false },
  { id: "12:00", label: "12:00 PM", available: true },
  { id: "12:30", label: "12:30 PM", available: true },
  { id: "13:00", label: "1:00 PM", available: true },
  //   { id: "13:30", label: "1:30 PM", available: false },
  { id: "14:00", label: "2:00 PM", available: true },
  { id: "14:30", label: "2:30 PM", available: true },
  { id: "15:00", label: "3:00 PM", available: true },
  //   { id: "15:30", label: "3:30 PM", available: false },
  { id: "16:00", label: "4:00 PM", available: true },
  { id: "16:30", label: "4:30 PM", available: true },
  { id: "17:00", label: "5:00 PM", available: true },
];

export default function SelectDateAndTimePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const router = useRouter();
  //   const searchParams = useSearchParams();

  // Get URL parameters
  //   const selectedVisitType = searchParams.get("selectedVisitType");
  //   const selectedDoctor = searchParams.get("selectedDoctor");
  //   const selectedService = searchParams.get("selectedService");
  //   const selectedClinicLocation = searchParams.get("selectedClinicLocation");

  const handleBack = () => {
    router.back();
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = add(new Date(), { days: 1 });
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getNextPageUrl = () => {
    if (!selectedDate || !selectedTimeSlot) return "#";
    // const params = new URLSearchParams();
    // if (selectedVisitType) params.set("selectedVisitType", selectedVisitType);
    // if (selectedDoctor) params.set("selectedDoctor", selectedDoctor);
    // if (selectedService) params.set("selectedService", selectedService);
    // if (selectedClinicLocation) params.set("selectedClinicLocation", selectedClinicLocation);
    // params.set("selectedDate", format(selectedDate, "yyyy-MM-dd"));
    // params.set("selectedTimeSlot", selectedTimeSlot);
    return `/verify-phone${window.location.search}&selectedDate=${format(
      selectedDate,
      "yyyy-MM-dd"
    )}&selectedTimeSlot=${selectedTimeSlot}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-30">
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
              <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Date</h2>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Time</h2>
            </div>

            {!selectedDate ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Please select a date first to view available time slots</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                    disabled={!slot.available}
                    className={cn(
                      "p-3 rounded-md border text-sm font-medium transition-all duration-200",
                      slot.available
                        ? selectedTimeSlot === slot.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500"
                        : "bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}

            {selectedTimeSlot && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Selected: <span className="font-medium">{timeSlots.find((slot) => slot.id === selectedTimeSlot)?.label}</span>
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
                  {selectedTimeSlot ? timeSlots.find((slot) => slot.id === selectedTimeSlot)?.label : "Not selected"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between container">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
              <ArrowLeft /> Back to Visit Type
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
