export type ServiceID = "having-child" | "general-fertility" | "fertility-preservation" | "pregnancy-followup" | "male-andrology";

export interface Service {
  id: ServiceID;
  title: string;
  description: string;
  icon: string;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageClassName?: string;
}

export const services: Service[] = [
  {
    id: "having-child",
    title: "Having a Child",
    description:
      "Start your parenthood journey with Bnoon to help you start or grow your family whether you’re facing primary or secondary infertility, seeking family balancing, or exploring ART to prevent genetic conditions.",
    icon: "👩🏻‍🍼",
    imageSrc: `/icons/Icons-51.png`,
    imageClassName: "h-[80px] w-[80px]",
  },
  {
    id: "general-fertility",
    title: "General Fertility Consultation",
    description:
      "Expert consultation and evaluation of reproductive health to personalized treatments for women and men. Our specialists provide advanced, supportive care every step of the way.",
    icon: "🩺",
    imageSrc: "/icons/Doctors.png",
    imageClassName: "h-[80px] w-[80px] object-cover",
    imageWidth: 100,
    imageHeight: 100,
  },
  {
    id: "fertility-preservation",
    title: "Fertility Preservation",
    description:
      "State-of-the-art fertility preservation solutions powered by advanced technology and comprehensive packages — helping you safeguard your reproductive health for the future.",
    icon: "🔒",
    imageSrc: "/icons/Icons-15.png",
    imageClassName: "h-[80px] w-[70px]",
  },
  // {
  //   id: "learning-fertility",
  //   title: "Learning about my fertility",
  //   description: "Educational resources and guidance to understand your reproductive health and options.",
  //   icon: "📚",
  // },
  {
    id: "pregnancy-followup",
    title: "Gynecology and Maternity Services",
    description:
      "Comprehensive women’s health and pregnancy care — from puberty to post-menopause. Our gynecologists offer personalized support, from prenatal and postnatal care to managing PCOS, endometriosis, menopause, and more.",
    icon: "🤰🏻",
    imageSrc: `/icons/Asset47.svg`,
    imageClassName: "mb-2",
  },
  {
    id: "male-andrology",
    title: "Andrology and Male Problems",
    description:
      "Specialized care for male infertility and urological conditions. Our expert andrologists diagnose and treat issues such as low sperm count, hormonal imbalance, and erectile dysfunction to support fertility and overall male reproductive health.",
    icon: "👨🏻‍⚕️",
    imageSrc: `/icons/Woman.svg`,
    imageWidth: 100,
    imageHeight: 100,
    imageClassName: "object-cover",
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
