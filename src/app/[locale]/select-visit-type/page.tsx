import { Suspense } from "react";
import { PageContent } from "./SelectVisitPageType";
import LoadingPage from "../loading";

export default function SelectVisitTypePage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <PageContent />
    </Suspense>
  );
}
