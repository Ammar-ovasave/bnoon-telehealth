"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { clinicLocations } from "@/models/ClinicModel";
import ClinicCard from "@/components/ClinicCard";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const handleContinue = () => {
    if (selectedLocation) {
      console.log("Selected location:", selectedLocation);
      // Here you would typically navigate to the next step or make an API call
      alert(`Selected: ${clinicLocations.find((loc) => loc.id === selectedLocation)?.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Your Clinic Location</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose your preferred Bnoon clinic location for your virtual visit. All locations offer the same high-quality
            services.
          </p>
        </div>
        {/* Clinic Selection */}
        <div className="mb-8">
          <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicLocations.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                />
              ))}
            </div>
          </RadioGroup>
        </div>
        {/* Continue Button */}
        <div className="flex justify-center">
          <Button onClick={handleContinue} disabled={!selectedLocation} size="lg" className="px-8 py-3 text-lg font-semibold">
            Continue with Selected Location
          </Button>
        </div>
        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What happens next?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                After selecting your clinic location, you&apos;ll be connected to our virtual waiting room where you can see your
                estimated wait time and prepare for your consultation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
