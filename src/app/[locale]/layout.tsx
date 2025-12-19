import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { getCurrentUser } from "../api/current-user/_services";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import SWRProvider from "@/providers/SWRProvider";
import NavHeader from "@/components/NavHeader";
import { setRequestLocale } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bnoon",
  description: "Bnoon",
};

const helvetica = localFont({
  src: [
    {
      path: "../fonts/Helvetica/Helvetica.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Helvetica/Helvetica-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Helvetica/helvetica-light-587ebe5a59211.ttf",
      weight: "300",
    },
  ],
});

const alexandria = localFont({
  src: [
    {
      path: "../fonts/Alexandria/Alexandria-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Alexandria/Alexandria-Bold.ttf",
      style: "normal",
      weight: "700",
    },
    {
      path: "../fonts/Alexandria/Alexandria-Light.ttf",
      style: "normal",
      weight: "300",
    },
    {
      path: "../fonts/Alexandria/Alexandria-Medium.ttf",
      style: "normal",
      weight: "500",
    },
  ],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const [currentUser, paramsResult] = await Promise.all([getCurrentUser(), params]);
  const isAr = paramsResult.locale === "ar";
  const locale = paramsResult.locale;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <SWRProvider fallback={{ "/api/current-user": currentUser }}>
      <NextIntlClientProvider>
        <html lang={paramsResult.locale} dir={isAr ? "rtl" : "ltr"}>
          <body className={`antialiased ${isAr ? alexandria.className : helvetica.className}`}>
            <NavHeader />
            {children}
            <Toaster />
          </body>
        </html>
      </NextIntlClientProvider>
    </SWRProvider>
  );
}
