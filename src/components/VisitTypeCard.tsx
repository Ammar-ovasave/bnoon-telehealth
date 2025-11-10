"use client";
import { VisitType } from "@/models/VisitTypeModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface VisitTypeCardProps {
  visitType: VisitType;
}

const VisitTypeCard: FC<VisitTypeCardProps> = ({ visitType }) => {
  const searchparams = useSearchParams();

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchparams);
    params.set("selectedVisitType", visitType.id);
    return params.toString();
  }, [visitType.id, searchparams]);

  return (
    <Link href={`/doctors?${newUrlSearchParams.toString()}`}>
      <Card className={cn("cursor-pointer relative transition-all duration-300 hover:shadow-xl overflow-hidden h-full")}>
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{visitType.icon}</div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{visitType.title}</CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {visitType.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default VisitTypeCard;
