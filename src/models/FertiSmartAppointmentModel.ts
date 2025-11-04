import { FertiSmartAppointmentStatusModel } from "./FertiSmartAppointmentStatusModel";
import { FertiSmartBranchModel } from "./FertiSmartBranchModel";
import { FSResourceModel } from "./FSResourceModel";

export interface FertiSmartAppointmentModel {
  id?: number;
  time?: { start?: string; end?: string };
  patientMrn?: string;
  resources?: FSResourceModel[];
  description?: string;
  branch?: FertiSmartBranchModel;
  status?: FertiSmartAppointmentStatusModel;
}
