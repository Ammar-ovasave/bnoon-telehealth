export interface VisitType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const visitTypes: VisitType[] = [
  {
    id: "virtual",
    title: "Virtual Visit",
    description: "Consult with your doctor from the comfort of your home via video call.",
    icon: "📱",
    color: "blue",
  },
  {
    id: "clinic",
    title: "Clinic Visit",
    description: "Visit our clinic for in-person consultation and comprehensive examination.",
    icon: "🏥",
    color: "green",
  },
];
