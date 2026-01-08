"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createAppointment } from "@/services/client";
import { PendingAppointmentData, getPaymentErrorMessage } from "@/models/PaymentModel";

type PaymentState = "processing" | "success" | "failed" | "creating_appointment";

interface PaymentResult {
  success: boolean;
  merchantReference?: string;
  fortId?: string;
  responseCode?: string;
  responseMessage?: string;
  appointmentData?: PendingAppointmentData;
  error?: string;
}

export function PaymentCallbackContent() {
  const t = useTranslations("PaymentPage");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<PaymentState>("processing");
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [_appointmentId, setAppointmentId] = useState<number | null>(null);

  // Process payment callback
  const processCallback = useCallback(async () => {
    try {
      // Get parameters from URL (APS may redirect with GET params)
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // If we have params, call the callback API
      if (Object.keys(params).length > 0 && params.merchant_reference) {
        const response = await fetch("/api/payments/callback?" + searchParams.toString());
        const result: PaymentResult = await response.json();
        setPaymentResult(result);

        if (result.success && result.appointmentData) {
          // Payment successful, create appointment
          setState("creating_appointment");
          await createAppointmentAfterPayment(result);
        } else {
          // Payment failed
          setState("failed");
        }
      } else {
        // No params - check sessionStorage for merchant reference
        const merchantRef = sessionStorage.getItem("paymentMerchantReference");
        if (!merchantRef) {
          setState("failed");
          setPaymentResult({
            success: false,
            error: "No payment information found",
          });
        }
      }
    } catch (error) {
      console.error("Payment callback processing error:", error);
      setState("failed");
      setPaymentResult({
        success: false,
        error: "Failed to process payment",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Create appointment after successful payment
  const createAppointmentAfterPayment = async (result: PaymentResult) => {
    if (!result.appointmentData) {
      setState("failed");
      return;
    }

    try {
      const appointmentResponse = await createAppointment({
        ...result.appointmentData,
        // Add payment reference to appointment
      });

      if (appointmentResponse?.id) {
        const createdAppointmentId = appointmentResponse.id;
        setAppointmentId(createdAppointmentId);
        setState("success");

        // Move ID document from temp to permanent storage
        const idDocumentUrl = sessionStorage.getItem("idDocumentUrl");
        if (idDocumentUrl && result.appointmentData.patientMrn) {
          try {
            await fetch("/api/upload-id-document", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tempUrl: idDocumentUrl,
                patientMrn: result.appointmentData.patientMrn,
              }),
            });
          } catch (error) {
            console.error("Failed to move ID document to permanent storage:", error);
            // Don't fail the flow if this fails
          }
        }

        // Clear sessionStorage
        sessionStorage.removeItem("paymentMerchantReference");
        sessionStorage.removeItem("idDocumentUrl");
        sessionStorage.removeItem("idDocumentFileName");
        sessionStorage.removeItem("uploadSessionId");

        // Redirect to confirmation after short delay
        setTimeout(() => {
          const confirmParams = new URLSearchParams();
          confirmParams.set("appointmentId", createdAppointmentId.toString());
          confirmParams.set("paymentRef", result.merchantReference || "");
          router.replace(`/${locale}/appointment-confirmation?${confirmParams.toString()}`);
        }, 2000);
      } else {
        throw new Error("Failed to create appointment");
      }
    } catch (error) {
      console.error("Appointment creation error:", error);
      setState("failed");
      toast.error(t("errors.appointmentCreationFailed"));
    }
  };

  // Process callback on mount
  useEffect(() => {
    processCallback();
  }, [processCallback]);

  // Handle retry
  const handleRetry = () => {
    router.back();
  };

  // Handle go home
  const handleGoHome = () => {
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Processing State */}
        {(state === "processing" || state === "creating_appointment") && (
          <div className="text-center animate-fade-in-up">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-bnoon-teal animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {state === "processing" ? t("processing") : t("creatingAppointment")}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              {state === "processing"
                ? t("processingDescription")
                : t("creatingAppointmentDescription")}
            </p>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="text-center animate-fade-in-up">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t("success.title")}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
              {t("success.message")}
            </p>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-500">
              {t("redirecting")}
            </p>
          </div>
        )}

        {/* Failed State */}
        {state === "failed" && (
          <div className="text-center animate-fade-in-up">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t("failed.title")}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2">
              {paymentResult?.responseCode
                ? getPaymentErrorMessage(paymentResult.responseCode, locale as "en" | "ar")
                : paymentResult?.error || t("failed.message")}
            </p>
            {paymentResult?.responseCode && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                {t("errorCode")}: {paymentResult.responseCode}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1"
              >
                {t("goHome")}
              </Button>
              <Button
                onClick={handleRetry}
                className="flex-1"
              >
                {t("tryAgain")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
