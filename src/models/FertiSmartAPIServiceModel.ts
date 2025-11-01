export interface FertiSmartAPIServiceModel {
  id?: number;
  name?: string;
  durationInMinutes?: number;
  noBookingBefore?: string;
  price?: number;
  currency?: string;
  code?: string;
  remarks?: string;
  active?: boolean;
}
