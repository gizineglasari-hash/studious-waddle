import type { Metadata } from "next";
import { Poppins, Nunito, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Koniciwa Gemas Gempita – Gerakan Edukasi Makanan Anak Sehat | UPTD Puskesmas Neglasari Kota Bandung",
  description:
    "Koniciwa Gemas Gempita merupakan inovasi website yang menggabungkan KONICIWA (Konseling Cinta Gizi via WhatsApp), GEMAS (Gerakan Edukasi Makanan Anak Sehat), dan GEMPITA (Gerakan Edukasi Makanan pada Ibu Balita). Platform edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung.",
  keywords: [
    "Koniciwa Gemas Gempita",
    "KONICIWA",
    "GEMAS",
    "GEMPITA",
    "Konseling Cinta Gizi",
    "Gerakan Edukasi Makanan Anak Sehat",
    "Gerakan Edukasi Makanan pada Ibu Balita",
    "gizi anak",
    "MP-ASI",
    "status gizi",
    "WHO",
    "Posyandu",
    "Puskesmas Neglasari",
    "Bandung",
    "pertumbuhan anak",
    "z-score",
  ],
  authors: [{ name: "UPTD Puskesmas Neglasari Kota Bandung" }],
  openGraph: {
    title: "Koniciwa Gemas Gempita – Gerakan Edukasi Makanan Anak Sehat",
    description:
      "Koniciwa Gemas Gempita merupakan inovasi website yang menggabungkan KONICIWA, GEMAS, dan GEMPITA. Platform edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung.",
    siteName: "Koniciwa Gemas Gempita",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Koniciwa Gemas Gempita – Gerakan Edukasi Makanan Anak Sehat",
    description:
      "Platform edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${nunito.variable} ${inter.variable} antialiased bg-background text-foreground font-nunito`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
