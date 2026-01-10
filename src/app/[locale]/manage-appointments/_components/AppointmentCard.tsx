"use client";
import { FC } from "react";
import { AppointmentDto } from "@/services/bnoon-api/types";
import InPersonAppointmentCard from "./InPersonAppointmentCard";
import VirtualAppointmentCard from "./VirtualAppointmentCard";

export interface AppointmentCardProps {
  appointment: AppointmentDto;
  isHighlighted?: boolean;
}

/**
 * Wrapper component that renders the appropriate appointment card
 * based on the appointment's visit type (virtual or in-person).
 */
const AppointmentCard: FC<AppointmentCardProps> = ({ appointment, isHighlighted = false }) => {
  const isVirtualAppointment = appointment.visitType === "virtual";

  if (isVirtualAppointment) {
    return <VirtualAppointmentCard appointment={appointment} isHighlighted={isHighlighted} />;
  }

  return <InPersonAppointmentCard appointment={appointment} isHighlighted={isHighlighted} />;
};

export default AppointmentCard;
