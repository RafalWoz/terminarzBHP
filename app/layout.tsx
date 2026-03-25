import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "PilnujTerminow — Terminarz BHP dla firm",
  description:
    "Automatyczne przypomnienia o badaniach lekarskich, szkoleniach BHP i certyfikatach pracownikow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
