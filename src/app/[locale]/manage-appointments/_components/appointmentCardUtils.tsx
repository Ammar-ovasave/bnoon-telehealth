import { CheckCircle, Clock, X, Play, UserX, PhoneOff, Lock, Unlock, Calendar } from "lucide-react";

// FertiSmart status ID for "Cancelled" - fixed value from FertiSmart system
export const CANCELLED_STATUS_ID = 6;
export const CANCELLED_STATUS_NAME = "Cancelled";

// Status arrays for appointment modification checks
export const FINAL_STATUSES = ["completed", "cancelled", "patient no-show", "locked"];
export const IN_PROGRESS_STATUSES = ["procedure started", "arrived waiting!"];

export const getAppointmentStatusColor = (status: string) => {
  switch (status) {
    // Confirmed states - Green
    case "Approved/Confirmed":
    case "Patient Confirmed":
    case "Booked Today":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";

    // Pending states - Amber
    case "Waiting For Approval":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";

    // In Progress states - Blue
    case "Arrived Waiting!":
    case "Procedure Started":
    case "On The Way Coming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";

    // Completed - Purple
    case "Completed":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";

    // Negative final states - Red
    case "Cancelled":
    case "Patient No-Show":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";

    // Follow-up states - Orange
    case "No Answer":
    case "Will Callback":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";

    // System states - Gray
    case "Locked":
    case "Unlocked":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export const getAppointmentStatusIcon = (status: string) => {
  switch (status) {
    // Confirmed states
    case "Approved/Confirmed":
    case "Patient Confirmed":
    case "Booked Today":
      return <CheckCircle className="h-4 w-4" />;

    // Pending
    case "Waiting For Approval":
      return <Clock className="h-4 w-4" />;

    // In Progress
    case "Arrived Waiting!":
    case "On The Way Coming":
      return <Clock className="h-4 w-4" />;

    case "Procedure Started":
      return <Play className="h-4 w-4" />;

    // Completed
    case "Completed":
      return <CheckCircle className="h-4 w-4" />;

    // Negative
    case "Cancelled":
      return <X className="h-4 w-4" />;

    case "Patient No-Show":
      return <UserX className="h-4 w-4" />;

    // Follow-up
    case "No Answer":
    case "Will Callback":
      return <PhoneOff className="h-4 w-4" />;

    // System
    case "Locked":
      return <Lock className="h-4 w-4" />;

    case "Unlocked":
      return <Unlock className="h-4 w-4" />;

    default:
      return <Calendar className="h-4 w-4" />;
  }
};
