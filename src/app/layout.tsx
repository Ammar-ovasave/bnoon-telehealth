import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getCurrentUser } from "./api/current-user/route";
import localFont from "next/font/local";
import SWRProvider from "@/providers/SWRProvider";
import NavHeader from "@/components/NavHeader";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <SWRProvider fallback={{ "/api/current-user": currentUser }}>
      <html lang="en">
        <body className={`antialiased ${helvetica.className}`}>
          <NavHeader />
          {children}
          <Toaster />
        </body>
      </html>
    </SWRProvider>
  );
}
