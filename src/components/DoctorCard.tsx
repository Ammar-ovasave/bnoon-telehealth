import { DoctorModel } from "@/models/DoctorModel";
import { FC } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
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
          <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={25} height={20} className="size-[20px] mb-[2px]" />
          <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={25} height={20} className="size-[20px]" />
        </>
      );
    } else if (doctor.availability.clinic) {
      return <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={25} height={20} />;
    } else {
      return <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={25} height={20} />;
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
        <div className="space-y-1 flex flex-col h-full">
          {/* Languages */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
              <Image src={`/icons/Language.png`} alt="Languages" width={25} height={20} className="size-[30px] object-cover" />
              <span>{doctor.languages.join(", ")}</span>
            </div>
          </div>
          {/* Availability */}
          <div className="flex items-center mb-4 justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
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
