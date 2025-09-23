import { ClinicLocation } from "@/models/ClinicModel";
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { MapPin, PhoneCall, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ClinicCard: FC<ClinicCardProps> = ({ clinic, selectedLocation, setSelectedLocation }) => {
  return (
    <Card
      key={clinic.id}
      className={`cursor-pointer gap-0 transition-all duration-300 hover:shadow-xl overflow-hidden p-0 ${
        selectedLocation === clinic.id ? "ring-2 ring-primary dark:bg-blue-950/20 shadow-lg" : "hover:shadow-lg"
      }`}
      onClick={() => setSelectedLocation(clinic.id)}
    >
      {/* Clinic Image */}
      <div className="relative w-full h-64">
        <Image
          src={clinic.imageSrc}
          alt={`${clinic.name} clinic`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4">
          <RadioGroupItem
            value={clinic.id}
            id={clinic.id}
            className={cn(
              "bg-white/90 cursor-pointer size-4 rounded-full backdrop-blur-sm border-2 border-white/50",
              selectedLocation === clinic.id ? "ring-2 ring-primary dark:bg-blue-950/20 shadow-lg" : "hover:shadow-lg"
            )}
          />
        </div>
      </div>
      {/* Clinic Information */}
      <div className="p-4">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">{clinic.name}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-300">{clinic.address}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{clinic.doctors}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <PhoneCall className="h-4 w-4 text-green-500" />
              <span>Virtual visits available</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

interface ClinicCardProps {
  clinic: ClinicLocation;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

export default ClinicCard;
