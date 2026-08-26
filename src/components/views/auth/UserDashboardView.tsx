"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Bell,
  Plus,
  Pencil,
  Check,
  X,
  Calendar,
  Baby,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  CircleCheck,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import {
  useAuthStore,
  CONSULTATION_STATUS_COLORS,
  type ConsultationStatus,
} from "@/lib/gemas/auth-store";

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

function calculateAge(isoDate: string): string {
  try {
    const dob = new Date(isoDate);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return "Belum lahir";
    if (years === 0 && months === 0) return "Baru lahir";
    if (years === 0) return `${months} bulan`;
    return `${years} tahun ${months} bulan`;
  } catch {
    return "-";
  }
}

export function UserDashboardView() {
  const { toast } = useToast();
  const { setView, setViewWithConsultation } = useGemasStore();
  const {
    getCurrentUser,
    logout,
    getConsultationsByUser,
    getChildrenByUser,
    getUnreadNotificationCount,
    getNotificationsByUser,
    markAllNotificationsRead,
    addChild,
    updateProfile,
  } = useAuthStore();

  const user = getCurrentUser();
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);

  // Profile editing - ALL hooks must be before any conditional return
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    namaOrangTua: "",
    email: "",
    nomorTelepon: "",
    alamat: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childForm, setChildForm] = useState({
    namaAnak: "",
    tanggalLahir: "",
    jenisKelamin: "L" as "L" | "P",
    beratBadan: "",
    tinggiBadan: "",
  });
  const [savingChild, setSavingChild] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (isAuthLoading) return;
    if (user) return;
    const timer = setTimeout(() => {
      if (!getCurrentUser()) {
        setView("login");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [user, isAuthLoading, setView, getCurrentUser]);

  // Sync profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        namaOrangTua: user.namaOrangTua,
        email: user.email,
        nomorTelepon: user.nomorTelepon,
        alamat: user.alamat,
      });
    }
  }, [user]);

  // Notifications
  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotificationsByUser(user.id);
  }, [user, getNotificationsByUser]);

  const startEditProfile = () => {
    if (user) {
      setProfileForm({
        namaOrangTua: user.namaOrangTua,
        email: user.email,
        nomorTelepon: user.nomorTelepon,
        alamat: user.alamat,
      });
    }
    setEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
  };

  const saveProfile = () => {
    if (!user) return;
    if (!profileForm.namaOrangTua.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama orang tua wajib diisi.",
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      toast({
        title: "Validasi gagal",
        description: "Format email tidak valid.",
        variant: "destructive",
      });
      return;
    }
    setSavingProfile(true);
    try {
      updateProfile(user.id, {
        namaOrangTua: profileForm.namaOrangTua.trim(),
        email: profileForm.email.trim(),
        nomorTelepon: profileForm.nomorTelepon.trim(),
        alamat: profileForm.alamat.trim(),
      });
      toast({
        title: "Profil diperbarui",
        description: "Perubahan profil berhasil disimpan.",
      });
      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  // Children handlers
  const resetChildForm = () => {
    setChildForm({
      namaAnak: "",
      tanggalLahir: "",
      jenisKelamin: "L",
      beratBadan: "",
      tinggiBadan: "",
    });
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const berat = parseFloat(childForm.beratBadan);
    const tinggi = parseFloat(childForm.tinggiBadan);

    if (!childForm.namaAnak.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama anak wajib diisi.",
        variant: "destructive",
      });
      return;
    }
    if (!childForm.tanggalLahir) {
      toast({
        title: "Validasi gagal",
        description: "Tanggal lahir wajib diisi.",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(berat) || berat <= 0) {
      toast({
        title: "Validasi gagal",
        description: "Berat badan harus berupa angka positif.",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(tinggi) || tinggi <= 0) {
      toast({
        title: "Validasi gagal",
        description: "Tinggi badan harus berupa angka positif.",
        variant: "destructive",
      });
      return;
    }

    setSavingChild(true);
    try {
      const result = addChild({
        namaAnak: childForm.namaAnak.trim(),
        tanggalLahir: childForm.tanggalLahir,
        jenisKelamin: childForm.jenisKelamin,
        beratBadan: berat,
        tinggiBadan: tinggi,
      });
      if (result.success) {
        toast({ title: "Berhasil", description: result.message });
        resetChildForm();
        setShowChildForm(false);
      } else {
        toast({
          title: "Gagal menambahkan",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setSavingChild(false);
    }
  };

  // Notifications
  const unreadCount = user ? getUnreadNotificationCount(user.id) : 0;

  const handleOpenNotifs = () => {
    if (!showNotif && user && unreadCount > 0) {
      markAllNotificationsRead(user.id);
    }
    setShowNotif((v) => !v);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah keluar dari akun GEMAS.",
    });
    setView("home");
  };

  // Consultations
  const consultations = user ? getConsultationsByUser(user.id) : [];
  const children = user ? getChildrenByUser(user.id) : [];

  // Loading / redirect state
  if (isAuthLoading || !user) {
    return (
      <div className="animate-fade-in min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <span className="h-10 w-10 mx-auto mb-4 inline-block animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-sm text-gray-600">{isAuthLoading ? "Memuat data pengguna..." : "Memuat dashboard..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* ============ HEADER ============ */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-green-700 font-medium">Dashboard Pengguna</p>
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-gray-900 truncate">
                  Halo, {user.namaOrangTua}!
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notification bell */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenNotifs}
                  className="rounded-full border-green-200 bg-white hover:bg-green-50 hover:border-green-300 relative"
                  aria-label="Notifikasi"
                >
                  <Bell className="h-4 w-4 text-green-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>

                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600">
                      <p className="text-sm font-semibold text-white">Notifikasi</p>
                      <p className="text-[11px] text-green-50">
                        {notifications.length} total • {unreadCount} belum dibaca
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Belum ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-green-50/50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {formatDate(n.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setView("consultation-form")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Konsultasi Baru</span>
                <span className="sm:hidden">Konsultasi</span>
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="rounded-full border-red-200 bg-white hover:bg-red-50 hover:border-red-300"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* ============ PROFIL SAYA ============ */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Profil Saya
            </CardTitle>
            {!editingProfile ? (
              <Button
                onClick={startEditProfile}
                size="sm"
                variant="outline"
                className="rounded-full border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={saveProfile}
                  size="sm"
                  disabled={savingProfile}
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {savingProfile ? (
                    <span className="h-3.5 w-3.5 mr-1 inline-block animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  )}
                  Simpan
                </Button>
                <Button
                  onClick={cancelEditProfile}
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={savingProfile}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Batal
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-5">
            {!editingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <User className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">Nama Orang Tua</p>
                    <p className="text-sm font-medium text-gray-900 break-words">{user.namaOrangTua}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-words">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">Nomor Telepon</p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {user.nomorTelepon || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">Alamat</p>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {user.alamat || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="p-nama" className="text-xs font-medium text-gray-700">
                    Nama Orang Tua
                  </Label>
                  <Input
                    id="p-nama"
                    value={profileForm.namaOrangTua}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, namaOrangTua: e.target.value })
                    }
                    className="rounded-lg"
                    disabled={savingProfile}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-email" className="text-xs font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="p-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="rounded-lg"
                    disabled={savingProfile}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-telp" className="text-xs font-medium text-gray-700">
                    Nomor Telepon
                  </Label>
                  <Input
                    id="p-telp"
                    type="tel"
                    value={profileForm.nomorTelepon}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, nomorTelepon: e.target.value })
                    }
                    className="rounded-lg"
                    disabled={savingProfile}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="p-alamat" className="text-xs font-medium text-gray-700">
                    Alamat
                  </Label>
                  <Input
                    id="p-alamat"
                    value={profileForm.alamat}
                    onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                    className="rounded-lg"
                    disabled={savingProfile}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============ DATA ANAK ============ */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <Baby className="h-5 w-5 text-green-600" />
              Data Anak
              {children.length > 0 && (
                <Badge className="ml-1 bg-green-100 text-green-700 hover:bg-green-100">
                  {children.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={() => {
                resetChildForm();
                setShowChildForm((v) => !v);
              }}
              size="sm"
              className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {showChildForm ? (
                <>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Tutup
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah Anak
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            {showChildForm && (
              <form
                onSubmit={handleAddChild}
                className="mb-5 p-4 rounded-xl bg-green-50/50 border border-green-100"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-nama" className="text-xs font-medium text-gray-700">
                      Nama Anak <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="c-nama"
                      placeholder="Nama lengkap anak"
                      value={childForm.namaAnak}
                      onChange={(e) =>
                        setChildForm({ ...childForm, namaAnak: e.target.value })
                      }
                      className="rounded-lg bg-white"
                      disabled={savingChild}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-tgl" className="text-xs font-medium text-gray-700">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="c-tgl"
                      type="date"
                      value={childForm.tanggalLahir}
                      onChange={(e) =>
                        setChildForm({ ...childForm, tanggalLahir: e.target.value })
                      }
                      className="rounded-lg bg-white"
                      disabled={savingChild}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setChildForm({ ...childForm, jenisKelamin: "L" })}
                        className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${
                          childForm.jenisKelamin === "L"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                        disabled={savingChild}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setChildForm({ ...childForm, jenisKelamin: "P" })}
                        className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${
                          childForm.jenisKelamin === "P"
                            ? "bg-pink-600 text-white border-pink-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-pink-300"
                        }`}
                        disabled={savingChild}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-bb" className="text-xs font-medium text-gray-700">
                        Berat (kg) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="c-bb"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={childForm.beratBadan}
                        onChange={(e) =>
                          setChildForm({ ...childForm, beratBadan: e.target.value })
                        }
                        className="rounded-lg bg-white"
                        disabled={savingChild}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-tb" className="text-xs font-medium text-gray-700">
                        Tinggi (cm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="c-tb"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={childForm.tinggiBadan}
                        onChange={(e) =>
                          setChildForm({ ...childForm, tinggiBadan: e.target.value })
                        }
                        className="rounded-lg bg-white"
                        disabled={savingChild}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={savingChild}
                  className="mt-4 w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                >
                  {savingChild ? (
                    <>
                      <span className="h-4 w-4 mr-2 inline-block animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Simpan Data Anak
                    </>
                  )}
                </Button>
              </form>
            )}

            {children.length === 0 ? (
              <div className="text-center py-10">
                <Baby className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Belum ada data anak</p>
                <p className="text-xs text-gray-500">
                  Klik &quot;Tambah Anak&quot; untuk menambahkan data anak Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:border-green-200 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          child.jenisKelamin === "L"
                            ? "bg-blue-100"
                            : "bg-pink-100"
                        }`}
                      >
                        <Baby
                          className={`h-5 w-5 ${
                            child.jenisKelamin === "L" ? "text-blue-600" : "text-pink-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {child.namaAnak}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {child.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} •{" "}
                          {calculateAge(child.tanggalLahir)}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">{child.beratBadan}</span>
                            kg
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">{child.tinggiBadan}</span>
                            cm
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Lahir: {formatDate(child.tanggalLahir)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============ KONSULTASI SAYA ============ */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Konsultasi Saya
              {consultations.length > 0 && (
                <Badge className="ml-1 bg-green-100 text-green-700 hover:bg-green-100">
                  {consultations.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={() => setView("consultation-form")}
              size="sm"
              variant="outline"
              className="rounded-full border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Konsultasi Baru</span>
              <span className="sm:hidden">Baru</span>
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            {consultations.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Belum ada konsultasi</p>
                <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                  Mulai konsultasi pertama Anda dengan ahli gizi untuk mendapatkan saran terkait
                  gizi dan tumbuh kembang anak.
                </p>
                <Button
                  onClick={() => setView("consultation-form")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Mulai Konsultasi
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map((c) => {
                  const colors =
                    CONSULTATION_STATUS_COLORS[c.status as ConsultationStatus] ||
                    CONSULTATION_STATUS_COLORS["Menunggu Jawaban"];
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:border-green-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Baby className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <p className="text-sm font-semibold text-gray-900">{c.namaAnak}</p>
                            <Badge
                              className={`${colors.bg} ${colors.text} border-0 font-medium`}
                            >
                              {colors.emoji} {c.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(c.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2">
                        {c.pertanyaan}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setViewWithConsultation("consultation-detail", c.id)
                          }
                          className="text-green-700 hover:bg-green-50 hover:text-green-800 rounded-full px-3"
                        >
                          Lihat Konsultasi
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <div className="mt-6 p-4 rounded-2xl bg-white/60 border border-green-100 flex items-start gap-3">
          <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-800 mb-0.5">Tips</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pastikan data anak selalu diperbarui. Untuk konsultasi terkini, gunakan tombol
              &quot;Konsultasi Baru&quot;. Notifikasi akan muncul ketika ahli gizi menjawab
              pertanyaan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
