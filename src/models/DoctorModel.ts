import { ClinicBranchID } from "./ClinicModel";
import { ServiceID } from "./ServiceModel";

export interface DoctorModel {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  availability: {
    clinic: boolean;
    virtual: boolean;
  };
  languages: string[];
  branchId: ClinicBranchID;
  services: ServiceID[];
}

export const doctors: DoctorModel[] = [
  {
    id: "dr-abdalaziz-al-shahrani",
    name: "Dr. Abdulaziz Alshahrani",
    specialty:
      "Group Medical Director Consultant, Obstetrics, Gynecology, Reproductive Endorinology, Infertility (IVF) & Minimally Invasive Surgery",
    photo: "/images/dr_ abdulaziz.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
    services: ["having-child", "fertility-preservation", "general-fertility"],
  },
  {
    id: "bassam-mahammad-nusair",
    availability: { clinic: true, virtual: true },
    branchId: "al-ahsa",
    languages: ["Arabic", "English"],
    name: "Dr. Bassam Mohammad Nusair",
    photo: "/images/bassam-mohammed.jpg",
    services: ["having-child", "fertility-preservation", "general-fertility"],
    specialty: "Consultant, Obstetrics, Gynecology, Reproductive Endocrinology, Infertility (IVF) & Minimally Invasive Surgery",
  },
  {
    id: "rania-mohamed-ibrahim",
    availability: { clinic: true, virtual: true },
    branchId: "al-ahsa",
    languages: ["Arabic", "English"],
    name: "Dr. Rania Mohamed Ibrahim Elsherify",
    photo: "/images/dr-rania-mohamed.jpg",
    services: ["having-child", "fertility-preservation", "general-fertility", "pregnancy-followup"],
    specialty: "Consultant, Obstetrics, Gynecology & Delayed Pregnancy",
  },
  {
    id: "dr-fawaz-edris",
    name: "Dr. Fawaz Edris",
    specialty:
      "Executive Director, Bnoon - Jeddah Consultant, Obstetrics, Gynecology, Reproductive Endocrinology, Infertility (IVF), Minimally Invasive Surgery & Maternal Fetal Medicine",
    photo: "/images/dr-fawad.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["having-child", "fertility-preservation", "general-fertility"],
  },
  {
    id: "dr-mazin-bishara",
    name: "Dr. Mazen Beshara",
    specialty:
      "Medical Director, Bnoon - Jeddah Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology, Infertility (IVF) & Minimally Invasive Surgery",
    photo: "/images/dr-mazin-bishra.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["having-child", "fertility-preservation", "general-fertility"],
  },
  {
    id: "dr-asim-al-wuhaibi",
    name: "Dr. Asim Al Wohaibi",
    specialty: "Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology, Infertility (IVF) & Minimally Invasive Surgery",
    photo: "/images/dr-asim.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English", "French"],
    branchId: "riyadh-granada",
    services: ["having-child", "fertility-preservation", "general-fertility"],
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
  //
  //
  //   languages: ["Arabic", "English"],
  //   branchId: ''
  // },
  {
    id: "dr-ahmed-alshaikh",
    name: "Dr. Ahmed Alshaikh",
    specialty: "Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology, Infertility (IVF) & Minimally Invasive Surgery",
    photo: "/images/dr-ahmed-bekar.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["having-child", "fertility-preservation", "general-fertility"],
  },
  {
    id: "dr-wajdi-al-omari",
    name: "Dr. Wajdi Al Omari",
    specialty: "Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology & Infertility (IVF), Minimally Invasive Surgery",
    photo: "/images/dr-wajdi.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },

    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
    services: ["having-child", "fertility-preservation", "general-fertility"],
  },
  {
    id: "dr-dalia-adel",
    name: "Dr. Dalia Adel Nour",
    specialty: "Consultant, Obstetrics, Gynecology & Infertility",
    photo: "/images/dr-dalia.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
    services: ["having-child", "fertility-preservation", "general-fertility", "pregnancy-followup"],
  },
  {
    id: "dr-ahmad-haroun",
    name: "Dr. Ahmad Haroun",
    specialty: "Consultant, Urology, Andrology & Male Infertility",
    photo: "/images/dr-haroun.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["male-andrology"],
  },
  {
    id: "dr-moussa-el-naiemy",
    services: ["male-andrology"],
    name: "Dr. Mussa AlNumi",
    specialty: "Consultant, Urology, Andrology & Male Infertility",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "riyadh-granada",
    photo: "/images/dr-mousa.png",
  },
  {
    id: "dr-maya-albezreh",
    name: "Dr. Maya Albezreh",
    specialty: "Consultant, Obstetrics, Gynecology,  Reproductive Endocrinology & Infertility (IVF)",
    photo: "/images/dr-maya-albezreh.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["having-child", "fertility-preservation", "general-fertility", "pregnancy-followup"],
  },
  {
    id: "dr-razan-ghaith",
    name: "Dr. Razan Ghaith",
    specialty: "Consultant, Obstetrics, Gynecology & Delayed Pregnancy",
    photo: "/images/dr-razan-ghaith.jpg",
    availability: {
      clinic: true,
      virtual: true,
    },
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["having-child", "fertility-preservation", "general-fertility", "pregnancy-followup"],
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
    languages: ["Arabic", "English"],
    branchId: "jeddah",
    services: ["having-child", "fertility-preservation", "general-fertility", "pregnancy-followup"],
  },
];
