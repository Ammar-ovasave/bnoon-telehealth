import { Suspense } from "react";
import { PageContent } from "./PageContent";
import LoadingPage from "../loading";
import BranchGuard from "@/components/BranchGuard";

export default function InterestPage() {
  return (
    <BranchGuard>
      <Suspense fallback={<LoadingPage />}>
        <PageContent />
      </Suspense>
    </BranchGuard>
  );
}
