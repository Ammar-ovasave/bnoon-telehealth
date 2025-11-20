"use client";
import { Service } from "@/models/ServiceModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ServiceCardProps {
  service: Service;
  // selectedService: string;
  // setSelectedService: (service: string) => void;
}

const ServiceCard: FC<ServiceCardProps> = ({ service }) => {
  const searchParams = useSearchParams();

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("selectedService", service.id);
    return params.toString();
  }, [service.id, searchParams]);

  return (
    <Link href={`/doctors?${newUrlSearchParams.toString()}`}>
      <Card
        className={cn(
          "cursor-pointer relative gap-0 justify-center transition-all duration-300 hover:shadow-xl overflow-hidden h-full"
        )}
      >
        <CardHeader className="text-center px-4 gap-0">
          <div className="text-4xl flex justify-center mb-0">
            {service.imageSrc ? (
              <Image
                width={service.imageWidth ?? 50}
                height={service.imageHeight ?? 50}
                src={service.imageSrc}
                alt={service.title}
                className={cn("h-[80px] w-[80px] object-contain", service.imageClassName)}
              />
            ) : (
              service.icon
            )}
          </div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.title}</CardTitle>
          <CardDescription className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {service.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ServiceCard;
