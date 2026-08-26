"use client";

import {
  ArrowLeft,
  Baby,
  Calendar,
  User,
  MessageSquare,
  Clock,
  AlertCircle,
  Stethoscope,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGemasStore } from "@/lib/gemas/store";
import {
  useAuthStore,
  CONSULTATION_STATUS_COLORS,
  type ConsultationStatus,
} from "@/lib/gemas/auth-store";

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ConsultationDetailView() {
  const { setView, selectedConsultationId } = useGemasStore();
  const { getConsultationById } = useAuthStore();

  const consultation = selectedConsultationId
    ? getConsultationById(selectedConsultationId)
    : null;

  const colors = consultation
    ? CONSULTATION_STATUS_COLORS[consultation.status as ConsultationStatus] ||
      CONSULTATION_STATUS_COLORS["Menunggu Jawaban"]
    : CONSULTATION_STATUS_COLORS["Menunggu Jawaban"];

  const hasAnswer =
    consultation &&
    consultation.jawaban &&
    consultation.jawaban.trim().length > 0;

  // Error states
  if (!selectedConsultationId || !consultation) {
    return (
      <div className="animate-fade-in min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Button
            onClick={() => setView("user-dashboard")}
            variant="ghost"
            className="mb-4 text-green-800 hover:text-green-900 hover:bg-green-100 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">
                Konsultasi Tidak Ditemukan
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                {selectedConsultationId
                  ? "Konsultasi yang Anda cari tidak dapat ditemukan. Mungkin konsultasi telah dihapus atau ID tidak valid."
                  : "Tidak ada konsultasi yang dipilih. Silakan pilih konsultasi dari dashboard Anda."}
              </p>
              <Button
                onClick={() => setView("user-dashboard")}
                className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Back button */}
        <Button
          onClick={() => setView("user-dashboard")}
          variant="ghost"
          className="mb-4 text-green-800 hover:text-green-900 hover:bg-green-100 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>

        {/* Header */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-br from-green-600 to-emerald-600 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-white" />
                  <p className="text-xs text-green-50 font-medium uppercase tracking-wide">
                    Detail Konsultasi
                  </p>
                </div>
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-white">
                  {consultation.namaAnak}
                </h1>
                <p className="text-xs text-green-50 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Dikirim: {formatDateTime(consultation.createdAt)}
                </p>
              </div>
              <Badge
                className={`${colors.bg} ${colors.text} border-0 font-medium whitespace-nowrap flex-shrink-0`}
              >
                {colors.emoji} {consultation.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* ============ DATA ANAK ============ */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <Baby className="h-5 w-5 text-green-600" />
              Data Anak
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Nama</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
                  {consultation.namaAnak}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Jenis Kelamin</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {consultation.jenisKelaminAnak === "L" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Tanggal Lahir</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(consultation.tanggalLahirAnak)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Berat Badan</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {consultation.beratBadanAnak} kg
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Tinggi Badan</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {consultation.tinggiBadanAnak} cm
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Orang Tua</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
                  {consultation.namaOrangTua}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============ PERCAKAPAN ============ */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Percakapan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {/* ============ ORANG TUA BUBBLE (LEFT, GREEN) ============ */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 max-w-[85%]">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-xs font-semibold text-green-700">Orang Tua</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDateTime(consultation.createdAt)}
                    </p>
                  </div>
                  <div className="bg-green-600 text-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {consultation.pertanyaan}
                    </p>
                  </div>
                </div>
              </div>

              {/* ============ AHLI GIZI BUBBLE (RIGHT, BLUE) - IF ANSWERED ============ */}
              {hasAnswer ? (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-md">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 max-w-[85%] flex flex-col items-end">
                    <div className="flex items-baseline gap-2 mb-1 flex-row-reverse">
                      <p className="text-xs font-semibold text-blue-700">
                        {consultation.adminName || "Ahli Gizi"}
                      </p>
                      {consultation.answeredAt && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDateTime(consultation.answeredAt)}
                        </p>
                      )}
                    </div>
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md max-w-full">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {consultation.jawaban}
                      </p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Dijawab oleh ahli gizi</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ============ WAITING FOR ANSWER ============ */
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="relative mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <Stethoscope className="h-7 w-7 text-amber-600" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-amber-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Menunggu Jawaban
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    Pertanyaan Anda sedang menunggu jawaban dari ahli gizi. Anda akan mendapat
                    notifikasi ketika sudah dijawab.
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-medium text-amber-800">
                      Status: {consultation.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
              <p className="text-[11px] text-gray-500">
                ID Konsultasi:{" "}
                <code className="font-mono text-gray-700 text-[10px] break-all">
                  {consultation.id}
                </code>
              </p>
              <Button
                onClick={() => setView("user-dashboard")}
                variant="outline"
                size="sm"
                className="rounded-full border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        {hasAnswer && (
          <div className="mt-6 p-4 rounded-2xl bg-white/60 border border-green-100 flex items-start gap-3">
            <Send className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-800 mb-0.5">Punya pertanyaan lain?</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Jika Anda masih memerlukan bantuan atau memiliki pertanyaan terkait gizi anak,
                jangan ragu untuk membuat konsultasi baru.
              </p>
              <Button
                size="sm"
                onClick={() => setView("consultation-form")}
                className="mt-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Konsultasi Baru
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
