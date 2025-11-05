"use client";
import { ClinicLocation } from "@/models/ClinicModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { setClinicBranch } from "@/services/clinicBranch";
import Image from "next/image";

const ClinicCard: FC<ClinicCardProps> = ({ clinic }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("selectedClinicLocation", clinic.id);
    return params.toString();
  }, [clinic.id, searchParams]);

  return (
    <Card
      key={clinic.id}
      className={`cursor-pointer gap-0 relative h-80 w-full transition-all duration-300 hover:shadow-xl overflow-hidden p-0`}
      onClick={
        clinic.isCommingSoon
          ? undefined
          : async () => {
              await setClinicBranch({ id: clinic.id });
              router.push(`/interest?${newUrlSearchParams.toString()}`);
            }
      }
    >
      <Image
        src={clinic.imageSrc}
        alt={`${clinic.name} clinic`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
      {/* <div className="relative w-full h-64">
        {selectedLocation === clinic.id && (
          <div className="absolute top-4 left-4">
            <CheckCircle2 className="text-primary bg-white rounded-full" />
            <RadioGroupItem
            value={clinic.id}
            id={clinic.id}
            className={cn(
              "bg-white/90 cursor-pointer size-4 rounded-full backdrop-blur-sm border-2 border-white/50",
              selectedLocation === clinic.id ? "ring-2 ring-primary dark:bg-blue-950/20 shadow-lg" : "hover:shadow-lg"
            )}
          />
          </div>
        )}
      </div> */}
      {/* Clinic Information */}
      <div className="p-4 relative z-10 h-full flex flex-col justify-end">
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-bold text-white">{clinic.name}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-white" />
            <span className="text-white">{clinic.address}</span>
          </CardDescription>
        </CardHeader>
        {/* {selectedLocation === clinic.id && (
            <CheckCircle2 className="text-primary bg-white rounded-full absolute top-2 left-2" />
          )} */}
        {clinic.isCommingSoon && (
          <p className="text-white text-sm absolute top-2 z-20 right-2 bg-white/20 rounded-sm px-2 backdrop-blur-2xl">
            Comming Soon
          </p>
        )}
        {/* <CardContent className="p-0">
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
        </CardContent> */}
      </div>
    </Card>
  );
};

interface ClinicCardProps {
  clinic: ClinicLocation;
  // selectedLocation: string;
  // setSelectedLocation: (location: string) => void;
}

export default ClinicCard;
