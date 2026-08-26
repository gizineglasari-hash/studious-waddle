"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  User,
  Phone,
  MapPin,
  Baby,
  CalendarDays,
  Scale,
  Ruler,
  MessageSquare,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  FileText,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import {
  useAuthStore,
  CONSULTATION_STATUS_COLORS,
  type ConsultationStatus,
} from "@/lib/gemas/auth-store";

export function AdminConsultationDetailView() {
  const { toast } = useToast();
  const { setView, selectedConsultationId } = useGemasStore();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const getCurrentUser = useAuthStore((s) => s.getCurrentUser);
  const consultations = useAuthStore((s) => s.consultations);
  const answerConsultation = useAuthStore((s) => s.answerConsultation);
  const updateConsultationStatus = useAuthStore((s) => s.updateConsultationStatus);

  const [jawaban, setJawaban] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prevConsultationId, setPrevConsultationId] = useState<string | null>(null);

  // Redirect if not admin (external calls only — safe in effect)
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Akses ditolak",
        description: "Silakan login sebagai admin terlebih dahulu.",
        variant: "destructive",
      });
      setView("admin-login");
    }
  }, [isAdmin, setView, toast]);

  // Redirect if no consultation selected
  useEffect(() => {
    if (isAdmin && !selectedConsultationId) {
      toast({
        title: "Tidak ada konsultasi dipilih",
        description: "Pilih konsultasi dari daftar terlebih dahulu.",
        variant: "destructive",
      });
      setView("admin-consultations");
    }
  }, [isAdmin, selectedConsultationId, setView, toast]);

  // Find consultation reactively
  const consultation = useMemo(() => {
    if (!selectedConsultationId) return null;
    return consultations.find((c) => c.id === selectedConsultationId) || null;
  }, [consultations, selectedConsultationId]);

  // Redirect if consultation not found
  useEffect(() => {
    if (isAdmin && selectedConsultationId && !consultation) {
      toast({
        title: "Konsultasi tidak ditemukan",
        description: "Konsultasi mungkin telah dihapus.",
        variant: "destructive",
      });
      setView("admin-consultations");
    }
  }, [isAdmin, consultation, selectedConsultationId, setView, toast]);

  // Sync local jawaban state with consultation changes (React "derived state" pattern).
  // Setting state during render triggers an immediate re-render before commit,
  // avoiding cascading renders.
  if (consultation && consultation.id !== prevConsultationId) {
    setPrevConsultationId(consultation.id);
    setJawaban(consultation.jawaban || "");
  }

  const handleSubmitAnswer = () => {
    if (!consultation) return;

    if (!jawaban.trim() || jawaban.trim().length < 10) {
      toast({
        title: "Jawaban terlalu pendek",
        description: "Jawaban minimal 10 karakter.",
        variant: "destructive",
      });
      return;
    }

    const adminUser = getCurrentUser();
    const adminId = adminUser?.id || "admin-default";
    const adminName = adminUser?.namaOrangTua || "Administrator GEMAS";

    setSubmitting(true);
    try {
      const result = answerConsultation(
        consultation.id,
        jawaban,
        adminId,
        adminName
      );
      if (result.success) {
        toast({
          title: "Jawaban terkirim",
          description: "Notifikasi telah dikirim ke pengguna.",
        });
      } else {
        toast({
          title: "Gagal mengirim jawaban",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = (status: ConsultationStatus) => {
    if (!consultation) return;
    updateConsultationStatus(consultation.id, status);
    toast({
      title: "Status diperbarui",
      description: `Status konsultasi: ${status}`,
    });
  };

  // Guard: render fallbacks
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="text-center">
          <ShieldCheck className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-4">Mengalihkan ke halaman login admin...</p>
        </div>
      </div>
    );
  }

  if (!selectedConsultationId || !consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-600 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-600">Memuat konsultasi...</p>
        </div>
      </div>
    );
  }

  const colors = CONSULTATION_STATUS_COLORS[consultation.status];
  const isAnswered = !!consultation.jawaban && consultation.jawaban.trim().length > 0;
  const adminUser = getCurrentUser();

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button
              onClick={() => setView("admin-consultations")}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Badge variant="secondary" className="mb-1.5 bg-green-50 text-green-700 border-green-200 rounded-full">
                <FileText className="h-3 w-3 mr-1" />
                Detail Konsultasi
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                Konsultasi {consultation.namaAnak}
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                <span>oleh {consultation.namaOrangTua}</span>
                <Badge className={`${colors.bg} ${colors.text} border-0 rounded-full text-[10px] px-2 py-0`}>
                  {colors.emoji} {consultation.status}
                </Badge>
              </p>
            </div>
          </div>
          <Button
            onClick={() => setView("admin-dashboard")}
            variant="outline"
            size="sm"
            className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
          >
            <LayoutDashboard className="h-4 w-4 mr-1.5" />
            Dashboard
          </Button>
        </div>

        {/* Status change actions */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ubah Status
                </p>
                <p className="text-sm text-gray-700 mt-0.5">
                  Status saat ini:{" "}
                  <span className="font-semibold">{consultation.status}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleStatusChange("Sedang Diproses")}
                  variant={consultation.status === "Sedang Diproses" ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full h-9 ${
                    consultation.status === "Sedang Diproses"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-blue-300 text-blue-700 hover:bg-blue-50"
                  }`}
                  disabled={consultation.status === "Sedang Diproses"}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Sedang Diproses
                </Button>
                <Button
                  onClick={() => handleStatusChange("Selesai")}
                  variant={consultation.status === "Selesai" ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full h-9 ${
                    consultation.status === "Selesai"
                      ? "bg-gray-800 hover:bg-gray-900 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                  disabled={consultation.status === "Selesai"}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Selesai
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Data Orang Tua */}
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 pb-3">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                Data Orang Tua
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Nama</div>
                <div className="text-sm text-gray-900 font-medium">{consultation.namaOrangTua}</div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Nomor Telepon</div>
                  <div className="text-sm text-gray-900 break-words">
                    {consultation.nomorTelepon || "-"}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Alamat</div>
                  <div className="text-sm text-gray-900 break-words leading-relaxed">
                    {consultation.alamat || "-"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Anak */}
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-sky-50 pb-3">
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Baby className="h-4 w-4 text-blue-600" />
                </div>
                Data Anak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Nama Anak</div>
                <div className="text-sm text-gray-900 font-medium">{consultation.namaAnak}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Tanggal Lahir</div>
                    <div className="text-sm text-gray-900">
                      {new Date(consultation.tanggalLahirAnak).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Jenis Kelamin</div>
                  <div className="text-sm text-gray-900">
                    {consultation.jenisKelaminAnak === "L" ? "Laki-laki" : "Perempuan"}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Scale className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Berat Badan</div>
                    <div className="text-sm text-gray-900">{consultation.beratBadanAnak} kg</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Ruler className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Tinggi Badan</div>
                    <div className="text-sm text-gray-900">{consultation.tinggiBadanAnak} cm</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pertanyaan Orang Tua */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 pb-3">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <MessageSquare className="h-4 w-4 text-orange-600" />
              </div>
              Pertanyaan Orang Tua
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {consultation.pertanyaan}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
              <Clock className="h-3 w-3" />
              Dikirim pada{" "}
              {new Date(consultation.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </CardContent>
        </Card>

        {/* Jawaban Ahli Gizi */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <MessageCircle className="h-4 w-4 text-green-600" />
              </div>
              Jawaban Ahli Gizi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isAnswered ? (
              <div className="space-y-3">
                {/* Existing answer */}
                <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {consultation.jawaban}
                  </p>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCheck className="h-3.5 w-3.5 text-green-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {consultation.adminName || "Administrator"}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Dijawab pada{" "}
                        {consultation.answeredAt
                          ? new Date(consultation.answeredAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline edit form */}
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                  <Textarea
                    placeholder="Tulis jawaban konsultasi..."
                    value={jawaban}
                    onChange={(e) => setJawaban(e.target.value)}
                    className="min-h-[140px] rounded-xl resize-y"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[11px] text-gray-500">
                      Minimal 10 karakter · Saat ini: {jawaban.trim().length}
                    </p>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={submitting}
                      className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Perbarui Jawaban
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900">Belum Dijawab</p>
                    <p className="text-[11px] text-orange-700 mt-0.5">
                      Konsultasi ini belum dijawab. Tulis jawaban di bawah ini.
                    </p>
                  </div>
                </div>
                <div>
                  <Textarea
                    placeholder="Tulis jawaban konsultasi..."
                    value={jawaban}
                    onChange={(e) => setJawaban(e.target.value)}
                    className="min-h-[160px] rounded-xl resize-y"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[11px] text-gray-500">
                      Minimal 10 karakter · Saat ini: {jawaban.trim().length}
                    </p>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || jawaban.trim().length < 10}
                      className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Jawaban
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {adminUser && (
                  <p className="text-[11px] text-gray-400 text-center pt-2">
                    Jawaban akan ditandatangani sebagai{" "}
                    <strong className="text-gray-600">
                      {adminUser.namaOrangTua}
                    </strong>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setView("admin-consultations")}
            variant="outline"
            className="rounded-full flex-1 h-11"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Konsultasi
          </Button>
          <Button
            onClick={() => setView("admin-dashboard")}
            variant="outline"
            className="rounded-full flex-1 h-11"
          >
            Ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
