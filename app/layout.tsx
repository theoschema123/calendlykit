import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calendly Templates — Configurez votre Calendly en 60 secondes",
  description: "Installez des templates Calendly préconfigurés en un clic. Coach, Agence, Consultant, Freelance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen gradient-bg">{children}</body>
    </html>
  );
}
