export interface UpdatePatientPayload {
  // 0 female, 1 male
  gender: 1 | 0;
  mrn: string;
  firstName?: string;
  middleName: string;
  lastName?: string;
  maidenName?: string;
  arabicName?: string;
  dob?: string;
  contactNumber?: string;
  alternativeContactNumber?: string;
  emailAddress?: string;
  identityIdTypeId?: number;
  nationalityId?: number;
  identityId?: string;
}
