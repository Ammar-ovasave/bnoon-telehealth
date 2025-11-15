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
    <Link href={`/doctors?${newUrlSearchParams.toString()}`}>
      <Card
        className={cn(
          "cursor-pointer relative gap-0 justify-center transition-all duration-300 hover:shadow-xl overflow-hidden h-full"
        )}
      >
        <CardHeader className="text-center px-4">
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
