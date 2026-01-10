import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import SWRProvider from "@/providers/SWRProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import { setRequestLocale } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bnoon | The Fertility & Women's Health Center",
  description: "Bnoon is the next generation of fertility care—where advanced science, smart technology, compassion and expertise come together to give every family the best possible start. Part of Global Fertility Network.",
  keywords: ["fertility", "IVF", "women's health", "reproductive genetics", "Saudi Arabia", "Riyadh", "Jeddah"],
  openGraph: {
    title: "Bnoon | The Fertility & Women's Health Center",
    description: "The future of fertility is here. World-class fertility care, available now locally.",
    siteName: "Bnoon",
  },
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
  const paramsResult = await params;
  const isAr = paramsResult.locale === "ar";
  const locale = paramsResult.locale;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <SWRProvider locale={locale}>
      <NextIntlClientProvider>
        <html lang={paramsResult.locale} dir={isAr ? "rtl" : "ltr"} suppressHydrationWarning>
          <body className={`antialiased bg-white dark:bg-gray-900 transition-colors duration-300 ${isAr ? alexandria.className : helvetica.className}`}>
            <ThemeProvider>
              <AuthProvider>
                <NavHeader />
                <main className="min-h-screen bg-white dark:bg-gray-900">{children}</main>
                <Footer />
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </body>
        </html>
      </NextIntlClientProvider>
    </SWRProvider>
  );
}
