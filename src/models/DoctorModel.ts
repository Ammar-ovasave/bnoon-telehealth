import { ClinicBranchID } from "./ClinicModel";
import { ServiceID } from "./ServiceModel";

export interface DoctorModel {
  id: string;
  name: string;
  arName: string;
  specialty: string;
  photo: string;
  imageClassName?: string;
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
    arName: "الدكتور عبد العزيز الشهراني",
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
    arName: "الدكتور بسام نصير",
    availability: { clinic: true, virtual: true },
    branchId: "al-ahsa",
    languages: ["Arabic", "English"],
    name: "Dr. Bassam Nusair",
    photo: "/images/bassam-mohammed.jpg",
    imageClassName: "object-top",
    services: ["fertility-preservation", "general-fertility", "having-child", "pregnancy-followup"],
    specialty: "Consultant, Obstetrics, Gynecology, Reproductive Endocrinology, Infertility (IVF) & Minimally Invasive Surgery",
  },
  {
    id: "rania-mohamed-ibrahim",
    arName: "الدكتورة رانيا الشريفي",
    availability: { clinic: true, virtual: true },
    branchId: "al-ahsa",
    languages: ["Arabic", "English"],
    imageClassName: "object-top",
    name: "Dr. Rania Elsherify",
    photo: "/images/dr-rania-mohamed.jpg",
    services: ["fertility-preservation", "general-fertility", "having-child", "pregnancy-followup"],
    specialty: "Consultant, Obstetrics, Gynecology & Delayed Pregnancy",
  },
  {
    id: "dr-fawaz-edris",
    name: "Dr. Fawaz Edris",
    arName: "البروفيسور فواز إدريس",
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
    arName: "الدكتور مازن بشارة",
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
    arName: "الدكتور عاصم الوهيبي",
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
    arName: "الدكتور أحمد الشيخ",
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
    arName: "الدكتور وجدي  العمري",
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
    arName: "الدكتورة داليا  نور",
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
    arName: "الدكتور أحمد هارون",
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
    arName: "الدكتور موسى  النعمي",
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
    arName: "الدكتورة مايا البزره",
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
    arName: "الدكتورة رزان غيث",
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
    arName: "الدكتورة مرام دعدوع",
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
  {
    arName: "الدكتور أحمد النويصر",
    availability: { clinic: true, virtual: true },
    branchId: "al-ahsa",
    id: "dr-ahmed-al-nuaiser",
    languages: ["Arabic", "English"],
    imageClassName: "object-top",
    name: "Dr. Ahmed Al-Nowasser",
    photo: "/images/dr-ahmed-al-nuaiser.jpg",
    services: ["fertility-preservation", "general-fertility", "having-child", "pregnancy-followup"],
    specialty: "Consultant, Obstetrics, Gynecology, Reproductive Endocrinology, Infertility (IVF) & Minimally Invasive Surgery",
  },
  {
    arName: "الدكتور مدين الخلف",
    availability: {
      clinic: true,
      virtual: true,
    },
    branchId: "al-ahsa",
    id: "dr-madian-al-khalaf",
    languages: ["Arabic", "English"],
    imageClassName: "object-top",
    name: "Dr. Median Alkhalaf",
    photo: "/images/dr-madian-al-khalaf.jpg",
    services: ["fertility-preservation", "general-fertility", "having-child", "pregnancy-followup"],
    specialty: "Consultant, Obstetrics & Gynecology",
  },
];
