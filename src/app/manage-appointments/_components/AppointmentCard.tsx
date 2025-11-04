"use client";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { cn } from "@/lib/utils";
import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import { format, add } from "date-fns";
import { Calendar, CheckCircle, Clock, MapPin, Phone, RefreshCw, User, X } from "lucide-react";
import { FC, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cancelAppointment, updateAppointment } from "@/services/client";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import useFertiSmartResourceAvailability from "@/hooks/useFertiSmartResourceAvailability";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<Date | undefined>(undefined);
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const { mutate: mutateCurrentUserAppointments } = useCurrentUserAppointments();

  const { data: resourcesData } = useFertiSmartResources();

  const resourceId = appointment.resources?.[0]?.id;
  const resource = useMemo(() => resourcesData?.find((resource) => resource.id === resourceId), [resourceId, resourcesData]);

  const dateAndTime = useMemo(() => {
    if (!appointment.time?.start) return "-";
    try {
      return format(appointment.time?.start ?? "", "yyyy-MM-dd hh:mm a");
    } catch (error) {
      console.log("format appointmnt date and time error", error);
      return "-";
    }
  }, [appointment.time?.start]);

  const { data: currentUserData } = useCurrentUser();

  const { data: patientData } = useFertiSmartPatient({ mrn: currentUserData?.mrn });

  const { data: availabilityData, isLoading: loadingTimeslots } = useFertiSmartResourceAvailability({
    resourceId: resourceId?.toString(),
    date: selectedRescheduleDate ? format(selectedRescheduleDate, "yyyy-MM-dd") : undefined,
    serviceDuration: VISIT_DURATION_IN_MINUTES,
  });

  const isDateDisabled = (date: Date) => {
    const today = add(new Date(), { days: 1 });
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleReschedule = () => {
    setShowRescheduleDialog(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedRescheduleDate || !selectedRescheduleTimeSlot || !appointment.id) return;

    try {
      setIsRescheduling(true);
      const selectedSlot = availabilityData?.find((slot) => slot.start === selectedRescheduleTimeSlot);
      if (!selectedSlot?.start || !selectedSlot?.end) return;

      await updateAppointment({
        appointmentId: appointment.id,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      });

      mutateCurrentUserAppointments(undefined);
      setShowRescheduleDialog(false);
      setSelectedRescheduleDate(undefined);
      setSelectedRescheduleTimeSlot(undefined);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Something went wrong");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  return (
    <div
      key={appointment.id}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Appointment Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
              getAppointmentStatusColor(appointment.status?.name ?? "")
            )}
          >
            {getAppointmentStatusIcon(appointment.status?.name ?? "")}
            {(appointment.status?.name?.charAt(0)?.toUpperCase() ?? "") + (appointment.status?.name?.slice(1) ?? "")}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Confirmation: {appointment.id}</span>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {appointment.status?.name !== "Cancelled" && (
            <>
              <Link href={`/video-call/${appointment.id}/prepare`}>
                <Button variant="default" size="sm" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Join
                </Button>
              </Link>
              <Button onClick={() => handleReschedule()} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reschedule
              </Button>
              <Button
                onClick={() => handleCancel()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Appointment Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Appointment Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                <p className="font-medium text-gray-900 dark:text-white">{dateAndTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Doctor</p>
                <p className="font-medium text-gray-900 dark:text-white">{resource?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Service</p>
                <p className="font-medium text-gray-900 dark:text-white">{"-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {appointment.description?.toLocaleLowerCase().includes("virtual") ? "Virtual Visit" : "In Clinic"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Patient Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Patient Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{`${currentUserData?.firstName ?? ""} ${
                currentUserData?.lastName ?? ""
              }`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentUserData?.emailAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nationality</p>
              <p className="font-medium text-gray-900 dark:text-white">{"-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
              <p className="font-medium text-gray-900 dark:text-white">{"Female"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">-</p>
              <p className="font-medium text-gray-900 dark:text-white">{patientData?.identityId ?? "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <AlertDialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <AlertDialogContent className="!max-w-[800px] max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule Appointment</AlertDialogTitle>
            <AlertDialogDescription>Choose your preferred date and time for this appointment.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date</h3>
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedRescheduleDate}
                  onSelect={(value) => {
                    setSelectedRescheduleDate(value);
                    setSelectedRescheduleTimeSlot(undefined);
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
              {selectedRescheduleDate && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Selected: <span className="font-medium">{format(selectedRescheduleDate, "EEEE, MMMM do, yyyy")}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Time</h3>
              {!selectedRescheduleDate ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Please select a date first to view available time slots</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {loadingTimeslots ? (
                    <div className="col-span-2 flex justify-center">
                      <Spinner className="size-8" />
                    </div>
                  ) : (availabilityData?.length ?? 0) > 0 ? (
                    availabilityData?.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedRescheduleTimeSlot(slot.start ?? "")}
                        className={cn(
                          "p-3 rounded-md border text-sm font-medium transition-all duration-200 cursor-pointer",
                          selectedRescheduleTimeSlot === slot.start
                            ? "bg-primary text-white border-primary shadow-md"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 hover:border-primary"
                        )}
                      >
                        {format(slot.start ?? "", "hh:mm aa")}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
                      No availability on{" "}
                      {selectedRescheduleDate ? format(selectedRescheduleDate, "yyyy-MM-dd") : "the selected date"}. Please select
                      a different date.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRescheduling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRescheduling || !selectedRescheduleDate || !selectedRescheduleTimeSlot}
              onClick={handleRescheduleConfirm}
            >
              {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                try {
                  setIsCancelling(true);
                  if (!appointment.id) return;
                  await cancelAppointment(appointment.id);
                  mutateCurrentUserAppointments(undefined);
                } finally {
                  setIsCancelling(false);
                  setShowCancelConfirm(false);
                }
              }}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: FertiSmartAppointmentModel;
}

const getAppointmentStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const getAppointmentStatusIcon = (status: string) => {
  switch (status) {
    case "upcoming":
      return <Clock className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <X className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

export default AppointmentCard;
