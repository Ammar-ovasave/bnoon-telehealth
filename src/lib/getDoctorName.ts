import { DoctorModel } from "@/models/DoctorModel";

/**
 * Gets the doctor name based on the current locale.
 * Returns arName if locale is "ar", otherwise returns name.
 *
 * @param doctor - The doctor model object
 * @param locale - The current locale ("ar" or "en")
 * @returns The localized doctor name
 */
export function getDoctorName(doctor: DoctorModel | undefined, locale: string): string {
  if (!doctor) return "";
  if (locale === "ar" && doctor.arName) {
    return doctor.arName;
  }
  return doctor.name;
}
