import { VisitType } from "@/models/VisitTypeModel";
import { FC, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

interface VisitTypeCardProps {
  visitType: VisitType;
  selectedVisitType: string;
  setSelectedVisitType: (visitType: string) => void;
}

const VisitTypeCard: FC<VisitTypeCardProps> = ({ visitType, selectedVisitType, setSelectedVisitType }) => {
  const colors = useMemo(() => {
    switch (visitType.color) {
      case "blue":
        return {
          border: "border-blue-200 dark:border-blue-800",
          selected: "ring-blue-500 bg-blue-50 dark:bg-blue-950/20",
          icon: "text-blue-600 dark:text-blue-400",
          check: "text-blue-500",
        };
      case "green":
        return {
          border: "border-green-200 dark:border-green-800",
          selected: "ring-green-500 bg-green-50 dark:bg-green-950/20",
          icon: "text-green-600 dark:text-green-400",
          check: "text-green-500",
        };
      default:
        return {
          border: "border-gray-200 dark:border-gray-800",
          selected: "ring-primary bg-blue-50 dark:bg-blue-950/20",
          icon: "text-gray-600 dark:text-gray-400",
          check: "text-primary",
        };
    }
  }, [visitType.color]);

  return (
    <Card
      className={cn(
        "cursor-pointer relative transition-all duration-300 hover:shadow-xl overflow-hidden h-full",
        colors.border,
        selectedVisitType === visitType.id ? `${colors.selected} shadow-lg ring-2` : "hover:shadow-lg"
      )}
      onClick={() => setSelectedVisitType(visitType.id)}
    >
      <div className="absolute top-4 left-4">
        <RadioGroupItem
          value={visitType.id}
          id={visitType.id}
          className={cn(
            "bg-white/90 cursor-pointer size-4 rounded-full backdrop-blur-sm border-2 border-white/50",
            selectedVisitType === visitType.id ? "ring-2 ring-primary" : ""
          )}
        />
      </div>

      <CardHeader className="text-center">
        {/* Visit Type Icon */}
        <div className="text-6xl mb-4">{visitType.icon}</div>

        {/* Visit Type Title */}
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{visitType.title}</CardTitle>

        {/* Visit Type Description */}
        <CardDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          {visitType.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default VisitTypeCard;
