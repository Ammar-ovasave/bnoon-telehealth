import { AppointmentDetailDto } from "@/services/bnoon-api/types";

export interface ConfirmationProps {
  appointmentData: AppointmentDetailDto;
  fullName: string;
  phone: string;
}
