export interface DoctorModel {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  availability: {
    clinic: boolean;
    virtual: boolean;
  };
  firstAvailableSlot: string;
  // rating: number;
  experience: string;
  languages: string[];
  branchId: string;
}

export const doctors: DoctorModel[] = [
  {
    id: "dr-abdalaziz-al-shahrani",
    name: "Dr. Abdalaziz Al-Shahrani",
    specialty:
      "Group Medical Director Consultant, Reproductive Endorinology, Infertility (IVF) & Gynecological Laproscopic Surgery",
    photo: "/images/dr_ abdulaziz.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Today, 2:00 PM",
    experience: "12 years of experience",
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
  },
  {
    id: "dr-fawaz-edris",
    name: "Dr. Fawaz Edris",
    specialty:
      "Executive Director, Bnoon -Jeddah Consultant, Obstetrics, Gynecology, Maternal Fetal Medicine, Reproductive Endocrinology & Infertility",
    photo: "/images/dr-fawad.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Tomorrow, 10:00 AM",
    experience: "15 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
  {
    id: "dr-mazin-bishara",
    name: "Dr. Mazin Bishara ",
    specialty: "Medical Director, Bnoon - Jeddah Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology & Infertility",
    photo: "/images/dr-mazin-bishra.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Today, 4:30 PM",
    experience: "8 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
  {
    id: "dr-asim-al-wuhaibi",
    name: "Dr. Asim Al Wuhaibi",
    specialty: "Consultant, Reproductive Endorinology & Infertility (IVF)",
    photo: "/images/dr-asim.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Monday, 9:00 AM",
    experience: "10 years of experience",
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
  },
  // {
  //   id: "dr-layla-mansour",
  //   name: "Dr. Hussein Sabban  ",
  //   specialty: "Consultant, Obstetrics, Gynecology, Reproductive Endocrinology, & Infertility",
  //   photo: "/images/dr-hussein-sabban.jpg",
  //   availability: {
  //     clinic: true,
  //     virtual: true,
  //   },
  //   firstAvailableSlot: "Today, 1:00 PM",
  //   experience: "14 years of experience",
  //   languages: ["Arabic", "English"],
  //   branchId: ''
  // },
  {
    id: "dr-ahmed-alshaikh",
    name: "Dr. Ahmed Alshaikh",
    specialty: "Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology & Infertility",
    photo: "/images/dr-ahmed-bekar.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "11 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
  // {
  //   id: "dr-wajdi-al-omari",
  //   name: "Dr. Wajdi Al Omari",
  //   specialty: "Consultant, Reproductive Endorinology & Infertility (IVF)",
  //   photo: "/images/dr-wajdi.jpg",
  //   availability: {
  //     clinic: true,
  //     virtual: true,
  //   },
  //   firstAvailableSlot: "Wednesday, 11:00 AM",
  //   experience: "8 years of experience",
  //   languages: ["Arabic", "English"],
  //   branchId: ''
  // },
  {
    id: "dr-dalia-adel",
    name: "Dr. Dalia Adel",
    specialty: "Consultant, Obstetrics, Gynecology & Infertility (IVF)",
    photo: "/images/dr-dalia.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "6 years of experience",
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
  },
  {
    id: "dr-ahmad-haroun",
    name: "Dr. Ahmad Haroun",
    specialty: "Consultant, Urology & Andrology",
    photo: "/images/dr-haroun.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "7 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
  {
    id: "dr-moussa-el-naiemy",
    name: "Dr. Moussa El Naiemy",
    specialty: "Consultant, Male Infertility & Andrology",
    photo: "/images/dr-moussa.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "11 years of experience",
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
  },
  {
    id: "dr-maya-albezreh",
    name: "Dr. Maya Albezreh",
    specialty: "Consultant, Obstetrics, Gynecology & Infertility",
    photo: "/images/dr-maya-albezreh.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "7 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
  {
    id: "dr-razan-ghaith",
    name: "Dr. Razan Ghaith",
    specialty: "Consultant, Obstetrics, Gynecology & Infertility",
    photo: "/images/dr-razan-ghaith.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "9 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
  {
    id: "dr-maram-dadoua",
    name: "Dr. Maram Dadoua",
    specialty: "Senior Registrar, Obstetrics & Gynecology",
    photo: "/images/dr-maram.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "10 years of experience",
    languages: ["Arabic", "English"],
    branchId: "jeddah",
  },
];
