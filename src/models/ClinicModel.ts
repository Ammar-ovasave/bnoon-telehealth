export type ClinicBranchID = "riyadh-granada" | "riyadh-king-salman" | "jeddah" | "al-ahsa";

export interface ClinicLocation {
  id: ClinicBranchID;
  name: string;
  city: string;
  address: string;
  doctors: string;
  apiUrl: string | null;
  imageSrc: string;
  contactNumber: string;
  contactEmail: string;
  isCommingSoon?: boolean;
  hideComingSoonBadge?: boolean;
}

export const clinicLocations: ClinicLocation[] = [
  {
    id: "riyadh-granada",
    name: "Bnoon - Riyadh",
    city: "Riyadh",
    address: "Granada District",
    doctors: "15 specialists",
    imageSrc: "/images/bnoon-riyadh.jpg",
    contactEmail: "info@bnoon.sa",
    contactNumber: "+966114448080",
    apiUrl: `https://unvaunted-weedily-jannie.ngrok-free.dev`,
  },
  {
    id: "riyadh-king-salman",
    name: "Bnoon – Riyadh",
    city: "Riyadh",
    address: "King Salman Road",
    doctors: "18 specialists",
    imageSrc: "/images/bnoon-north-riiyadh.jpg",
    contactEmail: "info@bnoon.sa",
    contactNumber: "+966114448080",
    isCommingSoon: true,
    apiUrl: null,
  },
  {
    id: "jeddah",
    name: "Bnoon – Jeddah",
    city: "Jeddah",
    address: "Alshatae District",
    doctors: "12 specialists",
    imageSrc: "/images/bnoon-jeddah.jpg",
    contactEmail: "info.jeddah@bnoon.sa",
    contactNumber: "+966126800800",
    apiUrl: `https://undeclarable-kolby-overgraciously.ngrok-free.dev`,
  },
  {
    id: "al-ahsa",
    name: "Bnoon – Al Ahsa",
    city: "Al Ahsa",
    address: "Almoosa Specialist Hospital, North Tower, Floor 12",
    doctors: "12 specialists",
    imageSrc: "/images/alahsa.jpg",
    contactEmail: "info.jeddah@bnoon.sa",
    contactNumber: "+966126800800",
    isCommingSoon: true,
    hideComingSoonBadge: true,
    apiUrl: null,
  },
];

export const groupClinicsByCity = () => {
  return clinicLocations.reduce((acc, clinic) => {
    if (!acc[clinic.city]) {
      acc[clinic.city] = [];
    }
    acc[clinic.city].push(clinic);
    return acc;
  }, {} as Record<string, ClinicLocation[]>);
};
