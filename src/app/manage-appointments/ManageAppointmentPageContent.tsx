"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import AppointmentCard from "./_components/AppointmentCard";
import ClinicBranchSelect from "@/components/ClinicBranchSelect";
import Image from "next/image";

export default function ManageAppointmentPageContent() {
  const { data: currentUserAppointmentsData, isLoading } = useCurrentUserAppointments();

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Image
                src={`/icons/Calender.png`}
                alt="Manage Your Appointment"
                width={100}
                height={100}
                className="size-[70px] object-contain"
              />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white md:text-4xl">Manage Your Appointment</h1>
          <p className="mx-auto max-w-3xl text-gray-600 dark:text-gray-300 md:text-lg">
            View, reschedule, or cancel your appointments.
          </p>
        </div>
        <ClinicBranchSelect className="mb-10" />
        {/* Appointments List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center">
              <Spinner className="size-10" />
            </div>
          ) : (currentUserAppointmentsData?.length ?? 0) === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No Appointments Found</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">{`You don't have any appointments scheduled.`}</p>
              <Link href="/">
                <Button size="lg" className="px-8 py-3">
                  Book New Appointment
                </Button>
              </Link>
            </div>
          ) : (
            currentUserAppointmentsData?.map((appointment) => {
              return <AppointmentCard key={appointment.id} appointment={appointment} />;
            })
          )}
        </div>
        {/* Book New Appointment */}
        {(currentUserAppointmentsData?.length ?? 0) > 0 && (
          <div className="mt-8 text-center">
            <Link href="/">
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
