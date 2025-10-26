"use client";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays } from "lucide-react";
import Link from "next/link";
import useCurrentUserAppointments from "@/hooks/useCurrentUserAppointments";
import AppointmentCard from "./_components/AppointmentCard";
import { Spinner } from "@/components/ui/spinner";

export default function ManageAppointmentsPage() {
  const { data: currentUserAppointmentsData, isLoading } = useCurrentUserAppointments();

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
          {isLoading ? (
            <div className="flex justify-center">
              <Spinner className="size-10" />
            </div>
          ) : (currentUserAppointmentsData?.length ?? 0) === 0 ? (
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
