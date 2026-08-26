"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Baby,
  MessageSquare,
  Calendar,
  Send,
  Info,
  ChevronDown,
  Plus,
  AlertCircle,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import { useAuthStore } from "@/lib/gemas/auth-store";

type ChildSelectMode = "existing" | "new";

export function ConsultationFormView() {
  const { toast } = useToast();
  const { setView, setViewWithConsultation } = useGemasStore();
  const {
    getCurrentUser,
    getChildrenByUser,
    addChild,
    updateProfile,
    createConsultation,
    getLastChild,
  } = useAuthStore();

  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      setView("login");
    }
  }, [user, setView]);

  // Parent form (pre-filled from profile)
  const [parentForm, setParentForm] = useState({
    namaOrangTua: "",
    nomorTelepon: "",
    alamat: "",
  });

  useEffect(() => {
    if (user) {
      setParentForm({
        namaOrangTua: user.namaOrangTua,
        nomorTelepon: user.nomorTelepon,
        alamat: user.alamat,
      });
    }
  }, [user]);

  // Children state
  const children = user ? getChildrenByUser(user.id) : [];
  const hasChildren = children.length > 0;
  const [childMode, setChildMode] = useState<ChildSelectMode>("existing");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  // If no children, default to "new" mode
  useEffect(() => {
    if (user && children.length === 0) {
      setChildMode("new");
    } else if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [user, children, selectedChildId]);

  // New child form
  const [newChild, setNewChild] = useState({
    namaAnak: "",
    tanggalLahir: "",
    jenisKelamin: "L" as "L" | "P",
    beratBadan: "",
    tinggiBadan: "",
  });

  const [pertanyaan, setPertanyaan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedChild = children.find((c) => c.id === selectedChildId) || null;

  // -------- Validation helpers --------
  const validateParent = (): string | null => {
    if (!parentForm.namaOrangTua.trim()) return "Nama orang tua wajib diisi.";
    if (!parentForm.nomorTelepon.trim()) return "Nomor telepon wajib diisi.";
    if (!parentForm.alamat.trim()) return "Alamat wajib diisi.";
    return null;
  };

  const validateNewChild = (): string | null => {
    if (!newChild.namaAnak.trim()) return "Nama anak wajib diisi.";
    if (!newChild.tanggalLahir) return "Tanggal lahir anak wajib diisi.";
    const berat = parseFloat(newChild.beratBadan);
    const tinggi = parseFloat(newChild.tinggiBadan);
    if (isNaN(berat) || berat <= 0) return "Berat badan harus berupa angka positif.";
    if (isNaN(tinggi) || tinggi <= 0) return "Tinggi badan harus berupa angka positif.";
    return null;
  };

  // -------- Submit --------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate parent
    const parentErr = validateParent();
    if (parentErr) {
      toast({
        title: "Data orang tua belum lengkap",
        description: parentErr,
        variant: "destructive",
      });
      return;
    }

    // Validate child selection
    if (childMode === "existing" && !selectedChildId) {
      toast({
        title: "Pilih anak",
        description: "Silakan pilih data anak untuk konsultasi.",
        variant: "destructive",
      });
      return;
    }

    if (childMode === "new") {
      const childErr = validateNewChild();
      if (childErr) {
        toast({
          title: "Data anak belum lengkap",
          description: childErr,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate pertanyaan
    if (!pertanyaan.trim() || pertanyaan.trim().length < 10) {
      toast({
        title: "Pertanyaan terlalu pendek",
        description: "Pertanyaan konsultasi minimal 10 karakter.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update parent profile if changed
      const profileChanged =
        parentForm.namaOrangTua !== user.namaOrangTua ||
        parentForm.nomorTelepon !== user.nomorTelepon ||
        parentForm.alamat !== user.alamat;

      if (profileChanged) {
        updateProfile(user.id, {
          namaOrangTua: parentForm.namaOrangTua.trim(),
          nomorTelepon: parentForm.nomorTelepon.trim(),
          alamat: parentForm.alamat.trim(),
        });
      }

      // 2. Resolve childId
      let childId = "";
      if (childMode === "existing") {
        childId = selectedChildId;
      } else {
        // Add new child
        const addResult = addChild({
          namaAnak: newChild.namaAnak.trim(),
          tanggalLahir: newChild.tanggalLahir,
          jenisKelamin: newChild.jenisKelamin,
          beratBadan: parseFloat(newChild.beratBadan),
          tinggiBadan: parseFloat(newChild.tinggiBadan),
        });
        if (!addResult.success) {
          toast({
            title: "Gagal menyimpan data anak",
            description: addResult.message,
            variant: "destructive",
          });
          return;
        }
        // Get the just-added child
        const lastChild = getLastChild(user.id);
        if (!lastChild) {
          toast({
            title: "Gagal",
            description: "Gagal mengambil data anak yang baru ditambahkan.",
            variant: "destructive",
          });
          return;
        }
        childId = lastChild.id;
      }

      // 3. Create consultation
      const result = createConsultation({
        childId,
        pertanyaan,
      });

      if (result.success && result.consultationId) {
        toast({
          title: "Konsultasi terkirim",
          description: "Pertanyaan Anda akan ditinjau oleh ahli gizi.",
        });
        setViewWithConsultation("consultation-detail", result.consultationId);
      } else {
        toast({
          title: "Gagal mengirim konsultasi",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading / redirect state
  if (!user) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <span className="h-8 w-8 mx-auto mb-3 inline-block animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-sm text-gray-600">Memuat formulir konsultasi...</p>
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
        <div className="mb-6">
          <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-100 rounded-full">
            <MessageSquare className="h-3 w-3 mr-1" />
            Konsultasi Baru
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Formulir Konsultasi Gizi
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Lengkapi data di bawah ini untuk berkonsultasi dengan ahli gizi kami. Pertanyaan Anda
            akan dijawab dalam waktu 1-3 hari kerja.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ============ SECTION 1: DATA ORANG TUA ============ */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                  1
                </span>
                <User className="h-5 w-5 text-green-600" />
                Data Orang Tua
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="f-nama" className="text-xs font-medium text-gray-700">
                    Nama Orang Tua <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="f-nama"
                    value={parentForm.namaOrangTua}
                    onChange={(e) =>
                      setParentForm({ ...parentForm, namaOrangTua: e.target.value })
                    }
                    className="rounded-lg"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="f-telp" className="text-xs font-medium text-gray-700">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="f-telp"
                    type="tel"
                    value={parentForm.nomorTelepon}
                    onChange={(e) =>
                      setParentForm({ ...parentForm, nomorTelepon: e.target.value })
                    }
                    className="rounded-lg"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="f-alamat" className="text-xs font-medium text-gray-700">
                    Alamat <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="f-alamat"
                    value={parentForm.alamat}
                    onChange={(e) => setParentForm({ ...parentForm, alamat: e.target.value })}
                    className="rounded-lg"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Data orang tua di atas akan ikut tersimpan ke profil Anda. Pastikan informasi
                  yang dimasukkan selalu diperbarui.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ============ SECTION 2: DATA ANAK ============ */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                  2
                </span>
                <Baby className="h-5 w-5 text-green-600" />
                Data Anak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {/* Mode switcher */}
              {hasChildren && (
                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setChildMode("existing")}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      childMode === "existing"
                        ? "bg-green-600 text-white border-green-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    Pilih Anak Tersimpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setChildMode("new")}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      childMode === "new"
                        ? "bg-green-600 text-white border-green-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Tambah Anak Baru
                  </button>
                </div>
              )}

              {!hasChildren && (
                <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-0.5">
                      Belum ada data anak tersimpan
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Silakan tambahkan data anak terlebih dahulu menggunakan formulir di bawah
                      ini sebelum mengirim konsultasi.
                    </p>
                  </div>
                </div>
              )}

              {/* Existing child selector */}
              {childMode === "existing" && hasChildren && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="child-select" className="text-xs font-medium text-gray-700">
                      Pilih Anak <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="child-select"
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        disabled={submitting}
                        className="w-full h-9 rounded-lg border border-input bg-transparent pl-3 pr-10 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {children.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.namaAnak} — {c.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} •{" "}
                            {c.beratBadan} kg / {c.tinggiBadan} cm
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {selectedChild && (
                    <div className="p-4 rounded-xl bg-green-50/60 border border-green-100">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            selectedChild.jenisKelamin === "L"
                              ? "bg-blue-100"
                              : "bg-pink-100"
                          }`}
                        >
                          <Baby
                            className={`h-5 w-5 ${
                              selectedChild.jenisKelamin === "L"
                                ? "text-blue-600"
                                : "text-pink-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedChild.namaAnak}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {selectedChild.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                            <div className="p-2 rounded-lg bg-white">
                              <p className="text-[10px] text-gray-400 uppercase">Lahir</p>
                              <p className="font-semibold text-gray-900 text-[11px]">
                                {new Date(selectedChild.tanggalLahir).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-white">
                              <p className="text-[10px] text-gray-400 uppercase">Berat</p>
                              <p className="font-semibold text-gray-900 text-[11px]">
                                {selectedChild.beratBadan} kg
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-white">
                              <p className="text-[10px] text-gray-400 uppercase">Tinggi</p>
                              <p className="font-semibold text-gray-900 text-[11px]">
                                {selectedChild.tinggiBadan} cm
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-white">
                              <p className="text-[10px] text-gray-400 uppercase">Usia</p>
                              <p className="font-semibold text-gray-900 text-[11px]">
                                {(() => {
                                  const dob = new Date(selectedChild.tanggalLahir);
                                  const now = new Date();
                                  let y = now.getFullYear() - dob.getFullYear();
                                  let m = now.getMonth() - dob.getMonth();
                                  if (m < 0) {
                                    y--;
                                    m += 12;
                                  }
                                  if (y === 0) return `${m} bln`;
                                  return `${y}th ${m}bln`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New child form */}
              {childMode === "new" && (
                <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nc-nama" className="text-xs font-medium text-gray-700">
                        Nama Anak <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nc-nama"
                        placeholder="Nama lengkap anak"
                        value={newChild.namaAnak}
                        onChange={(e) =>
                          setNewChild({ ...newChild, namaAnak: e.target.value })
                        }
                        className="rounded-lg bg-white"
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nc-tgl" className="text-xs font-medium text-gray-700">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nc-tgl"
                        type="date"
                        value={newChild.tanggalLahir}
                        onChange={(e) =>
                          setNewChild({ ...newChild, tanggalLahir: e.target.value })
                        }
                        className="rounded-lg bg-white"
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewChild({ ...newChild, jenisKelamin: "L" })}
                          className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${
                            newChild.jenisKelamin === "L"
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                          }`}
                          disabled={submitting}
                        >
                          Laki-laki
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewChild({ ...newChild, jenisKelamin: "P" })}
                          className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${
                            newChild.jenisKelamin === "P"
                              ? "bg-pink-600 text-white border-pink-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-pink-300"
                          }`}
                          disabled={submitting}
                        >
                          Perempuan
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nc-bb" className="text-xs font-medium text-gray-700">
                        Berat Badan (kg) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nc-bb"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={newChild.beratBadan}
                        onChange={(e) =>
                          setNewChild({ ...newChild, beratBadan: e.target.value })
                        }
                        className="rounded-lg bg-white"
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="nc-tb" className="text-xs font-medium text-gray-700">
                        Tinggi Badan (cm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nc-tb"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={newChild.tinggiBadan}
                        onChange={(e) =>
                          setNewChild({ ...newChild, tinggiBadan: e.target.value })
                        }
                        className="rounded-lg bg-white"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ============ SECTION 3: PERTANYAAN KONSULTASI ============ */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                  3
                </span>
                <MessageSquare className="h-5 w-5 text-green-600" />
                Pertanyaan Konsultasi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-2">
                <Label htmlFor="pertanyaan" className="text-xs font-medium text-gray-700">
                  Tulis pertanyaan Anda <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="pertanyaan"
                  rows={6}
                  placeholder="Contoh: Anak saya sulit makan. Bagaimana cara meningkatkan nafsu makan dan memenuhi kebutuhan gizinya?"
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  className="rounded-lg resize-none"
                  disabled={submitting}
                />
                <div className="flex items-center justify-between text-xs">
                  <p className="text-gray-500">Minimal 10 karakter.</p>
                  <p
                    className={`font-mono ${
                      pertanyaan.trim().length >= 10
                        ? "text-green-600"
                        : pertanyaan.trim().length > 0
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                  >
                    {pertanyaan.trim().length} karakter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit area */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setView("user-dashboard")}
              disabled={submitting}
              className="rounded-full order-2 sm:order-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 mr-2 inline-block animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Konsultasi
                </>
              )}
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-2xl bg-white/60 border border-green-100 flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Dengan mengirim konsultasi, Anda menyetujui bahwa informasi yang diberikan akan
              digunakan untuk keperluan edukasi gizi oleh ahli gizi UPTD Puskesmas Neglasari.
              Konsultasi ini bersifat edukasi awal dan tidak menggantikan pemeriksaan langsung
              oleh tenaga kesehatan.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
