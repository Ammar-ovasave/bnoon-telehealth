"use client";
import { useMemo } from "react";
import { groupClinicsByCity } from "@/models/ClinicModel";
import { MapPinned } from "lucide-react";
import ClinicCard from "@/components/ClinicCard";

export default function Home() {
  // const [selectedLocation, setSelectedLocation] = useState<string>("");
  const clinicsByCity = useMemo(() => groupClinicsByCity(), []);

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Select Clinic Location</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose your preferred Bnoon clinic location for your virtual visit. All locations offer the same high-quality
            services.
          </p>
        </div>
        {/* Clinic Selection by City */}
        <div className="mb-8">
          {/* <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
          </RadioGroup> */}
          <div className="space-y-12">
            {Object.entries(clinicsByCity).map(([city, clinics]) => (
              <div key={city} className="relative">
                {/* City Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                    <MapPinned className="h-7 w-7 text-secondary" />
                    <h2>{city}</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent ml-4"></div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {clinics.length} {clinics.length === 1 ? "location" : "locations"}
                  </span>
                </div>

                {/* Clinics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {clinics.map((clinic) => (
                    <ClinicCard
                      key={clinic.id}
                      clinic={clinic}
                      // selectedLocation={selectedLocation}
                      // setSelectedLocation={setSelectedLocation}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Continue Button */}
        {/* <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 block md:hidden">
          <Link
            href={selectedLocation ? `/interest?selectedClinicLocation=${encodeURIComponent(selectedLocation)}` : "#"}
            aria-disabled={!selectedLocation}
          >
            <Button disabled={!selectedLocation} size="lg" className="px-8 w-full py-3 text-lg font-semibold">
              Continue with Selected Location <ArrowRight />
            </Button>
          </Link>
        </div> */}
        {/* <div className="justify-center hidden md:flex">
          <Link
            href={selectedLocation ? `/interest?selectedClinicLocation=${encodeURIComponent(selectedLocation)}` : "#"}
            aria-disabled={!selectedLocation}
          >
            <Button disabled={!selectedLocation} size="lg" className="px-8 py-3 text-lg font-semibold">
              Continue with Selected Location <ArrowRight />
            </Button>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
