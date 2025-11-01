import { Button } from "@/components/ui/button";
import { FC } from "react";
import { Camera, CameraOff } from "lucide-react";

interface CameraButtonProps {
  enabled: boolean;
  onClick: () => void;
}

const CameraButton: FC<CameraButtonProps> = ({ onClick, enabled }) => {
  return (
    <Button variant="default" size="icon" onClick={onClick} className="bg-primary text-primary-foreground hover:bg-primary/90">
      {enabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
    </Button>
  );
};

export default CameraButton;
