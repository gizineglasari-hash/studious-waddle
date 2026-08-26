"use client";

import { useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  LogOut,
  Bell,
  MessageSquare,
  Clock,
  CheckCircle2,
  Loader2,
  Users,
  ListChecks,
  History,
  ArrowRight,
  Inbox,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import {
  useAuthStore,
  CONSULTATION_STATUS_COLORS,
} from "@/lib/gemas/auth-store";

interface StatCard {
  key: string;
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  text: string;
  ring: string;
}

export function AdminDashboardView() {
  const { toast } = useToast();
  const { setView, setViewWithConsultation } = useGemasStore();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const adminLogout = useAuthStore((s) => s.adminLogout);
  const getCurrentUser = useAuthStore((s) => s.getCurrentUser);
  const consultations = useAuthStore((s) => s.consultations);
  const users = useAuthStore((s) => s.users);
  const notifications = useAuthStore((s) => s.notifications);
  const markAllNotificationsRead = useAuthStore((s) => s.markAllNotificationsRead);

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

  // Derived stats — reactive to store changes, no setState needed
  const stats = useMemo(() => {
    return {
      totalConsultations: consultations.length,
      menungguJawaban: consultations.filter((c) => c.status === "Menunggu Jawaban").length,
      sedangDiproses: consultations.filter((c) => c.status === "Sedang Diproses").length,
      sudahDijawab: consultations.filter((c) => c.status === "Sudah Dijawab").length,
      selesai: consultations.filter((c) => c.status === "Selesai").length,
      totalUsers: users.filter((u) => u.role === "user").length,
    };
  }, [consultations, users]);

  const recentConsultations = useMemo(() => {
    return [...consultations]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [consultations]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.userId === "admin" && !n.isRead).length,
    [notifications]
  );

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Keluar",
      description: "Anda telah keluar dari panel admin.",
    });
    setView("home");
  };

  const handleRefresh = () => {
    toast({
      title: "Data diperbarui",
      description: "Statistik konsultasi telah dimuat ulang.",
    });
  };

  const handleClearNotifications = () => {
    markAllNotificationsRead("admin");
    toast({
      title: "Notifikasi dibaca",
      description: "Semua notifikasi ditandai sebagai telah dibaca.",
    });
  };

  // Guard: render fallback if not admin (redirect triggered via effect above)
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

  const adminUser = getCurrentUser();
  const adminName = adminUser?.namaOrangTua || "Administrator";

  // Safe stats - fallback to zeros if stats fails
  const safeStats = stats || {
    totalConsultations: 0,
    menungguJawaban: 0,
    sedangDiproses: 0,
    sudahDijawab: 0,
    selesai: 0,
    totalUsers: 0,
  };

  const statCards: StatCard[] = [
    {
      key: "total",
      label: "Total Konsultasi",
      value: safeStats.totalConsultations,
      icon: Inbox,
      bg: "bg-green-100",
      text: "text-green-700",
      ring: "ring-green-200",
    },
    {
      key: "menunggu",
      label: "Menunggu Jawaban",
      value: safeStats.menungguJawaban,
      icon: Clock,
      bg: "bg-orange-100",
      text: "text-orange-700",
      ring: "ring-orange-200",
    },
    {
      key: "diproses",
      label: "Sedang Diproses",
      value: safeStats.sedangDiproses,
      icon: Loader2,
      bg: "bg-blue-100",
      text: "text-blue-700",
      ring: "ring-blue-200",
    },
    {
      key: "dijawab",
      label: "Sudah Dijawab",
      value: safeStats.sudahDijawab,
      icon: CheckCircle2,
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      ring: "ring-emerald-200",
    },
    {
      key: "users",
      label: "Total Pengguna",
      value: safeStats.totalUsers,
      icon: Users,
      bg: "bg-purple-100",
      text: "text-purple-700",
      ring: "ring-purple-200",
    },
  ];

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-md flex-shrink-0">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-1.5 bg-red-50 text-red-700 border-red-200 rounded-full">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Selamat datang, <span className="font-semibold">{adminName}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Navigation Sidebar - Horizontal on mobile, vertical on desktop */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <Button
            onClick={() => setView("admin-dashboard")}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm"
            size="sm"
          >
            <LayoutDashboard className="h-4 w-4 mr-1.5" />
            Dashboard
          </Button>
          <Button
            onClick={() => setView("admin-consultations")}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Konsultasi
          </Button>
          <Button
            onClick={() => setView("admin-analytics-pengunjung")}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm"
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Analytics Pengunjung
          </Button>
          <Button
            onClick={() => setView("admin-edit-website")}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm"
            size="sm"
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Edit Website
          </Button>
          <Button
            onClick={() => setView("admin-history")}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm"
            size="sm"
          >
            <History className="h-4 w-4 mr-1.5" />
            Riwayat
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.key}
                className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-5 pb-4">
                  <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 ring-4 ${card.ring} ring-opacity-30`}>
                    <Icon className={`h-5 w-5 ${card.text}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {card.value}
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1 font-medium leading-tight">
                    {card.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent consultations (2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-white pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  Konsultasi Terbaru
                </CardTitle>
                <Button
                  onClick={() => setView("admin-consultations")}
                  variant="ghost"
                  size="sm"
                  className="text-green-700 hover:text-green-800 hover:bg-green-50 rounded-full text-xs"
                >
                  Lihat Semua
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="pt-2">
                {recentConsultations.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Inbox className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Belum ada konsultasi masuk.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentConsultations.map((c) => {
                      const colors = CONSULTATION_STATUS_COLORS[c.status];
                      return (
                        <div
                          key={c.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {c.namaAnak}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 truncate">
                                {c.namaOrangTua}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-gray-400">
                                {new Date(c.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <Badge
                                className={`${colors.bg} ${colors.text} border-0 rounded-full text-[10px] px-2 py-0`}
                              >
                                {colors.emoji} {c.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              setViewWithConsultation("admin-consultation-detail", c.id)
                            }
                            size="sm"
                            className="rounded-full bg-green-600 hover:bg-green-700 text-white h-8 px-4 text-xs self-start sm:self-center"
                          >
                            Lihat
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: notifications + navigation */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 pb-3">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="relative">
                    <Bell className="h-4 w-4 text-amber-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </div>
                  Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-extrabold text-gray-900">
                    {unreadCount}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 leading-tight">
                      Konsultasi baru<br />menunggu ditinjau
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Button
                    onClick={handleClearNotifications}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full text-xs h-8 border-amber-300 text-amber-800 hover:bg-amber-100"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Tandai Semua Dibaca
                  </Button>
                )}
                {unreadCount === 0 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Tidak ada notifikasi baru.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick navigation */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-white pb-3">
                <CardTitle className="text-base font-bold text-gray-900">
                  Menu Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                <Button
                  onClick={() => setView("admin-consultations")}
                  className="w-full justify-start rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-11"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Daftar Konsultasi
                </Button>
                <Button
                  onClick={() => setView("admin-history")}
                  variant="outline"
                  className="w-full justify-start rounded-xl h-11"
                >
                  <History className="h-4 w-4 mr-2" />
                  Riwayat Konsultasi
                </Button>
                <Separator className="my-2" />
                <p className="text-[11px] text-gray-400 text-center px-2 leading-relaxed">
                  Login terakhir:{" "}
                  {new Date().toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
