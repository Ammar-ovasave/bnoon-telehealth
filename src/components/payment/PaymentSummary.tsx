"use client";

import { useTranslations, useLocale } from "next-intl";
import { CreditCard, ShieldCheck } from "lucide-react";

interface PaymentSummaryProps {
  serviceName: string;
  price: number;
  currency: string;
}

export function PaymentSummary({ serviceName, price, currency }: PaymentSummaryProps) {
  const t = useTranslations("PaymentPage");
  const locale = useLocale();
  const isArabic = locale === "ar";

  // Format price with proper locale
  const formattedPrice = new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-bnoon-teal" />
          </div>
          <h3 className="font-semibold text-bnoon-gray dark:text-white">
            {t("paymentSummary")}
          </h3>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="p-6 space-y-4">
        {/* Service line item */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{serviceName}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formattedPrice} {currency}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("total")}
          </span>
          <span className="text-xl font-bold text-bnoon-teal">
            {formattedPrice} {currency}
          </span>
        </div>
      </div>

      {/* Security note */}
      <div className="px-6 py-4 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-900/30">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            {t("securePayment")}
          </p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t("paymentMethods")}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Visa */}
          <div className="h-8 w-12 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">VISA</span>
          </div>
          {/* Mastercard */}
          <div className="h-8 w-12 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-orange-600">MC</span>
          </div>
          {/* MADA */}
          <div className="h-8 w-12 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-teal-600">mada</span>
          </div>
          {/* STC Pay */}
          <div className="h-8 w-auto px-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-purple-600">STC Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
