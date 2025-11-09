import { SwitchBranchPayload } from "@/models/SwitchBranchPayload";
import { switchBranch } from "@/services/client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import useCurrentUser from "./useCurrentUser";
import useCurrentBranch from "./useCurrentBranch";
import useCurrentUserAppointments from "./useCurrentUserAppointments";

export default function useSwitchBranch() {
  const [loading, setLoading] = useState(false);
  const { mutate: mutateCurrentUser } = useCurrentUser();
  const { mutate: mutateCurrentBranch } = useCurrentBranch();
  const { mutate: mutatePatientAppointments } = useCurrentUserAppointments();

  const handleSwitchBranch = useCallback(
    async ({ payload }: { payload: SwitchBranchPayload }) => {
      setLoading(true);
      const success = await switchBranch(payload);
      if (success) {
        mutateCurrentBranch(undefined);
        mutateCurrentUser(undefined);
        mutatePatientAppointments(undefined);
      } else {
        toast.error("Something went wrong");
      }
      setLoading(false);
    },
    [mutateCurrentBranch, mutateCurrentUser, mutatePatientAppointments]
  );

  return { loading, handleSwitchBranch };
}
