import { Button } from "@/components/ui/button";
import { FC } from "react";
import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  enabled: boolean;
  onClick: () => void;
}

const MicButton: FC<MicButtonProps> = ({ onClick, enabled }) => {
  return (
    <Button variant="default" size="icon" onClick={onClick} className="bg-primary text-primary-foreground hover:bg-primary/90">
      {enabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
    </Button>
  );
};

export default MicButton;
