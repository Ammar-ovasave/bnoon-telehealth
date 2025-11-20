"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Mail, Globe, Users, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { clinicLocations } from "@/models/ClinicModel";
import { services } from "@/models/ServiceModel";
import { FC, useMemo } from "react";
import { doctors } from "@/models/DoctorModel";
import useCurrentUser from "@/hooks/useCurrentUser";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import useFertiSmartAppointment from "@/hooks/useFertiSmartAppointment";
import useFertiSmartPatient from "@/hooks/useFertiSmartPatient";
import LoadingPage from "../loading";
import useFertiSmartCountries from "@/hooks/useFertiSmartCounries";
import Image from "next/image";

export const PageContent: FC = () => {
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointmentId");
  const selectedVisitType = searchParams.get("selectedVisitType") || "-";
  const selectedDoctor = searchParams.get("selectedDoctor") || "-";
  const selectedService = searchParams.get("selectedService") || "-";
  const selectedClinicLocation = searchParams.get("selectedClinicLocation") || "-";

  const { data: countriesData, isLoading: loadingCountries } = useFertiSmartCountries();

  const { data: appointmentData, isLoading: loadingAppointment } = useFertiSmartAppointment({ id: appointmentId ?? undefined });

  const { data: currentUserData, isLoading: loadingCurrentUser } = useCurrentUser();

  const { data: patientData, isLoading: loadingPatient, fullName } = useFertiSmartPatient();
  const gender = patientData?.sex === 0 ? "Female" : "Male";

  const idType = useMemo(() => {
    return patientData?.identityIdType?.name;
    // if (patientData?.identityIdType?.name?.toLocaleLowerCase()?.includes("passport")) {
    //   return "Passport";
    // }
    // return "National ID";
  }, [patientData?.identityIdType?.name]);

  const patientCountry = useMemo(
    () => countriesData?.find((item) => item.id === patientData?.nationality?.id),
    [countriesData, patientData?.nationality?.id]
  );

  const idNumber = patientData?.identityId ?? "-";

  // Get user's timezone and check if it's KSA
  const userTimezone = useMemo(() => {
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "UTC";
  }, []);

  const isKSA = userTimezone === "Asia/Riyadh";
  const KSA_TIMEZONE = "Asia/Riyadh";

  const selectedTimeSlot = useMemo(() => {
    if (!appointmentData?.time?.start) return "-";
    try {
      return format(appointmentData?.time?.start ?? "", "yyyy-MM-dd hh:mm a");
    } catch (e) {
      console.log("--- no time slot found error", e);
      return "-";
    }
  }, [appointmentData?.time?.start]);

  const selectedTimeSlotKSA = useMemo(() => {
    if (!appointmentData?.time?.start || isKSA) return null;
    try {
      return formatInTimeZone(appointmentData?.time?.start ?? "", KSA_TIMEZONE, "yyyy-MM-dd hh:mm a");
    } catch (e) {
      console.log("--- no KSA time slot found error", e);
      return null;
    }
  }, [appointmentData?.time?.start, isKSA]);

  const confirmationNumber = appointmentData?.id;

  const clinic = useMemo(() => clinicLocations.find((clinic) => clinic.id === selectedClinicLocation), [selectedClinicLocation]);

  const service = useMemo(() => services.find((service) => service.id === selectedService), [selectedService]);

  const doctor = useMemo(() => doctors.find((doc) => doc.id === selectedDoctor), [selectedDoctor]);

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      {loadingAppointment || loadingCurrentUser || loadingPatient || loadingCountries ? (
        <LoadingPage />
      ) : (
        <div className="mx-auto px-4 py-8 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Your Appointment is Confirmed!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your appointment has been successfully booked and confirmed. You will receive a confirmation email or SMS shortly
              with all the details.
            </p>
            <div className="mt-4 bg-primary/10 rounded-lg p-4 border border-primary">
              <p className="text-primary font-medium">
                Confirmation Number: <span className="font-bold">{confirmationNumber}</span>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Appointment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Image
                  src={"/icons/Calender.png"}
                  alt="Appointment Details"
                  width={40}
                  height={40}
                  className="h-[30px] w-[20px] object-cover"
                />
                Appointment Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTimeSlot}</span>
                    {selectedTimeSlotKSA && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">KSA: {selectedTimeSlotKSA}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Visit Type</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedVisitType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Doctor</span>
                  <span className="font-medium text-gray-900 dark:text-white">{doctor?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Service</span>
                  <span className="font-medium text-gray-900 dark:text-white">{service?.title}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">{clinic?.name}</span>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Mobile Number
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentUserData?.contactNumber}</span>
                </div>
                {patientCountry?.name && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Nationality
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{patientCountry?.name ?? "-"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gender
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{gender}</span>
                </div>
                {idType || idNumber ? (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {idType}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{idNumber}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-primary/10 rounded-lg p-6 border border-primary">
            <h3 className="text-lg font-semibold text-primary dark:text-primary mb-3">{"What's Next?"}</h3>
            <div className="space-y-2 text-primary">
              <p>• You will receive a confirmation email or SMS with your appointment details.</p>
              <p>• {`For virtual visits, you'll receive a meeting link with the confirmation email.`}</p>
              <p>
                • For in-person visits, please arrive 10 minutes early at the clinic location. Please bring your ID, passport copy
                and previous medical reports, if any.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center sm:flex-row gap-4 justify-center mt-8">
            <Link href="/manage-appointments">
              <Button size="lg" className="px-8 py-3">
                <CalendarDays className="h-4 w-4 mr-2" />
                Manage Appointments
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
