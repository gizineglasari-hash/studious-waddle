"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  ListChecks,
  Eye,
  Inbox,
  ShieldCheck,
  Phone,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import {
  useAuthStore,
  CONSULTATION_STATUS_COLORS,
  type ConsultationStatus,
} from "@/lib/gemas/auth-store";

type FilterTab = "Semua" | ConsultationStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "Semua", label: "Semua" },
  { key: "Menunggu Jawaban", label: "Menunggu Jawaban" },
  { key: "Sedang Diproses", label: "Sedang Diproses" },
  { key: "Sudah Dijawab", label: "Sudah Dijawab" },
  { key: "Selesai", label: "Selesai" },
];

export function AdminConsultationsView() {
  const { toast } = useToast();
  const { setView, setViewWithConsultation } = useGemasStore();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const consultations = useAuthStore((s) => s.consultations);

  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

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

  // All consultations sorted by newest first
  const sortedConsultations = useMemo(() => {
    return [...consultations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [consultations]);

  // Filtered + searched consultations
  const filtered = useMemo(() => {
    let list = sortedConsultations;

    if (activeFilter !== "Semua") {
      list = list.filter((c) => c.status === activeFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.namaAnak.toLowerCase().includes(q) ||
          c.namaOrangTua.toLowerCase().includes(q) ||
          c.nomorTelepon.toLowerCase().includes(q)
      );
    }

    return list;
  }, [sortedConsultations, activeFilter, searchQuery]);

  // Count per status for tab badges
  const counts = useMemo(() => {
    const map: Record<FilterTab, number> = {
      "Semua": sortedConsultations.length,
      "Menunggu Jawaban": 0,
      "Sedang Diproses": 0,
      "Sudah Dijawab": 0,
      "Selesai": 0,
    };
    sortedConsultations.forEach((c) => {
      map[c.status] = (map[c.status] ?? 0) + 1;
    });
    return map;
  }, [sortedConsultations]);

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

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button
              onClick={() => setView("admin-dashboard")}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Badge variant="secondary" className="mb-1.5 bg-green-50 text-green-700 border-green-200 rounded-full">
                <ListChecks className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                Daftar Konsultasi
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola semua konsultasi yang masuk dari orang tua
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama anak, nama orang tua, atau nomor telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1.5"
                  aria-label="Bersihkan pencarian"
                >
                  ✕
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filter tabs */}
        <div className="mb-4 overflow-x-auto -mx-1 px-1 pb-1">
          <div className="flex gap-2 min-w-max">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = counts[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consultation list */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-white pb-3 hidden sm:block">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Anak</div>
              <div className="col-span-3">Orang Tua</div>
              <div className="col-span-2">Tanggal</div>
              <div className="col-span-3">Pertanyaan</div>
              <div className="col-span-1 text-right">Aksi</div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {searchQuery || activeFilter !== "Semua"
                    ? "Tidak ada konsultasi yang cocok dengan filter."
                    : "Belum ada konsultasi masuk."}
                </p>
                {(searchQuery || activeFilter !== "Semua") && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("Semua");
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-full"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((c) => {
                  const colors = CONSULTATION_STATUS_COLORS[c.status];
                  const truncatedQuestion =
                    c.pertanyaan.length > 80
                      ? c.pertanyaan.slice(0, 80) + "..."
                      : c.pertanyaan;
                  return (
                    <div
                      key={c.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 py-3.5 px-1 hover:bg-green-50/40 rounded-lg transition-colors"
                    >
                      {/* Anak */}
                      <div className="sm:col-span-3">
                        <div className="text-xs text-gray-400 sm:hidden mb-0.5">Anak</div>
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {c.namaAnak}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {c.jenisKelaminAnak === "L" ? "Laki-laki" : "Perempuan"} ·{" "}
                          {c.beratBadanAnak}kg / {c.tinggiBadanAnak}cm
                        </div>
                      </div>
                      {/* Orang Tua */}
                      <div className="sm:col-span-3">
                        <div className="text-xs text-gray-400 sm:hidden mb-0.5">Orang Tua</div>
                        <div className="flex items-center gap-1 text-sm text-gray-700 truncate">
                          <UserRound className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{c.namaOrangTua}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{c.nomorTelepon || "-"}</span>
                        </div>
                      </div>
                      {/* Tanggal */}
                      <div className="sm:col-span-2">
                        <div className="text-xs text-gray-400 sm:hidden mb-0.5">Tanggal</div>
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <CalendarDays className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          {new Date(c.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      {/* Pertanyaan */}
                      <div className="sm:col-span-3">
                        <div className="text-xs text-gray-400 sm:hidden mb-0.5">Pertanyaan</div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {truncatedQuestion}
                        </p>
                        <Badge
                          className={`${colors.bg} ${colors.text} border-0 rounded-full text-[10px] px-2 py-0 mt-1`}
                        >
                          {colors.emoji} {c.status}
                        </Badge>
                      </div>
                      {/* Aksi */}
                      <div className="sm:col-span-1 flex sm:justify-end items-start">
                        <Button
                          onClick={() =>
                            setViewWithConsultation("admin-consultation-detail", c.id)
                          }
                          size="sm"
                          className="rounded-full bg-green-600 hover:bg-green-700 text-white h-8 px-4 text-xs w-full sm:w-auto"
                        >
                          <Eye className="h-3 w-3 sm:mr-1" />
                          <span className="sm:hidden">Lihat Detail</span>
                          <span className="hidden sm:inline">Lihat</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            Menampilkan <strong className="text-gray-700">{filtered.length}</strong> dari{" "}
            <strong className="text-gray-700">{sortedConsultations.length}</strong> konsultasi
          </span>
          <Separator className="hidden sm:block flex-1 mx-4" />
          <button
            onClick={() => setView("admin-dashboard")}
            className="text-green-700 hover:text-green-800 font-medium"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
