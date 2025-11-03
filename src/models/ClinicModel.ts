export interface ClinicLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  doctors: string;
  apiUrl: string;
  imageSrc: string;
  contactNumber: string;
  contactEmail: string;
  isCommingSoon?: boolean;
}

export const clinicLocations: ClinicLocation[] = [
  {
    id: "riyadh-granada",
    name: "Bnoon Riyadh - Granada",
    city: "Riyadh",
    address: "Granada District, Riyadh, Saudi Arabia",
    doctors: "15 specialists",
    imageSrc: "/images/bnoon-riyadh.jpg",
    contactEmail: "info@bnoon.sa",
    contactNumber: "+966114448080",
    apiUrl: `https://unvaunted-weedily-jannie.ngrok-free.dev`,
  },
  {
    id: "riyadh-king-salman",
    name: "Bnoon Riyadh - King Salman Road",
    city: "Riyadh",
    address: "King Salman Road, Riyadh, Saudi Arabia",
    doctors: "18 specialists",
    imageSrc: "/images/bnoon-north-riiyadh.jpg",
    contactEmail: "info@bnoon.sa",
    contactNumber: "+966114448080",
    isCommingSoon: true,
    apiUrl: `https://unvaunted-weedily-jannie.ngrok-free.dev`,
  },
  {
    id: "jeddah",
    name: "Bnoon Jeddah",
    city: "Jeddah",
    address: "Jeddah, Saudi Arabia",
    doctors: "12 specialists",
    imageSrc: "/images/bnoon-jeddah.jpg",
    contactEmail: "info.jeddah@bnoon.sa",
    contactNumber: "+966126800800",
    apiUrl: `https://undeclarable-kolby-overgraciously.ngrok-free.dev`,
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
