"use client";
import { Button } from "@/components/ui/button";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import { cn } from "@/lib/utils";
import { FertiSmartAppointmentModel } from "@/models/FertiSmartAppointmentModel";
import { format, add } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CheckCircle, Clock, Phone, RefreshCw, X } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import useFertiSmartAPIServices from "@/hooks/useFertiSmartAPIServices";
import useFertiSmartAppointmentStatuses from "@/hooks/useFertiSmartAppointmentStatuses";
import Image from "next/image";
import { services } from "@/models/ServiceModel";
import { doctors } from "@/models/DoctorModel";
import { useLocale } from "next-intl";
import { getDoctorName } from "@/lib/getDoctorName";

const AppointmentCard: FC<AppointmentCardProps> = ({ appointment }) => {
  const t = useTranslations("ManageAppointmentsPage.appointmentCard");
  const tServices = useTranslations("ServicesPage");
  const locale = useLocale();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<Date | undefined>(undefined);
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const { mutate: mutateCurrentUserAppointments } = useCurrentUserAppointments();

  const { data: apiServicesData } = useFertiSmartAPIServices();

  const service = useMemo(() => {
    return apiServicesData?.find((item) => item.id === appointment.service?.id);
  }, [apiServicesData, appointment.service?.id]);

  const serviceTitle = useMemo(() => {
    if (!service?.name) return service?.name ?? "-";

    // Try to match the API service name with ServiceModel service titles
    const matchedService = services.find((s) => s.title.toLowerCase() === service.name?.toLowerCase());

    if (matchedService?.id) {
      return tServices(`services.${matchedService.id}.title`);
    }

    // Fallback to API service name if no match found
    return service.name;
  }, [service?.name, tServices]);

  const { data: resourcesData } = useFertiSmartResources();

  const resourceId = appointment.resources?.[0]?.id;
  const resource = useMemo(() => resourcesData?.find((resource) => resource.id === resourceId), [resourceId, resourcesData]);

  // Map API resource name to DoctorModel for localized display
  const doctorFromModel = useMemo(() => {
    if (!resource?.linkedUserFullName) return undefined;
    return doctors.find((doctor) => resource.linkedUserFullName?.toLocaleLowerCase().includes(doctor.name.toLocaleLowerCase()));
  }, [resource?.linkedUserFullName]);

  const displayDoctorName = useMemo(() => {
    if (doctorFromModel) {
      return getDoctorName(doctorFromModel, locale);
    }
    // Fallback to API name if no match found
    return resource?.linkedUserFullName ?? "";
  }, [doctorFromModel, locale, resource?.linkedUserFullName]);

  const userTimezone = useMemo(() => {
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "UTC";
  }, []);

  const isKSA = userTimezone === "Asia/Riyadh";
  const KSA_TIMEZONE = "Asia/Riyadh";

  const dateAndTime = useMemo(() => {
    if (!appointment.time?.start) return "-";
    try {
      return format(appointment.time?.start ?? "", "yyyy-MM-dd hh:mm a");
    } catch (error) {
      console.log("format appointmnt date and time error", error);
      return "-";
    }
  }, [appointment.time?.start]);

  const dateAndTimeKSA = useMemo(() => {
    if (!appointment.time?.start || isKSA) return null;
    try {
      return formatInTimeZone(appointment.time?.start ?? "", KSA_TIMEZONE, "yyyy-MM-dd hh:mm a");
    } catch (error) {
      console.log("format appointmnt date and time KSA error", error);
      return null;
    }
  }, [appointment.time?.start, isKSA]);

  const { data: patientData, fullName } = useFertiSmartPatient();

  const { data: countriesData } = useFertiSmartCountries();

  const nationality = useMemo(() => {
    return countriesData?.find((country) => {
      return country.id === patientData?.nationality?.id;
    });
  }, [countriesData, patientData?.nationality?.id]);

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
        type: "reschedule",
      });

      mutateCurrentUserAppointments(undefined);
      console.log("--- close reschedule dialog ");
      setShowRescheduleDialog(false);
      setSelectedRescheduleDate(undefined);
      setSelectedRescheduleTimeSlot(undefined);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const { data: appointmentStatusData, isLoading: loadingAppointmentStatus } = useFertiSmartAppointmentStatuses();

  const cancelledAppointmentStatusId = useMemo(() => {
    return appointmentStatusData?.find((status) => status.name?.toLocaleLowerCase().includes("cancel"))?.id;
  }, [appointmentStatusData]);

  return (
    <div
      key={appointment.id}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Appointment Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-col md:flex-row items-center gap-3 mb-2 md:mb-0">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
              getAppointmentStatusColor(appointment.status?.name ?? "")
            )}
          >
            {getAppointmentStatusIcon(appointment.status?.name ?? "")}
            {(appointment.status?.name?.charAt(0)?.toUpperCase() ?? "") + (appointment.status?.name?.slice(1) ?? "")}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("confirmation")}: {appointment.id}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {appointment.status?.name !== "Cancelled" && (
            <>
              <Link href={`/video-call/${appointment.id}/prepare`}>
                <Button variant="default" size="sm" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t("buttons.join")}
                </Button>
              </Link>
              <Button onClick={() => handleReschedule()} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t("buttons.reschedule")}
              </Button>
              <Button
                onClick={() => handleCancel()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
                {t("buttons.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Appointment Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("appointmentDetails.title")}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src={`/icons/Calender.png`}
                alt={t("appointmentDetails.title")}
                width={100}
                height={100}
                className="h-[30px] w-[22px] object-cover"
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("appointmentDetails.dateTime")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{dateAndTime}</p>
                {dateAndTimeKSA && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("appointmentDetails.ksaTime")}: {dateAndTimeKSA}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Image
                src={`/icons/Doctor.svg`}
                alt={t("appointmentDetails.doctor")}
                width={100}
                height={100}
                className="h-[30px] w-[22px] object-cover"
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("appointmentDetails.doctor")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{displayDoctorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Image
                src={`/icons/Icons-16.png`}
                alt={t("appointmentDetails.service")}
                width={50}
                height={50}
                className="h-[30px] w-[22px] object-cover"
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("appointmentDetails.service")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{serviceTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Image
                src={`/icons/Location1.png`}
                alt={t("appointmentDetails.location")}
                width={100}
                height={100}
                className="h-[30px] w-[22px] object-cover"
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("appointmentDetails.location")}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {appointment.description?.toLocaleLowerCase().includes("virtual")
                    ? t("appointmentDetails.virtualVisit")
                    : t("appointmentDetails.inClinic")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Patient Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("patientInformation.title")}</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("patientInformation.fullName")}</p>
              <p className="font-medium text-gray-900 dark:text-white">{fullName}</p>
            </div>
            {patientData?.emailAddress && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("patientInformation.email")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{patientData?.emailAddress}</p>
              </div>
            )}
            {patientData?.contactNumber && (
              <div className="">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("patientInformation.phoneNumber")}</p>
                <p dir="ltr" className="font-medium ltr:text-left rtl:text-right text-gray-900 dark:text-white">
                  {patientData.contactNumber}
                </p>
                {patientData?.alternativeContactNumber && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("patientInformation.alternative")}: {patientData.alternativeContactNumber}
                  </p>
                )}
              </div>
            )}
            {nationality?.name && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("patientInformation.nationality")}</p>
                <p className="font-medium text-gray-900 dark:text-white">{nationality?.name ?? "-"}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("patientInformation.gender")}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {patientData?.sex === 0 ? t("patientInformation.genders.female") : t("patientInformation.genders.male")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{patientData?.identityIdType?.name}</p>
              <p className="font-medium text-gray-900 dark:text-white">{patientData?.identityId ?? "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <AlertDialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <AlertDialogContent className="!max-w-[800px] max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reschedule.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("reschedule.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          {loadingAppointmentStatus ? (
            <div className="p-4 flex justify-center items-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("reschedule.selectDate")}</h3>
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
                      {t("reschedule.selected")}:{" "}
                      <span className="font-medium">{format(selectedRescheduleDate, "EEEE, MMMM do, yyyy")}</span>
                    </p>
                    {!isKSA && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {t("reschedule.ksaTime")}:{" "}
                        {selectedRescheduleTimeSlot && (availabilityData?.length ?? 0) > 0
                          ? formatInTimeZone(
                              availabilityData?.find((slot) => slot.start === selectedRescheduleTimeSlot)?.start ??
                                new Date().toISOString(),
                              KSA_TIMEZONE,
                              "EEEE, MMMM do, yyyy"
                            )
                          : formatInTimeZone(selectedRescheduleDate, KSA_TIMEZONE, "EEEE, MMMM do, yyyy")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("reschedule.selectTime")}</h3>
                {!selectedRescheduleDate ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">{t("reschedule.selectDateFirst")}</p>
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
                          <div>
                            {format(slot.start ?? "", "hh:mm aa")}
                            {!isKSA && (
                              <span className="text-xs block opacity-75 mt-0.5">
                                ({formatInTimeZone(slot.start ?? new Date().toISOString(), KSA_TIMEZONE, "hh:mm aa")}{" "}
                                {t("reschedule.ksaTime")})
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
                        {t("reschedule.noAvailability", {
                          date: selectedRescheduleDate ? format(selectedRescheduleDate, "dd-MM-yyyy") : "the selected date",
                        })}
                      </p>
                    )}
                  </div>
                )}
                {selectedRescheduleTimeSlot && (availabilityData?.length ?? 0) > 0 && (
                  <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-md">
                    <p className="text-sm text-primary dark:text-primary-200">
                      {t("reschedule.selected")}:{" "}
                      <span className="font-medium">
                        {format(
                          availabilityData?.find((slot) => slot.start === selectedRescheduleTimeSlot)?.start ??
                            new Date().toISOString(),
                          "hh:mm aa"
                        )}
                      </span>
                      {!isKSA && (
                        <span className="text-xs ml-2 opacity-75">
                          (
                          {`${formatInTimeZone(
                            availabilityData?.find((slot) => slot.start === selectedRescheduleTimeSlot)?.start ??
                              new Date().toISOString(),
                            KSA_TIMEZONE,
                            "hh:mm aa"
                          )} ${t("reschedule.ksaTime")}`}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRescheduling}>{t("reschedule.buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRescheduling || !selectedRescheduleDate || !selectedRescheduleTimeSlot}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRescheduleConfirm();
              }}
            >
              {isRescheduling ? <Spinner /> : t("reschedule.buttons.confirmReschedule")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancel.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("cancel.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t("cancel.buttons.keepAppointment")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setIsCancelling(true);
                  if (!appointment.id) return;
                  await cancelAppointment({
                    appointmentId: appointment.id,
                    cancelledStatusId: cancelledAppointmentStatusId ?? 0,
                  });
                  mutateCurrentUserAppointments(undefined);
                } finally {
                  setIsCancelling(false);
                  setShowCancelConfirm(false);
                }
              }}
            >
              {isCancelling ? <Spinner /> : t("cancel.buttons.yesCancel")}
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
    case "Approved/Confirmed":
      return "bg-primary/10 text-primary";
    case "Approved/Confirmed":
      return "bg-primary/10 text-primary";
    case "Cancelled":
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
    case "Cancelled":
      return <X className="h-4 w-4" />;
    default:
      return (
        <Image
          src={`/icons/Calender.png`}
          alt="Manage Your Appointment"
          width={100}
          height={100}
          className="h-[20px] w-[20px] object-cover"
        />
      );
  }
};

export default AppointmentCard;
