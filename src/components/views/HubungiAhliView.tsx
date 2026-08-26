"use client";

import { PhoneCall, MessageCircle, Mail, Clock, MapPin, User, AlertCircle, LogIn, UserPlus, LayoutDashboard, Stethoscope, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NUTRITIONIST, PUSKESMAS } from "@/lib/gemas/contacts";
import { useAuthStore } from "@/lib/gemas/auth-store";
import { useGemasStore } from "@/lib/gemas/store";

export function HubungiAhliView() {
  const hasWhatsApp = NUTRITIONIST.whatsappNumber && NUTRITIONIST.whatsappNumber.length > 0;
  const hasEmail = NUTRITIONIST.email && NUTRITIONIST.email.length > 0;

  const { getCurrentUser, getUnreadNotificationCount } = useAuthStore();
  const { setView } = useGemasStore();
  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;
  const unreadCount = isLoggedIn ? getUnreadNotificationCount(currentUser.id) : 0;

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
              {/* Foto ahli gizi */}
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br from-green-200 to-emerald-300">
                {NUTRITIONIST.foto ? (
                  <img
                    src={NUTRITIONIST.foto}
                    alt={NUTRITIONIST.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-14 w-14 text-white" />
                  </div>
                )}
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

            {/* Tombol kontak - hanya tampil jika data tersedia */}
            {(hasWhatsApp || hasEmail) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hasWhatsApp && (
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
                )}
                {hasEmail && (
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
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Konsultasi Online Section */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              Konsultasi Gizi Online
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {!isLoggedIn ? (
              <div className="text-center py-4">
                <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <LogIn className="h-7 w-7 text-green-600" />
                </div>
                <p className="text-sm text-gray-700 mb-4 max-w-md mx-auto">
                  Untuk memulai konsultasi dengan ahli gizi, silakan masuk atau buat akun terlebih dahulu.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setView("login")}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk
                  </Button>
                  <Button
                    onClick={() => setView("register")}
                    variant="outline"
                    className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Daftar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {currentUser.namaOrangTua.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Selamat datang, {currentUser.namaOrangTua}!
                    </p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs flex-shrink-0">
                      <Bell className="h-3 w-3 mr-1" />
                      {unreadCount} notifikasi
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setView("consultation-form")}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full flex-1"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Mulai Konsultasi Baru
                  </Button>
                  <Button
                    onClick={() => setView("user-dashboard")}
                    variant="outline"
                    className="rounded-full border-green-300 text-green-700 hover:bg-green-50 flex-1"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard Saya
                  </Button>
                </div>
              </div>
            )}
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
