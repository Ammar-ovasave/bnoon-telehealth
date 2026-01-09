export const AUTH_TOKEN_NAME = "auth-token";
export const VISIT_DURATION_IN_MINUTES = 20;

// Appointment Status Constants (from FertiSmart)
// Verified identical across all branches: Riyadh Granada, Jeddah, Al-Ahsa
export const APPOINTMENT_STATUS = {
  WAITING_FOR_APPROVAL: { id: 0, name: "Waiting For Approval" },
  APPROVED_CONFIRMED: { id: 1, name: "Approved/Confirmed" },
  ARRIVED_WAITING: { id: 2, name: "Arrived Waiting!" },
  PROCEDURE_STARTED: { id: 3, name: "Procedure Started" },
  COMPLETED: { id: 4, name: "Completed" },
  PATIENT_NO_SHOW: { id: 5, name: "Patient No-Show" },
  CANCELLED: { id: 6, name: "Cancelled" },
  NO_ANSWER: { id: 7, name: "No Answer" },
  WILL_CALLBACK: { id: 8, name: "Will Callback" },
  ON_THE_WAY_COMING: { id: 9, name: "On The Way Coming" },
  BOOKED_TODAY: { id: 10, name: "Booked Today" },
  PATIENT_CONFIRMED: { id: 20, name: "Patient Confirmed" },
  LOCKED: { id: 21, name: "Locked" },
  UNLOCKED: { id: 22, name: "Unlocked" },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  /**
   * Enable/disable virtual appointments across the system
   * Set NEXT_PUBLIC_ENABLE_VIRTUAL_APPOINTMENTS=true in .env to enable
   */
  VIRTUAL_APPOINTMENTS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_VIRTUAL_APPOINTMENTS === "true",
} as const;
export const countryCodes = [
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { code: "+98", country: "Iran", flag: "🇮🇷" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },
  { code: "+218", country: "Libya", flag: "🇱🇾" },
  { code: "+249", country: "Sudan", flag: "🇸🇩" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];
