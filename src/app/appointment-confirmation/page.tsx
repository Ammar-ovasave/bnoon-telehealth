import { Suspense } from "react";
import { PageContent } from "./PageContent";

export default function AppointmentConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
