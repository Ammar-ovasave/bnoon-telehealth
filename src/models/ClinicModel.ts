export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  doctors: string;
  imageSrc: string;
  contactNumber: string;
  contactEmail: string;
}

export const clinicLocations: ClinicLocation[] = [
  {
    id: "jeddah",
    name: "Bnoon Jeddah",
    address: "Jeddah, Saudi Arabia",
    doctors: "12 specialists",
    imageSrc: "/images/bnoon-jeddah.jpg",
    contactEmail: "info.jeddah@bnoon.sa",
    contactNumber: "+966126800800",
  },
  {
    id: "riyadh-king-salman",
    name: "Bnoon Riyadh - King Salman Road",
    address: "King Salman Road, Riyadh, Saudi Arabia",
    doctors: "18 specialists",
    imageSrc: "/images/bnoon-north-riiyadh.jpg",
    contactEmail: "info@bnoon.sa",
    contactNumber: "+966114448080",
  },
  {
    id: "riyadh-granada",
    name: "Bnoon Riyadh - Granada",
    address: "Granada District, Riyadh, Saudi Arabia",
    doctors: "15 specialists",
    imageSrc: "/images/bnoon-riyadh.jpg",
    contactEmail: "info@bnoon.sa",
    contactNumber: "+966114448080",
  },
];
