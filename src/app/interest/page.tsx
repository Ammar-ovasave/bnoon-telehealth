"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { services } from "@/models/ServiceModel";
import ServiceCard from "@/components/ServiceCard";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InterestPage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const router = useRouter();

  const handleContinue = () => {
    if (selectedService) {
      console.log("Selected service:", selectedService);
      // Here you would typically navigate to the next step or make an API call
      alert(`Selected: ${services.find((service) => service.id === selectedService)?.title}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleServiceChange = (service: string) => {
    setSelectedService(service);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Service Are You Interested In?</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Select the service that best describes your needs. Our specialized team will provide expert care and personalized
            treatment plans.
          </p>
        </div>
        {/* Service Selection */}
        <div>
          <RadioGroup value={selectedService} onValueChange={setSelectedService}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selectedService={selectedService}
                  setSelectedService={handleServiceChange}
                />
              ))}
            </div>
          </RadioGroup>
        </div>
        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between items-center container">
            <Button
              onClick={handleBack}
              variant="outline"
              size="lg"
              className={cn("px-6 py-3 w-full md:w-auto", selectedService && "opacity-50")}
            >
              <ArrowLeft /> Back to Clinic Selection
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedService}
              id="continue-button"
              size="lg"
              className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
            >
              Continue with Selected Service <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
