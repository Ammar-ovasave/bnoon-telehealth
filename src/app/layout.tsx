import { Toaster } from "sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import SWRProvider from "@/providers/SWRProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bnoon",
  description: "Bnoon",
};

const helvetica = localFont({
  src: [
    {
      path: "./fonts/Helvetica/Helvetica.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Helvetica/Helvetica-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Helvetica/helvetica-light-587ebe5a59211.ttf",
      weight: "300",
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SWRProvider>
      <html lang="en">
        <body className={`antialiased ${helvetica.className}`}>
          {children}
          <Toaster />
        </body>
      </html>
    </SWRProvider>
  );
}
