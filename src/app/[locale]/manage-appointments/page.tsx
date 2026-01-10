import { Suspense } from "react";
import ManageAppointmentPageContent from "./ManageAppointmentPageContent";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="animate-pulse text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    </div>
  );
}

export default function ManageAppointmentsPage() {
  // Auth check is now handled client-side in ManageAppointmentPageContent
  // via useCurrentUser hook which redirects to home if not authenticated
  // Suspense boundary required for useSearchParams() to work with client-side navigation
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ManageAppointmentPageContent />
    </Suspense>
  );
}
