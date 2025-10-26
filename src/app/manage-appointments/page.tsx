"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, CalendarDays, RefreshCw, X, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { clinicLocations } from "@/models/ClinicModel";
import { services } from "@/models/ServiceModel";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";

interface Appointment {
  id: string;
  confirmationNumber: string;
  date: string;
  timeSlot: string;
  visitType: string;
  doctor: string;
  service: string;
  clinicLocation: string;
  status: string; // "upcoming" | "completed" | "cancelled";
  fullName: string;
  email: string;
  nationality: string;
  gender: string;
  idType: string;
  idNumber: string;
}

export default function ManageAppointmentsPage() {
  const router = useRouter();
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  const { data: currentUserAppointmentsData } = useCurrentUserAppointments();

  const { data: currentUserData } = useCurrentUser();

  // const [appointments] = useState<Appointment[]>([
  //   {
  //     id: "1",
  //     confirmationNumber: "BN12345678",
  //     date: new Date().toLocaleDateString(),
  //     timeSlot: "10:00 AM",
  //     visitType: "Virtual Visit",
  //     doctor: "Dr. Ahmad Bekar",
  //     service: "general-consultation",
  //     clinicLocation: "virtual",
  //     status: "upcoming",
  //     fullName: "John Doe",
  //     email: "john.doe@email.com",
  //     nationality: "Saudi Arabia",
  //     gender: "Male",
  //     idType: "National ID",
  //     idNumber: "1234567890",
  //   },
  // ]);

  const { data: patientData } = useFertiSmartPatient({ mrn: currentUserData?.mrn });

  const { data: resourcesData } = useFertiSmartResources();

  const appointments = useMemo<Appointment[]>(() => {
    return (
      currentUserAppointmentsData?.map<Appointment>((item) => {
        const resourceId = item.resources?.[0]?.id;
        const resource = resourcesData?.find((resource) => resource.id === resourceId);
        return {
          clinicLocation: "Virtual",
          confirmationNumber: item.id?.toString() ?? "",
          date: item.time?.start ?? "",
          doctor: resource?.name ?? "-",
          email: currentUserData?.emailAddress ?? "-",
          fullName: `${currentUserData?.firstName} ${currentUserData?.lastName}`,
          gender: "Female",
          idNumber: patientData?.identityId ?? "-",
          idType: "-",
          nationality: "-",
          service: "-",
          status: item.status?.name ?? "",
          timeSlot: item.time?.start ?? "",
          visitType: "Virtual Visit",
          id: item.id?.toString() ?? "",
        };
      }) ?? []
    );
  }, [
    currentUserAppointmentsData,
    currentUserData?.emailAddress,
    currentUserData?.firstName,
    currentUserData?.lastName,
    patientData?.identityId,
    resourcesData,
  ]);

  const handleReschedule = (appointmentId: string) => {
    // Navigate to the select date and time page with the appointment ID
    router.push(`/select-date-and-time?appointmentId=${appointmentId}&action=reschedule`);
  };

  const handleCancel = (appointmentId: string) => {
    setShowCancelConfirm(appointmentId);
  };

  const confirmCancel = (appointmentId: string) => {
    // In a real app, this would make an API call to cancel the appointment
    console.log(`Cancelling appointment ${appointmentId}`);
    setShowCancelConfirm(null);
    // Show success message or update the appointment status
    alert("Appointment cancelled successfully!");
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Manage Appointments</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            View, reschedule, or cancel your appointments. All your upcoming and past appointments are listed below.
          </p>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Appointments Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{`You don't have any appointments scheduled.`}</p>
              <Link href="/select-visit-type">
                <Button size="lg" className="px-8 py-3">
                  Book New Appointment
                </Button>
              </Link>
            </div>
          ) : (
            appointments.map((appointment) => {
              const clinic = clinicLocations.find((c) => c.id === appointment.clinicLocation);
              const service = services.find((s) => s.id === appointment.service);

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
                          getStatusColor(appointment.status)
                        )}
                      >
                        {getStatusIcon(appointment.status)}
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Confirmation: {appointment.confirmationNumber}
                      </span>
                    </div>
                    {appointment.status === "upcoming" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReschedule(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button
                          onClick={() => handleCancel(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
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
                            <p className="font-medium text-gray-900 dark:text-white">
                              {appointment.date} at {appointment.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Doctor</p>
                            <p className="font-medium text-gray-900 dark:text-white">{appointment.doctor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Service</p>
                            <p className="font-medium text-gray-900 dark:text-white">{service?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {appointment.visitType === "Virtual Visit" ? "Virtual Visit" : clinic?.name}
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
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Nationality</p>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.nationality}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.idType}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.idNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Confirmation Modal */}
                  {showCancelConfirm === appointment.id && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="text-red-800 dark:text-red-200 font-medium mb-2">Cancel Appointment?</h4>
                      <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => confirmCancel(appointment.id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Yes, Cancel
                        </Button>
                        <Button onClick={() => setShowCancelConfirm(null)} variant="outline" size="sm">
                          Keep Appointment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Book New Appointment */}
        {appointments.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/select-visit-type">
              <Button size="lg" className="px-8 py-3">
                Book Another Appointment
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
