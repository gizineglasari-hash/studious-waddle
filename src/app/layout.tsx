import type { Metadata } from "next";
import { Poppins, Nunito, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
  title: "GEMAS – Gerakan Edukasi Makanan Anak Sehat | UPTD Puskesmas Neglasari Kota Bandung",
  description:
    "GEMAS adalah platform edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung untuk membantu orang tua memantau pertumbuhan, memahami MP-ASI, makanan anak, dan status gizi berdasarkan standar WHO.",
  keywords: [
    "GEMAS",
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
    title: "GEMAS – Gerakan Edukasi Makanan Anak Sehat",
    description:
      "Platform edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung. Cek status gizi, MP-ASI, makanan anak, dan pantau pertumbuhan berdasarkan standar WHO.",
    siteName: "GEMAS",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEMAS – Gerakan Edukasi Makanan Anak Sehat",
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
      </body>
    </html>
  );
}
