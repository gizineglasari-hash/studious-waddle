"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Download,
  Search,
  LayoutDashboard,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Loader2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/gemas/auth-store";
import { useGemasStore } from "@/lib/gemas/store";

export function AdminUsersView() {
  const { toast } = useToast();
  const { setView } = useGemasStore();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const users = useAuthStore((s) => s.users);
  const children = useAuthStore((s) => s.children);
  const consultations = useAuthStore((s) => s.consultations);
  const deleteUser = useAuthStore((s) => s.deleteUser);
  const refreshData = useAuthStore((s) => s.refreshData);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh data when this view mounts (admin)
  useEffect(() => {
    if (mounted && isAdmin) {
      refreshData();
    }
  }, [mounted, isAdmin, refreshData]);

  useEffect(() => {
    if (mounted && !isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Anda harus login sebagai admin.",
        variant: "destructive",
      });
      setView("admin-login");
    }
  }, [mounted, isAdmin, setView, toast]);

  // Filter users - only regular users (not admins)
  const regularUsers = useMemo(() => {
    return users.filter((u) => u.role === "user");
  }, [users]);

  // Search filter
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return regularUsers;
    const q = searchQuery.toLowerCase();
    return regularUsers.filter(
      (u) =>
        u.namaOrangTua?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.nomorTelepon?.toLowerCase().includes(q) ||
        u.alamat?.toLowerCase().includes(q)
    );
  }, [regularUsers, searchQuery]);

  // Get user stats
  const userStats = useMemo(() => {
    return filteredUsers.map((user) => {
      const userChildren = children.filter((c) => c.userId === user.id);
      const userConsultations = consultations.filter((c) => c.userId === user.id);
      return {
        ...user,
        childrenCount: userChildren.length,
        consultationsCount: userConsultations.length,
        childrenNames: userChildren.map((c) => c.namaAnak).join("; "),
      };
    });
  }, [filteredUsers, children, consultations]);

  // Download as Excel (CSV format - opens in Excel)
  const handleDownloadExcel = () => {
    setDownloading(true);
    try {
      // CSV headers
      const headers = [
        "No",
        "Nama Orang Tua",
        "Email",
        "Nomor Telepon",
        "Alamat",
        "Jumlah Anak",
        "Nama Anak",
        "Jumlah Konsultasi",
        "Tanggal Daftar",
      ];

      // CSV rows
      const rows = userStats.map((u, i) => [
        i + 1,
        u.namaOrangTua || "-",
        u.email || "-",
        u.nomorTelepon || "-",
        u.alamat || "-",
        u.childrenCount,
        u.childrenNames || "-",
        u.consultationsCount,
        u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-",
      ]);

      // Combine into CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma
              const str = String(cell);
              if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(",")
        ),
      ].join("\n");

      // Add BOM for Excel to recognize UTF-8
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Data_Pengguna_GEMAS_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download berhasil",
        description: `Data ${userStats.length} pengguna telah diunduh dalam format Excel (CSV).`,
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Gagal download",
        description: "Terjadi kesalahan saat mengunduh data.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="text-center">
          <ShieldCheck className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Mengalihkan ke halaman login admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-1.5 bg-purple-50 text-purple-700 border-purple-200 rounded-full">
                <Users className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                Data Pengguna
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Daftar pengguna terdaftar di website Koniciwa Gemas Gempita
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setView("admin-dashboard")}
              variant="outline"
              size="sm"
              className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
            >
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Dashboard
            </Button>
            <Button
              onClick={handleDownloadExcel}
              disabled={downloading || userStats.length === 0}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              {downloading ? "Mengunduh..." : "Download Excel"}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="pt-4 pb-3 text-center">
              <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-gray-900">{regularUsers.length}</div>
              <div className="text-xs text-gray-500">Total Pengguna</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="pt-4 pb-3 text-center">
              <User className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-gray-900">{children.length}</div>
              <div className="text-xs text-gray-500">Total Data Anak</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="pt-4 pb-3 text-center">
              <Mail className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-gray-900">
                {regularUsers.filter((u) => u.email).length}
              </div>
              <div className="text-xs text-gray-500">Punya Email</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="pt-4 pb-3 text-center">
              <Phone className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-gray-900">
                {regularUsers.filter((u) => u.nomorTelepon).length}
              </div>
              <div className="text-xs text-gray-500">Punya Telepon</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama, email, telepon, atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        {userStats.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">
                {searchQuery ? "Tidak ada pengguna yang cocok dengan pencarian." : "Belum ada pengguna terdaftar."}
              </p>
              {!searchQuery && (
                <p className="text-xs text-gray-400">
                  Pengguna akan muncul di sini setelah mendaftar akun di website.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Daftar Pengguna ({userStats.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Orang Tua</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Telepon</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Alamat</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Anak</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Konsultasi</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Daftar</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((user, i) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                              {user.namaOrangTua?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span className="font-medium text-gray-900">{user.namaOrangTua || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{user.nomorTelepon || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{user.alamat || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {user.childrenCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {user.consultationsCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            onClick={() => setDeleteTarget(user.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-full border-red-300 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {userStats.map((user, i) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold flex-shrink-0">
                        {user.namaOrangTua?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{user.namaOrangTua || "-"}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-600 ml-13">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{user.nomorTelepon || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{user.alamat || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>Daftar: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {user.childrenCount} Anak
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        {user.consultationsCount} Konsultasi
                      </Badge>
                      <Button
                        onClick={() => setDeleteTarget(user.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-red-300 text-red-600 hover:bg-red-50 h-7 w-7 p-0 ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Info */}
        {userStats.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Download className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Klik tombol <strong>"Download Excel"</strong> di kanan atas untuk mengunduh data semua pengguna
              dalam format Excel (CSV). File akan berisi: No, Nama Orang Tua, Email, Nomor Telepon, Alamat,
              Jumlah Anak, Nama Anak, Jumlah Konsultasi, dan Tanggal Daftar.
            </p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus pengguna ini? Semua data anak, konsultasi, dan notifikasi terkait juga akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!deleting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                disabled={!!deleting}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!deleteTarget) return;
                  setDeleting(deleteTarget);
                  try {
                    const result = await deleteUser(deleteTarget);
                    if (result.success) {
                      toast({ title: "Pengguna dihapus", description: result.message });
                      // Refresh data dari Supabase untuk memastikan sinkron
                      await refreshData();
                    } else {
                      toast({ title: "Gagal hapus", description: result.message, variant: "destructive" });
                      // Refresh juga untuk restore data yang di-rollback
                      await refreshData();
                    }
                    setDeleteTarget(null);
                  } catch (err) {
                    console.error("Delete user error:", err);
                    toast({
                      title: "Error",
                      description: "Terjadi kesalahan saat menghapus pengguna.",
                      variant: "destructive",
                    });
                  } finally {
                    setDeleting(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Pengguna
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
