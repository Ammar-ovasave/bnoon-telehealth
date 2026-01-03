"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { PendingAppointmentData, CreatePaymentSessionResponse } from "@/models/PaymentModel";

interface PaymentButtonProps {
  amount: number;
  currency: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  appointmentData: PendingAppointmentData;
  disabled?: boolean;
  onPaymentStarted?: () => void;
}

export function PaymentButton({
  amount,
  currency,
  email,
  fullName,
  phoneNumber,
  appointmentData,
  disabled = false,
  onPaymentStarted,
}: PaymentButtonProps) {
  const t = useTranslations("PaymentPage");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Format price for display
  const formattedAmount = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const handlePayment = async () => {
    if (loading || disabled) return;

    setLoading(true);
    onPaymentStarted?.();

    try {
      // Create payment session
      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          email,
          fullName,
          phoneNumber,
          appointmentData,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const data: CreatePaymentSessionResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment session");
      }

      // Store merchant reference in sessionStorage for callback page
      sessionStorage.setItem("paymentMerchantReference", data.merchantReference);

      // Create and submit form to APS gateway
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.gatewayUrl;

      // Add all payment parameters as hidden inputs
      for (const [key, value] of Object.entries(data.paymentParams)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      // Submit form to APS gateway (redirects user)
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(t("errors.paymentFailed"));
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full h-14 text-base font-semibold bg-gradient-to-r from-bnoon-teal to-cyan-500 hover:from-bnoon-teal/90 hover:to-cyan-500/90"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t("processing")}</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>
            {t("payNow")} • {formattedAmount} {currency}
          </span>
        </>
      )}
    </Button>
  );
}
