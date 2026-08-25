"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, History, Trash2, Calendar, Activity, ArrowRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGemasStore, type MeasurementRecord } from "@/lib/gemas/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  "sangat-kurang": "#dc2626",
  "kurang": "#f97316",
  "normal": "#16a34a",
  "berlebih": "#dc2626",
  "sangat-pendek": "#dc2626",
  "pendek": "#f97316",
  "tinggi": "#0ea5e9",
  "sangat-kurus": "#dc2626",
  "kurus": "#f97316",
  "risiko": "#eab308",
  "gemuk": "#dc2626",
  "tidak-valid": "#6b7280",
  "perlu-konsultasi": "#dc2626",
  "perlu-perhatian": "#f97316",
};

export function PertumbuhanAnakView() {
  const { history, removeMeasurement, clearHistory, setView } = useGemasStore();
  const { toast } = useToast();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  // Group by nama anak
  const groupedByChild = history.reduce((acc, rec) => {
    const key = rec.nama.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(rec);
    return acc;
  }, {} as Record<string, MeasurementRecord[]>);

  const childNames = Object.keys(groupedByChild);
  const activeChild = selectedChild || childNames[0];
  const childRecords = activeChild ? (groupedByChild[activeChild] || []).sort((a, b) =>
    new Date(a.tanggalUkur).getTime() - new Date(b.tanggalUkur).getTime()
  ) : [];

  // Data untuk chart riwayat BB
  const weightHistory = childRecords.map((r) => ({
    tanggal: new Date(r.tanggalUkur).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
    rawDate: r.tanggalUkur,
    bb: r.beratBadan,
    zscore: r.results.find((res) => res.indicator === "BB/U")?.zScore,
  }));

  const heightHistory = childRecords.map((r) => ({
    tanggal: new Date(r.tanggalUkur).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
    rawDate: r.tanggalUkur,
    tb: r.panjangTinggiBadan,
    zscore: r.results.find((res) => res.indicator === "TB/U")?.zScore,
  }));

  const handleDelete = (id: string, nama: string) => {
    removeMeasurement(id);
    toast({
      title: "Riwayat dihapus",
      description: `Hasil pengukuran untuk ${nama} telah dihapus.`,
    });
  };

  const handleClearAll = () => {
    clearHistory();
    toast({
      title: "Semua riwayat dihapus",
      description: "Seluruh riwayat pengukuran telah dihapus dari perangkat ini.",
    });
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 py-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Riwayat Pertumbuhan
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Riwayat Pertumbuhan Anak
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Pantau perkembangan anak dari waktu ke waktu. Riwayat pengukuran tersimpan di perangkat ini (local storage).
          </p>
        </div>

        {history.length === 0 ? (
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">Belum ada riwayat pengukuran</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                Lakukan pemeriksaan status gizi anak terlebih dahulu, lalu simpan hasilnya. Riwayat akan muncul di sini untuk pemantauan dari waktu ke waktu.
              </p>
              <Button
                onClick={() => setView("cek-status-gizi")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
              >
                Cek Status Gizi Anak
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pemilihan anak */}
            {childNames.length > 1 && (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Pilih Anak:</h3>
                  <div className="flex flex-wrap gap-2">
                    {childNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedChild(name)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                          activeChild === name
                            ? "bg-green-600 text-white"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        )}
                      >
                        {groupedByChild[name][0].nama}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grafik perkembangan BB */}
            {childRecords.length >= 2 && (
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Perkembangan Berat Badan {activeChild && `- ${groupedByChild[activeChild][0].nama}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} width={45} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number) => `${v.toFixed(1)} kg`}
                        />
                        <Line type="monotone" dataKey="bb" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 5, fill: "#16a34a" }} name="Berat Badan" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {childRecords.length >= 2 && (
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Perkembangan Panjang/Tinggi Badan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={heightHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} width={45} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number) => `${v.toFixed(1)} cm`}
                        />
                        <Line type="monotone" dataKey="tb" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 5, fill: "#0ea5e9" }} name="Tinggi/Panjang" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabel riwayat */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Riwayat Pengukuran
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAll}
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-full text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Hapus Semua
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Tanggal</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-700">Usia</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-700">BB (kg)</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-700">TB/PB (cm)</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-700">Z-score BB/U</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Status</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {childRecords.slice().reverse().map((rec) => (
                        <tr key={rec.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-2 text-gray-700 text-xs">
                            {new Date(rec.tanggalUkur).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-2 px-2 text-center text-xs text-gray-700">{rec.ageLabel}</td>
                          <td className="py-2 px-2 text-center font-medium text-gray-900">{rec.beratBadan.toFixed(1)}</td>
                          <td className="py-2 px-2 text-center font-medium text-gray-900">{rec.panjangTinggiBadan.toFixed(1)}</td>
                          <td className="py-2 px-2 text-center font-mono text-xs">
                            {rec.results.find((r) => r.indicator === "BB/U")?.zScore !== null
                              ? rec.results.find((r) => r.indicator === "BB/U")?.zScore?.toFixed(2)
                              : "—"}
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                              style={{ backgroundColor: STATUS_COLORS[rec.overallStatusKey] || "#6b7280" }}
                            >
                              {rec.overallStatusKey === "normal" ? "Normal" :
                               rec.overallStatusKey === "perlu-perhatian" ? "Perlu Perhatian" :
                               rec.overallStatusKey === "perlu-konsultasi" ? "Perlu Konsultasi" : "Periksa"}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleDelete(rec.id, rec.nama)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-2">
                  <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Riwayat pengukuran disimpan secara lokal di perangkat ini menggunakan local storage browser.
                    Data tidak dikirim ke server. Jika browser dibersihkan, riwayat akan hilang.
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={() => setView("cek-status-gizi")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
              >
                Tambah Pengukuran Baru
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
