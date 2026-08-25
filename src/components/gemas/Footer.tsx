"use client";

import { Heart, MapPin, Phone, Mail } from "lucide-react";
import { useGemasStore, type ViewKey } from "@/lib/gemas/store";
import { PUSKESMAS } from "@/lib/gemas/contacts";

const FOOTER_MENU: { key: ViewKey; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "cek-status-gizi", label: "Status Gizi" },
  { key: "mp-asi", label: "MP-ASI" },
  { key: "edukasi-gizi", label: "Edukasi" },
  { key: "buku-makanan", label: "Buku Makanan" },
  { key: "hubungi-ahli", label: "Hubungi Ahli Gizi" },
];

export function Footer() {
  const { setView } = useGemasStore();

  return (
    <footer className="mt-auto border-t border-green-100 bg-gradient-to-b from-green-50/50 to-green-100/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                <Heart className="h-4 w-4 text-white" fill="white" />
              </div>
              <div>
                <div className="font-heading text-lg font-extrabold text-green-700">
                  GEMAS
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Gerakan Edukasi Makanan Anak Sehat
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Platform edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung untuk membantu orang tua memantau pertumbuhan dan menerapkan pemberian makan yang tepat.
            </p>
            <p className="text-xs font-semibold text-green-700">
              {PUSKESMAS.nama}
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm">
              Navigasi Cepat
            </h3>
            <ul className="space-y-2">
              {FOOTER_MENU.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setView(item.key)}
                    className="text-sm text-gray-600 hover:text-green-700 transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm">
              Kontak Puskesmas
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{PUSKESMAS.alamat || "Alamat Puskesmas - PLACEHOLDER"}</span>
              </li>
              {PUSKESMAS.telepon && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{PUSKESMAS.telepon}</span>
                </li>
              )}
              {PUSKESMAS.email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{PUSKESMAS.email}</span>
                </li>
              )}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              {PUSKESMAS.jamLayanan}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-green-200/60">
          <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 border border-amber-200/40 rounded-lg p-3">
            <strong className="text-amber-800">Disclaimer:</strong>{" "}
            Informasi pada website ini ditujukan untuk edukasi dan pemantauan awal, bukan sebagai pengganti pemeriksaan dan diagnosis oleh tenaga kesehatan. Hasil kalkulator status gizi menggunakan standar WHO Child Growth Standards dan WHO Growth Reference 2007. Apabila ditemukan hasil yang perlu diperhatikan, orang tua dianjurkan berkonsultasi dengan tenaga kesehatan atau ahli gizi.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; 2026 GEMAS &ndash; UPTD Puskesmas Neglasari Kota Bandung
        </div>
      </div>
    </footer>
  );
}
