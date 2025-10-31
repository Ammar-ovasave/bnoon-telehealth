"use client";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { cn } from "@/lib/utils";
import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, MapPin, RefreshCw, User, X } from "lucide-react";
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
import { cancelAppointment } from "@/services/client";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { mutate: mutateCurrentUserAppointments } = useCurrentUserAppointments();

  const { data: resourcesData } = useFertiSmartResources();

  const resourceId = appointment.resources?.[0]?.id;
  const resource = resourcesData?.find((resource) => resource.id === resourceId);

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

  const handleReschedule = () => {};

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
          <Button onClick={() => handleReschedule()} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reschedule
          </Button>
          {appointment.status?.name !== "Cancelled" && (
            <Button
              onClick={() => handleCancel()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
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
                <p className="font-medium text-gray-900 dark:text-white">{"Virtual Visit"}</p>
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
