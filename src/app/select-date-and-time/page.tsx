import { Suspense } from "react";
import PageContent from "./PageContent";
import LoadingPage from "../loading";

export default function SelectDateAndTimePage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <PageContent />
    </Suspense>
  );
}
