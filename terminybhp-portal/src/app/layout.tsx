import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { LegacyServiceWorkerCleanup } from "@/components/LegacyServiceWorkerCleanup";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://terminybhp.pl"),
  title: {
    default: "TerminyBHP - pilnuj terminów BHP, zanim zrobi to kontrola",
    template: "%s | TerminyBHP",
  },
  description:
    "Darmowy, lokalny system pilnowania terminów BHP oraz publiczna baza wiedzy. Badania, szkolenia, uprawnienia i audyty w jednym widoku.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-950">
        <SiteHeader />
        {children}
        <SiteFooter />
        <AnalyticsConsent />
        <LegacyServiceWorkerCleanup />
      </body>
    </html>
  );
}
