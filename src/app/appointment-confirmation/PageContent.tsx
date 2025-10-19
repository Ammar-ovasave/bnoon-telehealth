"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, User, Mail, Globe, Users, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { clinicLocations } from "@/models/ClinicModel";
import { services } from "@/models/ServiceModel";
import { FC } from "react";
import { doctors } from "@/models/DoctorModel";

export const PageContent: FC = () => {
  const searchParams = useSearchParams();

  const selectedVisitType = searchParams.get("selectedVisitType") || "Virtual Visit";
  const selectedDoctor = searchParams.get("selectedDoctor") || "Dr. Ahmad Bekar";
  const selectedService = searchParams.get("selectedService") || "General Consultation";
  const selectedClinicLocation = searchParams.get("selectedClinicLocation") || "Virtual";
  const selectedDate = searchParams.get("selectedDate") || new Date().toLocaleDateString();
  const selectedTimeSlot = searchParams.get("selectedTimeSlot") || "10:00 AM";
  const fullName = searchParams.get("fullName") || "Patient Name";
  const email = searchParams.get("email") || "patient@email.com";
  const nationality = searchParams.get("nationality") || "Saudi Arabia";
  const gender = searchParams.get("gender") || "Male";
  const idType = searchParams.get("idType") || "National ID";
  const idNumber = searchParams.get("idNumber") || "1234567890";

  const confirmationNumber = `BN${Date.now().toString().slice(-8)}`;

  const clinic = clinicLocations.find((clinic) => clinic.id === selectedClinicLocation);

  const service = services.find((service) => service.id === selectedService);

  const doctor = doctors.find((doc) => doc.id === selectedDoctor);

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Appointment Confirmed!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your appointment has been successfully booked and confirmed. You will receive a confirmation email shortly with all
            the details.
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
              <Calendar className="h-5 w-5 text-primary" />
              Appointment Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedDate} at {selectedTimeSlot}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Visit Type</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedVisitType}</span>
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
                <span className="font-medium text-gray-900 dark:text-white">{`${clinic?.name}`}</span>
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
                  Email
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Nationality
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{nationality}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gender
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{gender}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {idType}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{idNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-primary/10 rounded-lg p-6 border border-primary">
          <h3 className="text-lg font-semibold text-primary dark:text-primary mb-3">{"What's Next?"}</h3>
          <div className="space-y-2 text-primary">
            <p>• You will receive a confirmation email with your appointment details</p>
            <p>• {`For virtual visits, you'll receive a meeting link in the confirmation email`}</p>
            <p>• For in-person visits, please arrive 10 minutes early at the clinic location</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/manage-appointments">
            <Button size="lg" className="px-8 py-3">
              <CalendarDays className="h-4 w-4 mr-2" />
              Manage Appointments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
