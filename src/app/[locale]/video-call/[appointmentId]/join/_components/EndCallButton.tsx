import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PhoneOff } from "lucide-react";

const EndCallButton: FC = () => {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => setShowConfirmDialog(true)}
        className="bg-destructive text-white hover:bg-destructive/90"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to end the call?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.replace("/manage-appointments")}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EndCallButton;
