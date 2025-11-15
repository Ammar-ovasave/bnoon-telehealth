export type ServiceID = "having-child" | "general-fertility" | "fertility-preservation" | "pregnancy-followup" | "male-andrology";

export interface Service {
  id: ServiceID;
  title: string;
  description: string;
  icon: string;
}

export const services: Service[] = [
  {
    id: "having-child",
    title: "Having a Child",
    description: "Comprehensive fertility care and family planning services to help you start or expand your family.",
    icon: "👩🏻‍🍼",
  },
  {
    id: "general-fertility",
    title: "General Fertility Consultation",
    description: "Expert consultation and evaluation of your reproductive health and fertility status.",
    icon: "🩺",
  },
  {
    id: "fertility-preservation",
    title: "Fertility Preservation",
    description: "Advanced fertility preservation options to protect your reproductive health for the future.",
    icon: "🔒",
  },
  // {
  //   id: "learning-fertility",
  //   title: "Learning about my fertility",
  //   description: "Educational resources and guidance to understand your reproductive health and options.",
  //   icon: "📚",
  // },
  {
    id: "pregnancy-followup",
    title: "Pregnancy Followup",
    description: "Comprehensive prenatal care and monitoring throughout your pregnancy journey.",
    icon: "🤰🏻",
  },
  {
    id: "male-andrology",
    title: "Andrology and Male Problems",
    description: "Specialized care for male reproductive health issues and fertility concerns.",
    icon: "👨🏻‍⚕️",
  },
  // {
  //   id: "gynecology-problem",
  //   title: "Gynecology problem",
  //   description: "Expert care for women's reproductive health issues and gynecological conditions.",
  //   icon: "👩🏻‍⚕️",
  // },
  // {
  //   id: "general-checkup",
  //   title: "General checkup and screening",
  //   description: "Comprehensive health screenings and routine checkups for optimal reproductive health.",
  //   icon: "🔍",
  // },
  // {
  //   id: "others",
  //   title: "Others",
  //   description: "Other specialized services and consultations tailored to your specific needs.",
  //   icon: "💬",
  // },
];

// [
//   {
//     title: "Having a Child",
//   },
//   {
//     title: "General Fertility Consultation",
//   },
//   {
//     title: "Fertility Preservation",
//   },
//   {
//     title: "Gynecology and Maternity Services",
//   },
//   {
//     title: "Andrology and Male Problems",
//   },
// ]
