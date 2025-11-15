import { DoctorModel } from "@/models/DoctorModel";
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { MapPin, Video, Award, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

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
        "cursor-pointer gap-0 relative transition-all duration-300 hover:shadow-xl overflow-hidden h-full py-4",
        selectedDoctor === doctor.id ? "ring-2 ring-primary bg-blue-50 dark:bg-blue-950/20 shadow-lg" : "hover:shadow-lg"
      )}
      onClick={() => setSelectedDoctor(doctor.id)}
    >
      <CardHeader className="text-center px-4 gap-1">
        {/* Doctor Photo */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src={doctor.photo}
            alt={`${doctor.name} photo`}
            fill
            className="object-cover rounded-full border-4 border-white shadow-lg"
            sizes="96px"
          />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">{doctor.name}</CardTitle>
        <CardDescription className="text-primary text-sm font-semibold mb-2">{doctor.specialty}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1 px-4">
        <div className="space-y-3 flex flex-col h-full">
          {/* Languages */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
              <Award className="h-4 w-4" />
              <span>{doctor.languages.join(", ")}</span>
            </div>
          </div>
          {/* Availability */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            {getAvailabilityIcon()}
            <span className="font-medium">{getAvailabilityText()}</span>
          </div>
          <Button className="w-full mt-auto cursor-pointer" variant="default" onClick={() => setSelectedDoctor(doctor.id)}>
            Book an Appointment
            <ChevronRight className="size-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
