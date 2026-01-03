import { Suspense } from "react";
import { PaymentCallbackContent } from "./PageContent";
import { Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-bnoon-teal mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Processing payment...</p>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
