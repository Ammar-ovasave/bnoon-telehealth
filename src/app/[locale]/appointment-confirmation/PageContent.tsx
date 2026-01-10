"use client";
import { useSearchParams } from "next/navigation";
import { FC, useMemo } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFertiSmartAppointment from "@/hooks/useFertiSmartAppointment";
import LoadingPage from "../loading";
import { InPersonConfirmation } from "./components/InPersonConfirmation";
import { VirtualConfirmation } from "./components/VirtualConfirmation";

export const PageContent: FC = () => {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  // Data fetching hooks - only fetch appointment and current user
  const { data: appointmentData, isLoading: loadingAppointment } = useFertiSmartAppointment({ id: appointmentId ?? undefined });
  const { data: currentUserData, isLoading: loadingCurrentUser } = useCurrentUser();

  // Compute full name from current user data
  const fullName = useMemo(() => {
    const parts = [
      currentUserData?.firstName,
      currentUserData?.middleName,
      currentUserData?.lastName,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "-";
  }, [currentUserData?.firstName, currentUserData?.middleName, currentUserData?.lastName]);

  const phone = currentUserData?.phone ?? "-";

  // Show loading while fetching data
  if (loadingAppointment || loadingCurrentUser) {
    return <LoadingPage />;
  }

  // Don't render if no appointment data
  if (!appointmentData) {
    return <LoadingPage />;
  }

  // Render the appropriate confirmation component based on visit type
  if (appointmentData.visitType === "virtual") {
    return (
      <VirtualConfirmation
        appointmentData={appointmentData}
        fullName={fullName}
        phone={phone}
      />
    );
  }

  // Default to in-person confirmation
  return (
    <InPersonConfirmation
      appointmentData={appointmentData}
      fullName={fullName}
      phone={phone}
    />
  );
};
