"use client";
import { services } from "@/models/ServiceModel";
import { FC } from "react";
import ServiceCard from "@/components/ServiceCard";
import useAppointmentServices from "@/hooks/useAppointmentServices";
import { Spinner } from "@/components/ui/spinner";

export const PageContent: FC = () => {
  const { isLoading } = useAppointmentServices({});

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Service Are You Interested In?</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Select the service that best describes your needs. Our specialized team will provide expert care and personalized
            treatment plans.
          </p>
        </div>
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Spinner className="size-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
