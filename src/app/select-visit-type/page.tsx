"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { useRouter, useSearchParams } from "next/navigation";
import { visitTypes } from "@/models/VisitTypeModel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import VisitTypeCard from "@/components/VisitTypeCard";

export default function SelectVisitTypePage() {
  const [selectedVisitType, setSelectedVisitType] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("selectedService");
  const selectedClinicLocation = searchParams.get("selectedClinicLocation");
  const selectedDoctor = searchParams.get("selectedDoctor");

  const handleBack = () => {
    router.back();
  };

  const handleVisitTypeChange = (visitType: string) => {
    setSelectedVisitType(visitType);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-30">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Visit Type</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose how you&apos;d like to have your consultation. Both options provide excellent care tailored to your needs.
          </p>
        </div>
        {/* Visit Type Selection */}
        <div className="mb-8">
          <RadioGroup value={selectedVisitType} onValueChange={setSelectedVisitType}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visitTypes.map((visitType) => (
                <VisitTypeCard
                  key={visitType.id}
                  visitType={visitType}
                  selectedVisitType={selectedVisitType}
                  setSelectedVisitType={handleVisitTypeChange}
                />
              ))}
            </div>
          </RadioGroup>
        </div>
        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between container">
            <Button
              onClick={handleBack}
              variant="outline"
              size="lg"
              className={cn("px-6 py-3 w-full md:w-auto", selectedVisitType && "opacity-50")}
            >
              <ArrowLeft /> Back to Doctor Selection
            </Button>
            <Link
              href={
                selectedVisitType
                  ? `/appointment?selectedVisitType=${encodeURIComponent(
                      selectedVisitType
                    )}&selectedDoctor=${selectedDoctor}&selectedService=${selectedService}&selectedClinicLocation=${selectedClinicLocation}`
                  : "#"
              }
            >
              <Button
                disabled={!selectedVisitType}
                id="continue-button"
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
              >
                Continue with Selected Visit Type <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
