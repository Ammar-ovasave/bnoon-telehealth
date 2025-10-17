"use client";
import { Service } from "@/models/ServiceModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
    <Link href={`/select-visit-type?${newUrlSearchParams.toString()}`}>
      <Card
        className={cn(
          "cursor-pointer relative gap-0 justify-center transition-all duration-300 hover:shadow-xl overflow-hidden h-full"
        )}
        // onClick={() => setSelectedService(service.id)}
      >
        {/* <div className="absolute top-4 left-4">
        <RadioGroupItem
          value={service.id}
          id={service.id}
          className={cn(
            "bg-white/90 cursor-pointer size-4 rounded-full backdrop-blur-sm border-2 border-white/50",
            selectedService === service.id ? "ring-2 ring-primary" : ""
          )}
        />
      </div> */}
        <CardHeader className="text-center">
          <div className="text-4xl mb-3">{service.icon}</div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {service.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ServiceCard;
