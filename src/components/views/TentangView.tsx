"use client";

import { Info, Target, Heart, Users, MapPin, Clock, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PUSKESMAS } from "@/lib/gemas/contacts";

const OBJECTIVES = [
  "Meningkatkan pengetahuan orang tua tentang gizi anak.",
  "Membantu orang tua memahami pemberian MP-ASI.",
  "Membantu orang tua memberikan makanan sesuai usia dan kebutuhan anak.",
  "Membantu orang tua memantau pertumbuhan anak.",
  "Membantu melakukan skrining awal status gizi anak.",
  "Memberikan edukasi berdasarkan hasil pengukuran.",
  "Mendorong orang tua rutin datang ke Posyandu.",
  "Mendukung peningkatan cakupan balita ditimbang dan berat badan naik.",
  "Mendukung pertumbuhan dan perkembangan anak secara optimal.",
];

export function TentangView() {
  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 bg-green-50 text-green-700 border-green-200 rounded-full px-3 py-1">
            <Info className="h-3 w-3 mr-1" />
            Tentang Kami
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Tentang GEMAS
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Gerakan Edukasi Makanan Anak Sehat &mdash; platform edukasi gizi dari UPTD Puskesmas Neglasari Kota Bandung.
          </p>
        </div>

        {/* Hero card */}
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white pb-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                🥗
              </div>
              <div>
                <CardTitle className="text-2xl">GEMAS</CardTitle>
                <p className="text-sm text-green-50 font-medium">Gerakan Edukasi Makanan Anak Sehat</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-sm text-gray-700 leading-relaxed">
              GEMAS merupakan media edukasi gizi yang dikembangkan oleh UPTD Puskesmas Neglasari Kota Bandung untuk membantu orang tua memahami kebutuhan gizi anak, memantau pertumbuhan, dan menerapkan praktik pemberian makan yang tepat. Platform ini menyediakan kalkulator status gizi berdasarkan standar WHO, edukasi MP-ASI sesuai usia, buku foto makanan, video edukasi, serta layanan konsultasi dengan ahli gizi.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <span className="text-sm font-semibold text-amber-800">
                &ldquo;Cukupi Gizinya, Pantau Tumbuhnya, Sehat Anak Kita!&rdquo;
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tujuan */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Tujuan Website GEMAS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OBJECTIVES.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{obj}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl overflow-hidden mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
              <Info className="h-5 w-5 text-amber-600" />
              Disclaimer Penting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 leading-relaxed">
              GEMAS merupakan media edukasi dan skrining awal. Hasil pengukuran bukan diagnosis medis. Apabila ditemukan hasil yang perlu diperhatikan, orang tua dianjurkan berkonsultasi dengan tenaga kesehatan atau ahli gizi. Kalkulator status gizi menggunakan standar WHO Child Growth Standards (untuk anak 0-5 tahun) dan WHO Growth Reference 2007 (untuk anak 5-19 tahun) dengan metode LMS yang akurat.
            </p>
          </CardContent>
        </Card>

        {/* Identitas Puskesmas */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Identitas Puskesmas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4 mb-4">
              {/* Logo placeholder */}
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                <Heart className="h-10 w-10 text-green-600" fill="currentColor" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900">{PUSKESMAS.nama}</h3>
                <p className="text-sm text-gray-600">Kota Bandung, Jawa Barat</p>
                <Badge variant="secondary" className="mt-1 bg-green-50 text-green-700">Unit Pelayanan Terpadu Daerah</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Alamat</div>
                  <div className="text-sm text-gray-900">{PUSKESMAS.alamat || "PLACEHOLDER - lengkapi alamat"}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Jam Layanan</div>
                  <div className="text-sm text-gray-900 space-y-0.5">
                    {PUSKESMAS.jamLayananLines.map((line, i) => (
                      <div key={i} className="text-left">
                        {line.hari}, {line.jam}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {PUSKESMAS.telepon && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                  <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Telepon</div>
                    <div className="text-sm text-gray-900">{PUSKESMAS.telepon}</div>
                  </div>
                </div>
              )}
              {PUSKESMAS.email && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm text-gray-900">{PUSKESMAS.email}</div>
                  </div>
                </div>
              )}
              {PUSKESMAS.website && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                  <Globe className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Website</div>
                    <div className="text-sm text-gray-900">{PUSKESMAS.website}</div>
                  </div>
                </div>
              )}
              {PUSKESMAS.instagram && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                  <span className="text-base flex-shrink-0">📸</span>
                  <div>
                    <div className="text-xs text-gray-500">Instagram</div>
                    <div className="text-sm text-gray-900">{PUSKESMAS.instagram}</div>
                  </div>
                </div>
              )}
            </div>

            {!PUSKESMAS.telepon && !PUSKESMAS.email && (
              <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <strong>Catatan untuk Admin:</strong> Data kontak (telepon, email, website, media sosial) belum diisi. Lengkapi data di <code className="bg-amber-100 px-1 rounded">src/lib/gemas/contacts.ts</code> menggunakan data resmi Puskesmas. Jangan gunakan data fiktif.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
