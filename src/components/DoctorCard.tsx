import { DoctorModel } from "@/models/DoctorModel";
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { MapPin, Video, Clock, Award } from "lucide-react";
import Image from "next/image";

interface DoctorCardProps {
  doctor: DoctorModel;
  selectedDoctor: string;
  setSelectedDoctor: (doctor: string) => void;
}

const DoctorCard: FC<DoctorCardProps> = ({ doctor, selectedDoctor, setSelectedDoctor }) => {
  const getAvailabilityText = () => {
    if (doctor.availability.clinic && doctor.availability.virtual) {
      return "Clinic & Virtual";
    } else if (doctor.availability.clinic) {
      return "Clinic Only";
    } else {
      return "Virtual Only";
    }
  };

  const getAvailabilityIcon = () => {
    if (doctor.availability.clinic && doctor.availability.virtual) {
      return (
        <>
          <MapPin className="h-4 w-4" />
          <Video className="h-4 w-4" />
        </>
      );
    } else if (doctor.availability.clinic) {
      return <MapPin className="h-4 w-4" />;
    } else {
      return <Video className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer relative transition-all duration-300 hover:shadow-xl overflow-hidden h-full",
        selectedDoctor === doctor.id ? "ring-2 ring-primary bg-blue-50 dark:bg-blue-950/20 shadow-lg" : "hover:shadow-lg"
      )}
      onClick={() => setSelectedDoctor(doctor.id)}
    >
      <div className="absolute top-4 left-4">
        <RadioGroupItem
          value={doctor.id}
          id={doctor.id}
          className={cn(
            "bg-white/90 cursor-pointer size-4 rounded-full backdrop-blur-sm border-2 border-white/50",
            selectedDoctor === doctor.id ? "ring-2 ring-primary" : ""
          )}
        />
      </div>

      <CardHeader className="text-center">
        {/* Doctor Photo */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <Image
            src={doctor.photo}
            alt={`${doctor.name} photo`}
            fill
            className="object-cover rounded-full border-4 border-white shadow-lg"
            sizes="96px"
          />
        </div>

        {/* Doctor Name */}
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">{doctor.name}</CardTitle>

        {/* Specialty */}
        <CardDescription className="text-base text-primary font-semibold mb-2">{doctor.specialty}</CardDescription>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">({doctor.experience})</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Availability */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            {getAvailabilityIcon()}
            <span className="font-medium">{getAvailabilityText()}</span>
          </div>

          {/* First Available Slot */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="font-medium">{doctor.firstAvailableSlot}</span>
          </div>

          {/* Languages */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Award className="h-3 w-3" />
              <span>{doctor.languages.join(", ")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
