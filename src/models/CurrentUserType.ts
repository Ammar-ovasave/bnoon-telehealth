import { FertiSmartPatientModel } from "./FertiSmartPatientModel";

export type CurrentUserType = Pick<FertiSmartPatientModel, "mrn" | "firstName" | "lastName" | "contactNumber" | "emailAddress">;
