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
}

export const doctors: DoctorModel[] = [
  {
    id: "dr-sarah-ahmed",
    name: "Dr. Sarah Ahmed",
    specialty: "Reproductive Endocrinology",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Today, 2:00 PM",
    experience: "12 years of experience",
    languages: ["Arabic", "English"],
  },
  {
    id: "dr-mohammed-alrashid",
    name: "Dr. Mohammed Al-Rashid",
    specialty: "Fertility Specialist",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    availability: {
      clinic: true,
      virtual: false,
    },
    firstAvailableSlot: "Tomorrow, 10:00 AM",
    experience: "15 years of experience",
    languages: ["Arabic", "English"],
  },
  {
    id: "dr-fatima-hassan",
    name: "Dr. Fatima Hassan",
    specialty: "Gynecologist",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    availability: {
      clinic: false,
      virtual: true,
    },
    firstAvailableSlot: "Today, 4:30 PM",
    experience: "8 years of experience",
    languages: ["Arabic", "English", "French"],
  },
  {
    id: "dr-omar-khalil",
    name: "Dr. Omar Khalil",
    specialty: "Andrologist",
    photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Monday, 9:00 AM",
    experience: "10 years of experience",
    languages: ["Arabic", "English"],
  },
  {
    id: "dr-layla-mansour",
    name: "Dr. Layla Mansour",
    specialty: "Obstetrician",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    availability: {
      clinic: true,
      virtual: true,
    },
    firstAvailableSlot: "Today, 1:00 PM",
    experience: "14 years of experience",
    languages: ["Arabic", "English"],
  },
  {
    id: "dr-youssef-nasser",
    name: "Dr. Youssef Nasser",
    specialty: "Fertility Preservation Specialist",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    availability: {
      clinic: true,
      virtual: false,
    },
    firstAvailableSlot: "Wednesday, 11:00 AM",
    experience: "11 years of experience",
    languages: ["Arabic", "English"],
  },
];
