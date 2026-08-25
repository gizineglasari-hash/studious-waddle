"use client";

import { PhoneCall, MessageCircle, Mail, Clock, MapPin, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NUTRITIONIST, PUSKESMAS } from "@/lib/gemas/contacts";

export function HubungiAhliView() {
  const hasWhatsApp = NUTRITIONIST.whatsappNumber && NUTRITIONIST.whatsappNumber.length > 0;
  const hasEmail = NUTRITIONIST.email && NUTRITIONIST.email.length > 0;

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 py-1">
            <PhoneCall className="h-3 w-3 mr-1" />
            Konsultasi
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Hubungi Ahli Gizi Kami
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Dapatkan informasi dan edukasi mengenai gizi anak, pemberian makan, MP-ASI, dan pemantauan pertumbuhan dari ahli gizi UPTD Puskesmas Neglasari.
          </p>
        </div>

        {/* Profil Ahli Gizi */}
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-3">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Foto placeholder */}
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <CardTitle className="text-xl sm:text-2xl text-gray-900">{NUTRITIONIST.nama}</CardTitle>
                <p className="text-sm font-semibold text-green-700 mb-1">{NUTRITIONIST.gelar}</p>
                <p className="text-xs text-gray-600">{NUTRITIONIST.peran}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {NUTRITIONIST.deskripsi}
            </p>

            {/* Catatan placeholder */}
            {!hasWhatsApp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>Catatan untuk Admin:</strong> Nomor WhatsApp dan email belum diisi. Silakan edit file <code className="bg-amber-100 px-1 rounded">src/lib/gemas/contacts.ts</code> untuk menambahkan kontak resmi. Jangan gunakan nomor fiktif.
                </div>
              </div>
            )}

            {/* Tombol kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hasWhatsApp ? (
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <a
                    href={`https://wa.me/${NUTRITIONIST.whatsappNumber}?text=Halo%20Bu%20${encodeURIComponent(NUTRITIONIST.nama)},%20saya%20ingin%20konsultasi%20mengenai%20gizi%20anak.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Hubungi via WhatsApp
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="rounded-full border-gray-200 text-gray-400 cursor-not-allowed"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp Belum Tersedia
                </Button>
              )}
              {hasEmail ? (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <a href={`mailto:${NUTRITIONIST.email}`}>
                    <Mail className="h-5 w-5 mr-2" />
                    Kirim Email
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="rounded-full border-gray-200 text-gray-400 cursor-not-allowed"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Belum Tersedia
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informasi Puskesmas */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Informasi UPTD Puskesmas Neglasari
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Alamat</div>
                  <div className="text-sm text-gray-900">{PUSKESMAS.alamat}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
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
                  <PhoneCall className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Telepon</div>
                    <div className="text-sm text-gray-900">{PUSKESMAS.telepon}</div>
                  </div>
                </div>
              )}
              {PUSKESMAS.email && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm text-gray-900">{PUSKESMAS.email}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> Konsultasi melalui website GEMAS bersifat edukasi awal dan tidak menggantikan pemeriksaan langsung oleh tenaga kesehatan. Untuk pemeriksaan menyeluruh, kunjungi Puskesmas atau Posyandu terdekat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
