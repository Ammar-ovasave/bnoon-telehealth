import { Suspense } from "react";
import { PageContent } from "./SelectVisitPageType";

export default function SelectVisitTypePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
