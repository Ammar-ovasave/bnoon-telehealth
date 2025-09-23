"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { clinicLocations } from "@/models/ClinicModel";
import { ArrowRight } from "lucide-react";
import ClinicCard from "@/components/ClinicCard";
import Link from "next/link";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Clinic Location</h1>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 block md:hidden">
          <Link
            href={selectedLocation ? `/interest?selectedClinicLocation=${encodeURIComponent(selectedLocation)}` : "#"}
            aria-disabled={!selectedLocation}
          >
            <Button disabled={!selectedLocation} size="lg" className="px-8 w-full py-3 text-lg font-semibold">
              Continue with Selected Location <ArrowRight />
            </Button>
          </Link>
        </div>
        <div className="justify-center hidden md:flex">
          <Link
            href={selectedLocation ? `/interest?selectedClinicLocation=${encodeURIComponent(selectedLocation)}` : "#"}
            aria-disabled={!selectedLocation}
          >
            <Button disabled={!selectedLocation} size="lg" className="px-8 py-3 text-lg font-semibold">
              {/* onClick={handleContinue} */}
              Continue with Selected Location <ArrowRight />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
