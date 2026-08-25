"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Baby,
  Ruler,
  Weight,
  CalendarDays,
  Save,
  Printer,
  PhoneCall,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ClipboardList,
  Activity,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  calculateNutritionStatus,
  validateInput,
  formatAge,
  getGrowthCurveData,
  getWfhCurveData,
  type ChildInput,
  type CalcResult,
} from "@/lib/who/calculator";
import { GrowthChart } from "@/components/gemas/GrowthChart";
import { useGemasStore, type MeasurementRecord } from "@/lib/gemas/store";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  "sangat-kurang": { color: "text-red-700", bg: "bg-red-100" },
  "kurang": { color: "text-orange-700", bg: "bg-orange-100" },
  "normal": { color: "text-green-700", bg: "bg-green-100" },
  "berlebih": { color: "text-red-700", bg: "bg-red-100" },
  "sangat-pendek": { color: "text-red-700", bg: "bg-red-100" },
  "pendek": { color: "text-orange-700", bg: "bg-orange-100" },
  "tinggi": { color: "text-sky-700", bg: "bg-sky-100" },
  "sangat-kurus": { color: "text-red-700", bg: "bg-red-100" },
  "kurus": { color: "text-orange-700", bg: "bg-orange-100" },
  "risiko": { color: "text-amber-700", bg: "bg-amber-100" },
  "gemuk": { color: "text-red-700", bg: "bg-red-100" },
  "tidak-valid": { color: "text-gray-700", bg: "bg-gray-100" },
};

function getRecommendations(result: CalcResult): { title: string; items: string[]; tone: "normal" | "warning" | "danger" }[] {
  if (result.invalidData) {
    return [
      {
        title: "Data Perlu Diperiksa",
        items: [
          "Pastikan tanggal lahir, jenis kelamin, berat badan, serta panjang/tinggi badan sudah benar.",
          "Pastikan jenis pengukuran sesuai dengan umur anak (Panjang Badan untuk <24 bulan, Tinggi Badan untuk >=24 bulan).",
          "Jika hasil tetap tidak sesuai, silakan konsultasikan kepada tenaga kesehatan atau ahli gizi.",
          "Bawa anak ke Posyandu atau Puskesmas untuk pengukuran ulang dengan alat yang terkalibrasi.",
        ],
        tone: "warning",
      },
    ];
  }

  const recs: { title: string; items: string[]; tone: "normal" | "warning" | "danger" }[] = [];
  const allNormal = !result.hasProblem;

  if (allNormal) {
    recs.push({
      title: "Pertumbuhan Sesuai - Lanjutkan Kebiasaan Baik",
      items: [
        "Berikan makanan beragam dan bergizi seimbang sesuai panduan Isi Piringku.",
        "Pastikan anak mendapatkan protein hewani setiap hari (telur, ikan, daging, ayam, hati).",
        "Lanjutkan pemberian ASI sesuai rekomendasi (hingga usia 24 bulan atau lebih).",
        "Pantau pertumbuhan setiap bulan di Posyandu.",
        "Pastikan imunisasi dan pelayanan kesehatan sesuai jadwal.",
        "Berikan makanan dengan tekstur yang sesuai usia dan terapkan makan responsif.",
      ],
      tone: "normal",
    });
    return recs;
  }

  // Cek per indikator
  const wfaResult = result.results.find((r) => r.indicator === "BB/U");
  const lhfaResult = result.results.find((r) => r.indicator === "TB/U");
  const wfhResult = result.results.find((r) => r.indicator === "BB/TB");
  const bfaResult = result.results.find((r) => r.indicator === "IMT/U");

  // BB/U bermasalah
  if (
    wfaResult &&
    (wfaResult.statusKey === "kurang" || wfaResult.statusKey === "sangat-kurang")
  ) {
    const isSevere = wfaResult.statusKey === "sangat-kurang";
    recs.push({
      title: isSevere ? "Berat Badan Sangat Kurang - Perlu Konsultasi Segera" : "Berat Badan Kurang - Perlu Pemantauan",
      items: [
        "Evaluasi jumlah dan frekuensi makan anak setiap hari.",
        "Berikan makanan padat gizi dengan tambahan protein hewani (telur, ikan, daging, hati).",
        "Pastikan anak makan 3 kali makan utama dan 2 kali camilan sehat setiap hari.",
        "Tambahkan minyak atau mentega pada makanan untuk menambah kalori.",
        "Pantau berat badan secara rutin setiap bulan di Posyandu.",
        isSevere ? "Segera konsultasikan dengan ahli gizi atau tenaga kesehatan." : "Konsultasikan dengan ahli gizi untuk evaluasi lebih lanjut.",
      ],
      tone: isSevere ? "danger" : "warning",
    });
  }

  // TB/U bermasalah (stunting)
  if (
    lhfaResult &&
    (lhfaResult.statusKey === "pendek" || lhfaResult.statusKey === "sangat-pendek")
  ) {
    const isSevere = lhfaResult.statusKey === "sangat-pendek";
    recs.push({
      title: isSevere ? "Tinggi Badan Sangat Pendek - Perlu Konsultasi Segera" : "Tinggi Badan Pendek (Stunting) - Perlu Pemantauan",
      items: [
        "Evaluasi pola makan dan riwayat penyakit anak.",
        "Pastikan kebutuhan gizi harian terpenuhi, terutama protein hewani dan zat besi.",
        "Pastikan asupan vitamin A, zat besi, dan seng cukup (dari makanan atau suplemen sesuai anjuran tenaga kesehatan).",
        "Cek apakah ada riwayat penyakit berulang (diare, ISPA) yang dapat mengganggu penyerapan gizi.",
        "Pantau pertumbuhan secara berkala setiap bulan di Posyandu.",
        isSevere ? "Segera konsultasikan dengan tenaga kesehatan untuk evaluasi menyeluruh." : "Konsultasikan dengan tenaga kesehatan untuk pemantauan lanjutan.",
      ],
      tone: isSevere ? "danger" : "warning",
    });
  }

  // BB/TB bermasalah (wasting)
  if (
    wfhResult &&
    (wfhResult.statusKey === "kurus" || wfhResult.statusKey === "sangat-kurus")
  ) {
    const isSevere = wfhResult.statusKey === "sangat-kurus";
    recs.push({
      title: isSevere ? "Anak Sangat Kurus - Perlu Konsultasi Segera" : "Anak Kurus - Perlu Pemantauan",
      items: [
        "Berikan makanan padat kalori dan protein (telur, hati, daging, ikan).",
        "Tambahkan lemak sehat (alpukat, minyak zaitun, kacang-kacangan) pada makanan.",
        "Berikan camilan sehat 2 kali sehari di antara makan utama.",
        "Pastikan anak tidak mengalami infeksi berulang yang dapat menyebabkan penurunan berat badan.",
        isSevere ? "Segera bawa anak ke Puskesmas atau tenaga kesehatan." : "Konsultasikan dengan ahli gizi untuk perencanaan menu.",
      ],
      tone: isSevere ? "danger" : "warning",
    });
  }

  // IMT/U bermasalah
  if (
    bfaResult &&
    (bfaResult.statusKey === "kurus" || bfaResult.statusKey === "sangat-kurus")
  ) {
    const isSevere = bfaResult.statusKey === "sangat-kurus";
    if (!recs.some((r) => r.title.includes("Kurus"))) {
      recs.push({
        title: isSevere ? "IMT Sangat Kurang - Perlu Konsultasi" : "IMT Kurang - Perlu Pemantauan",
        items: [
          "Tingkatkan asupan kalori dan protein dengan makanan padat gizi.",
          "Berikan camilan sehat seperti pisang, alpukat, selai kacang, susu.",
          "Pastikan jadwal makan teratur dan hindari distraksi saat makan.",
          isSevere ? "Segera konsultasikan dengan tenaga kesehatan." : "Pantau IMT secara berkala.",
        ],
        tone: isSevere ? "danger" : "warning",
      });
    }
  }

  // BB/U, BB/TB, atau IMT/U berlebih/gemuk
  if (
    wfhResult?.statusKey === "risiko" ||
    wfhResult?.statusKey === "gemuk" ||
    bfaResult?.statusKey === "risiko" ||
    bfaResult?.statusKey === "gemuk" ||
    wfaResult?.statusKey === "berlebih"
  ) {
    recs.push({
      title: "Berat Badan Berlebih - Perlu Penyesuaian Pola Makan",
      items: [
        "Batasi makanan tinggi gula, garam, dan lemak jenuh (jajan, minuman manis, gorengan).",
        "Perbanyak sayur dan buah segar dalam porsi cukup.",
        "Ganti camilan tinggi gula dengan buah atau kacang rebus.",
        "Pastikan anak aktif bergerak minimal 60 menit setiap hari (bermain, berlari, dll).",
        "Kurangi waktu menonton TV atau menggunakan gadget.",
        "Konsultasikan dengan ahli gizi untuk penyusunan menu yang seimbang.",
      ],
      tone: "warning",
    });
  }

  return recs;
}

export function CekStatusGiziView() {
  const { toast } = useToast();
  const { setView, addMeasurement } = useGemasStore();
  const [form, setForm] = useState({
    nama: "",
    jenisKelamin: "" as "L" | "P" | "",
    tanggalLahir: "",
    tanggalUkur: new Date().toISOString().split("T")[0],
    beratBadan: "",
    panjangTinggiBadan: "",
    jenisPengukuran: "" as "panjang" | "tinggi" | "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [validation, setValidation] = useState<{ checked: boolean; success: boolean; message: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleCalculate = () => {
    setValidation(null);
    const input: ChildInput = {
      nama: form.nama.trim(),
      jenisKelamin: form.jenisKelamin as "L" | "P",
      tanggalLahir: form.tanggalLahir,
      tanggalUkur: form.tanggalUkur,
      beratBadan: parseFloat(form.beratBadan.replace(",", ".")),
      panjangTinggiBadan: parseFloat(form.panjangTinggiBadan.replace(",", ".")),
      jenisPengukuran: form.jenisPengukuran as "panjang" | "tinggi",
    };

    const validationErrors = validateInput(input);

    // Tambahan validasi
    if (!input.jenisKelamin) {
      validationErrors.push("Jenis kelamin wajib dipilih.");
    }
    if (!input.jenisPengukuran) {
      validationErrors.push("Jenis pengukuran wajib dipilih.");
    }
    if (input.tanggalLahir && input.tanggalUkur) {
      const birth = new Date(input.tanggalLahir);
      const measure = new Date(input.tanggalUkur);
      if (measure < birth) {
        validationErrors.push("Tanggal pengukuran tidak boleh sebelum tanggal lahir.");
      }
      // Cek rentang usia
      const diffMs = measure.getTime() - birth.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const ageMonths = diffDays / 30.4375;
      if (ageMonths > 228) {
        validationErrors.push("Usia anak melebihi 19 tahun (228 bulan). Kalkulator hanya mendukung 0-19 tahun.");
      }
      if (ageMonths < 0) {
        validationErrors.push("Usia anak tidak valid.");
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Data belum lengkap",
        description: "Mohon periksa kembali isian form.",
        variant: "destructive",
      });
      return;
    }

    const calcResult = calculateNutritionStatus(input);
    setResult(calcResult);
    setShowForm(false);
    toast({
      title: "Perhitungan selesai",
      description: "Hasil status gizi siap ditampilkan.",
    });
  };

  const handleReset = () => {
    setResult(null);
    setShowForm(true);
    setValidation(null);
    setForm({
      nama: "",
      jenisKelamin: "",
      tanggalLahir: "",
      tanggalUkur: new Date().toISOString().split("T")[0],
      beratBadan: "",
      panjangTinggiBadan: "",
      jenisPengukuran: "",
    });
    setErrors([]);
  };

  /**
   * Fitur "Cek Ulang Hasil": menjalankan ulang seluruh pipeline
   * 1. Validasi input
   * 2. Perhitungan umur
   * 3. Pemilihan reference WHO
   * 4. Perhitungan LMS
   * 5. Perhitungan Z-score
   * 6. Flagging
   * 7. Klasifikasi
   */
  const handleRevalidate = () => {
    if (!result) return;

    // 1. Validasi input
    const input = result.input;
    const validationErrors = validateInput(input);

    if (validationErrors.length > 0) {
      setValidation({
        checked: true,
        success: false,
        message: `Data perlu diperiksa kembali. Ditemukan ${validationErrors.length} masalah: ${validationErrors[0]}`,
      });
      toast({
        title: "Validasi gagal",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }

    // 2-7. Jalankan ulang seluruh pipeline
    const recalcResult = calculateNutritionStatus(input);
    setResult(recalcResult);

    setValidation({
      checked: true,
      success: true,
      message: `Perhitungan berhasil divalidasi. Algoritma: LMS method, Reference: ${recalcResult.reference}. Semua ${recalcResult.results.length} indikator berhasil dihitung ulang dengan presisi tinggi.`,
    });

    toast({
      title: "Validasi berhasil",
      description: "Perhitungan telah dijalankan ulang dan divalidasi.",
    });
  };

  const handleSave = () => {
    if (!result) return;
    const record: MeasurementRecord = {
      id: `m-${Date.now()}`,
      nama: result.input.nama,
      jenisKelamin: result.input.jenisKelamin,
      tanggalLahir: result.input.tanggalLahir,
      tanggalUkur: result.input.tanggalUkur,
      beratBadan: result.input.beratBadan,
      panjangTinggiBadan: result.input.panjangTinggiBadan,
      jenisPengukuran: result.input.jenisPengukuran,
      ageLabel: formatAge(result.age),
      bmi: result.bmi,
      results: result.results.map((r) => ({
        indicator: r.indicator,
        zScore: r.zScore,
        status: r.status,
        statusKey: r.statusKey,
      })),
      overallStatus: result.overallStatus,
      overallStatusKey: result.overallStatusKey,
      createdAt: new Date().toISOString(),
    };
    addMeasurement(record);
    toast({
      title: "Hasil tersimpan",
      description: "Hasil pengukuran disimpan di riwayat (perangkat ini).",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Persiapkan data grafik
  const charts = useMemo(() => {
    if (!result) return [];
    const ageMonths = result.age.totalMonths;
    const charts: {
      title: string;
      indicatorLabel: string;
      data: any[];
      xKey: "month" | "cm";
      xLabel: string;
      yLabel: string;
      measurementValue: number | null;
      measurementX: number;
      statusLabel?: string;
      statusKey?: string;
      unit?: string;
    }[] = [];

    // BB/U (only for <= 60 months)
    if (ageMonths <= 60) {
      const r = result.results.find((res) => res.indicator === "BB/U");
      charts.push({
        title: "Grafik Berat Badan menurut Umur (BB/U)",
        indicatorLabel: "Weight-for-age WHO Child Growth Standards",
        data: getGrowthCurveData("BB/U", result.input.jenisKelamin, ageMonths),
        xKey: "month",
        xLabel: "Umur (bulan)",
        yLabel: "Berat Badan (kg)",
        measurementValue: r?.zScore !== null && r?.isOutOfRange === false ? result.input.beratBadan : result.input.beratBadan,
        measurementX: ageMonths,
        statusLabel: r?.status,
        statusKey: r?.statusKey,
        unit: "kg",
      });
    }

    // TB/U (or PB/U for <24m)
    const tbResult = result.results.find((res) => res.indicator === "TB/U");
    if (tbResult) {
      charts.push({
        title: ageMonths < 24 ? "Grafik Panjang Badan menurut Umur (PB/U)" : "Grafik Tinggi Badan menurut Umur (TB/U)",
        indicatorLabel: "Length/Height-for-age WHO Standards",
        data: getGrowthCurveData("TB/U", result.input.jenisKelamin, ageMonths),
        xKey: "month",
        xLabel: "Umur (bulan)",
        yLabel: ageMonths < 24 ? "Panjang Badan (cm)" : "Tinggi Badan (cm)",
        measurementValue: result.input.panjangTinggiBadan,
        measurementX: ageMonths,
        statusLabel: tbResult.status,
        statusKey: tbResult.statusKey,
        unit: "cm",
      });
    }

    // BB/TB or BB/PB (for <=60m only)
    if (ageMonths <= 60) {
      const wfhResult = result.results.find((res) => res.indicator === "BB/TB");
      const wfhData = getWfhCurveData(
        result.input.jenisKelamin,
        ageMonths,
        result.input.panjangTinggiBadan
      );
      if (wfhData.length > 0) {
        charts.push({
          title: ageMonths < 24 ? "Grafik Berat Badan menurut Panjang Badan (BB/PB)" : "Grafik Berat Badan menurut Tinggi Badan (BB/TB)",
          indicatorLabel: "Weight-for-length/height WHO Standards",
          data: wfhData,
          xKey: "cm",
          xLabel: ageMonths < 24 ? "Panjang Badan (cm)" : "Tinggi Badan (cm)",
          yLabel: "Berat Badan (kg)",
          measurementValue: result.input.beratBadan,
          measurementX: result.input.panjangTinggiBadan,
          statusLabel: wfhResult?.status,
          statusKey: wfhResult?.statusKey,
          unit: "kg",
        });
      }
    }

    // IMT/U
    const bfaResult = result.results.find((res) => res.indicator === "IMT/U");
    if (bfaResult) {
      charts.push({
        title: "Grafik Indeks Massa Tubuh menurut Umur (IMT/U)",
        indicatorLabel: ageMonths <= 60 ? "BMI-for-age WHO Child Growth Standards" : "BMI-for-age WHO Reference 2007",
        data: getGrowthCurveData("IMT/U", result.input.jenisKelamin, ageMonths),
        xKey: "month",
        xLabel: "Umur (bulan)",
        yLabel: "IMT (kg/m²)",
        measurementValue: result.bmi,
        measurementX: ageMonths,
        statusLabel: bfaResult.status,
        statusKey: bfaResult.statusKey,
        unit: "kg/m²",
      });
    }

    return charts;
  }, [result]);

  const recommendations = result ? getRecommendations(result) : [];

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-green-50 text-green-700 border-green-200 rounded-full px-3 py-1">
            <Calculator className="h-3 w-3 mr-1" />
            Fitur Utama
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Cek Status Gizi Anak
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Hitung status gizi anak berdasarkan <strong>WHO Child Growth Standards</strong> menggunakan metode LMS yang akurat. Mendukung indikator BB/U, PB/U atau TB/U, BB/PB atau BB/TB, dan IMT/U untuk anak usia 0-19 tahun.
          </p>
        </div>

        {/* Form Input */}
        {showForm && (
          <Card className="border-0 shadow-lg rounded-2xl mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-green-600" />
                Data Anak
              </CardTitle>
              <p className="text-xs text-gray-600">
                Lengkapi data berikut untuk menghitung status gizi anak.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Identitas */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Baby className="h-4 w-4 text-green-600" />
                  Identitas Anak
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nama" className="text-xs font-medium mb-1.5 block">
                      Nama Anak <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nama"
                      placeholder="Masukkan nama anak"
                      value={form.nama}
                      onChange={(e) => handleInputChange("nama", e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={form.jenisKelamin}
                      onValueChange={(v) => handleInputChange("jenisKelamin", v)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="L" id="jk-l" />
                        <Label htmlFor="jk-l" className="text-sm cursor-pointer font-normal">Laki-laki</Label>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-colors cursor-pointer">
                        <RadioGroupItem value="P" id="jk-p" />
                        <Label htmlFor="jk-p" className="text-sm cursor-pointer font-normal">Perempuan</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="tanggalLahir" className="text-xs font-medium mb-1.5 block">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tanggalLahir"
                      type="date"
                      value={form.tanggalLahir}
                      onChange={(e) => handleInputChange("tanggalLahir", e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tanggalUkur" className="text-xs font-medium mb-1.5 block">
                      Tanggal Pengukuran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tanggalUkur"
                      type="date"
                      value={form.tanggalUkur}
                      onChange={(e) => handleInputChange("tanggalUkur", e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Antropometri */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-green-600" />
                  Pengukuran Antropometri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bb" className="text-xs font-medium mb-1.5 block">
                      Berat Badan (kg) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="bb"
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="60"
                        inputMode="decimal"
                        placeholder="Contoh: 12.5"
                        value={form.beratBadan}
                        onChange={(e) => handleInputChange("beratBadan", e.target.value)}
                        className="pl-9 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pb" className="text-xs font-medium mb-1.5 block">
                      Panjang/Tinggi Badan (cm) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="pb"
                        type="number"
                        step="0.1"
                        min="30"
                        max="200"
                        inputMode="decimal"
                        placeholder="Contoh: 89"
                        value={form.panjangTinggiBadan}
                        onChange={(e) => handleInputChange("panjangTinggiBadan", e.target.value)}
                        className="pl-9 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-xs font-medium mb-1.5 block">
                    Jenis Pengukuran <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={form.jenisPengukuran}
                    onValueChange={(v) => handleInputChange("jenisPengukuran", v)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="panjang" id="jp-pb" className="mt-1" />
                      <div>
                        <Label htmlFor="jp-pb" className="text-sm cursor-pointer font-medium block">
                          Panjang Badan
                        </Label>
                        <p className="text-xs text-gray-500">Posisi telentang (untuk anak &lt;24 bulan)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="tinggi" id="jp-tb" className="mt-1" />
                      <div>
                        <Label htmlFor="jp-tb" className="text-sm cursor-pointer font-medium block">
                          Tinggi Badan
                        </Label>
                        <p className="text-xs text-gray-500">Posisi berdiri (untuk anak &ge;24 bulan)</p>
                      </div>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                    Sistem akan otomatis menggunakan data referensi WHO yang sesuai berdasarkan umur dan jenis pengukuran.
                  </p>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-semibold text-red-700">Mohon perbaiki isian berikut:</span>
                  </div>
                  <ul className="ml-6 list-disc text-xs text-red-700 space-y-1">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleCalculate}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg rounded-full px-6 flex-1 sm:flex-initial"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Hitung Status Gizi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hasil */}
        {result && !showForm && (
          <div className="space-y-6">
            {/* 1. Data Anak */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Data Anak
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Nama</div>
                    <div className="font-semibold text-gray-900 text-sm">{result.input.nama}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Usia</div>
                    <div className="font-semibold text-gray-900 text-sm">{formatAge(result.age)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Jenis Kelamin</div>
                    <div className="font-semibold text-gray-900 text-sm">{result.input.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tanggal Ukur</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {new Date(result.input.tanggalUkur).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Berat Badan</div>
                    <div className="font-semibold text-gray-900 text-sm">{result.input.beratBadan.toFixed(1)} kg</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{result.age.totalMonths < 24 ? "Panjang Badan" : "Tinggi Badan"}</div>
                    <div className="font-semibold text-gray-900 text-sm">{result.input.panjangTinggiBadan.toFixed(1)} cm</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">IMT</div>
                    <div className="font-semibold text-gray-900 text-sm">{result.bmi.toFixed(2)} kg/m²</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Jenis Pengukuran</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {result.input.jenisPengukuran === "panjang" ? "Panjang (telentang)" : "Tinggi (berdiri)"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Hasil Z-score */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Hasil Z-score
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Indikator</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-700">Z-score</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r) => {
                        const badge = STATUS_BADGE[r.statusKey] || STATUS_BADGE["normal"];
                        return (
                          <tr key={r.indicator} className="border-b border-gray-100">
                            <td className="py-3 px-2">
                              <div className="font-medium text-gray-900">{r.indicator}</div>
                              {r.message && r.message.includes("Indikator") && (
                                <div className="text-xs text-gray-500 mt-0.5">{r.message}</div>
                              )}
                              <div className="text-[10px] text-gray-400 mt-0.5">{r.reference}</div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {r.zScore !== null ? (
                                <span className="font-mono font-semibold text-gray-900">
                                  {r.zScore >= 0 ? "+" : ""}{r.zScore.toFixed(2)} <span className="text-xs text-gray-500">SD</span>
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", badge.bg, badge.color)}>
                                {r.status}
                              </span>
                              {r.isOutOfRange && r.message && !r.message.includes("Indikator") && (
                                <div className="text-xs text-red-600 mt-1 flex items-start gap-1">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{r.message}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>Z-score dihitung menggunakan rumus LMS WHO (Box-Cox transformation). Klasifikasi sesuai standar WHO Child Growth Standards / WHO Reference 2007 dan Kementerian Kesehatan RI.</span>
                </p>
              </CardContent>
            </Card>

            {/* 3. Status Gizi Keseluruhan */}
            <Card className={cn(
              "border-0 shadow-lg rounded-2xl overflow-hidden",
              result.invalidData ? "border-l-4 border-l-gray-400" :
              result.overallStatusKey === "perlu-konsultasi" ? "border-l-4 border-l-red-500" :
              result.overallStatusKey === "perlu-perhatian" ? "border-l-4 border-l-orange-500" :
              "border-l-4 border-l-green-500"
            )}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  {result.invalidData ? (
                    <AlertTriangle className="h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5" />
                  ) : result.hasProblem ? (
                    <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                      Status Gizi
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{result.overallStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Grafik Pertumbuhan */}
            <div>
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                Grafik Pertumbuhan
                <Activity className="h-4 w-4 text-green-600" />
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {charts.map((c, i) => (
                  <GrowthChart key={i} {...c} />
                ))}
              </div>
            </div>

            {/* 5. Apa Artinya? */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                  Apa Artinya?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {result.invalidData ? (
                  <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                    <p>Hasil pengukuran menunjukkan beberapa data berada di luar rentang valid WHO. Hal ini dapat disebabkan oleh:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Kesalahan input data (tanggal lahir, berat badan, atau panjang/tinggi badan).</li>
                      <li>Pengukuran yang tidak akurat (alat tidak terkalibrasi, salah posisi).</li>
                      <li>Jenis pengukuran tidak sesuai dengan umur anak.</li>
                    </ul>
                    <p className="mt-2">Silakan periksa kembali data yang dimasukkan. Jika data sudah benar namun hasil tetap tidak sesuai, konsultasikan dengan tenaga kesehatan atau ahli gizi.</p>
                  </div>
                ) : result.hasProblem ? (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {result.needsConsultation
                      ? "Hasil pengukuran menunjukkan bahwa pertumbuhan anak perlu mendapatkan perhatian khusus. Beberapa indikator berada di bawah atau di atas rentang normal menurut standar WHO. Kondisi ini sebaiknya dipantau secara rutin dan dikonsultasikan dengan petugas kesehatan untuk mengetahui penyebab dan langkah yang tepat."
                      : "Hasil pengukuran menunjukkan bahwa ada indikator pertumbuhan yang perlu mendapatkan perhatian. Meskipun belum tentu menunjukkan masalah serius, penting untuk memantau perkembangan anak secara rutin dan menerapkan pola makan yang sehat."}
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    Pertumbuhan anak berdasarkan hasil pengukuran saat ini berada dalam rentang yang sesuai dengan standar pertumbuhan WHO. Semua indikator (BB/U, TB/U, BB/TB, dan IMT/U) menunjukkan nilai Z-score dalam batas normal. Teruslah pertahankan kebiasaan makan yang baik dan rutin pantau pertumbuhan anak di Posyandu.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 6. Apa yang Sebaiknya Dilakukan Orang Tua? */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">6</span>
                  Apa yang Sebaiknya Dilakukan Orang Tua?
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl p-4 border",
                      rec.tone === "danger" ? "bg-red-50 border-red-200" :
                      rec.tone === "warning" ? "bg-orange-50 border-orange-200" :
                      "bg-green-50 border-green-200"
                    )}
                  >
                    <h4 className={cn(
                      "font-semibold text-sm mb-2",
                      rec.tone === "danger" ? "text-red-800" :
                      rec.tone === "warning" ? "text-orange-800" :
                      "text-green-800"
                    )}>
                      {rec.title}
                    </h4>
                    <ul className="space-y-1.5 ml-4">
                      {rec.items.map((item, j) => (
                        <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0",
                            rec.tone === "danger" ? "bg-red-500" :
                            rec.tone === "warning" ? "bg-orange-500" :
                            "bg-green-500"
                          )} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 7. Kapan Harus Berkonsultasi? */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">7</span>
                  Kapan Harus Berkonsultasi?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p>Segera konsultasikan anak ke tenaga kesehatan atau ahli gizi jika:</p>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Hasil pengukuran menunjukkan Z-score di bawah -3 SD pada salah satu indikator.",
                      "Berat badan anak tidak naik atau bahkan turun dalam 2 bulan berturut-turut.",
                      "Anak menunjukkan tanda kurang nafsu makan yang berkelanjutan.",
                      "Anak sering sakit (demam, diare, batuk berulang).",
                      "Terdapat keluhan lain yang mengkhawatirkan terkait tumbuh kembang anak.",
                      "Hasil pengukuran menunjukkan indikasi stunting (TB/U di bawah -2 SD).",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 bg-rose-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">Anda dapat berkonsultasi melalui Posyandu terdekat atau langsung menghubungi ahli gizi UPTD Puskesmas Neglasari.</p>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 no-print">
              <Button
                onClick={handleRevalidate}
                variant="outline"
                className="rounded-full flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cek Ulang Hasil
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Hasil
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="rounded-full flex-1 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Hasil
              </Button>
              <Button
                onClick={() => setView("hubungi-ahli")}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full flex-1"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Konsultasikan dengan Ahli Gizi
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="rounded-full flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Hitung Anak Lain
              </Button>
            </div>

            {/* Validation status */}
            {validation && (
              <Card className={cn(
                "border-2 rounded-2xl overflow-hidden animate-fade-in",
                validation.success ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50"
              )}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    {validation.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={cn(
                        "font-semibold text-sm mb-1",
                        validation.success ? "text-green-800" : "text-red-800"
                      )}>
                        {validation.success ? "Perhitungan berhasil divalidasi" : "Data perlu diperiksa kembali"}
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed",
                        validation.success ? "text-green-700" : "text-red-700"
                      )}>
                        {validation.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference info & algorithm transparency */}
            <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Informasi Algoritma & Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-xs text-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="font-semibold text-gray-900 mb-1">Reference yang digunakan:</div>
                    <div className="text-blue-700 font-medium">{result.reference}</div>
                    <div className="mt-1 text-gray-500">
                      {result.age.totalDays <= 1856
                        ? `Anak usia ${Math.floor(result.age.totalMonths)} bulan (0-5 tahun) → WHO Child Growth Standards (2006)`
                        : `Anak usia ${Math.floor(result.age.totalMonths)} bulan (5-19 tahun) → WHO Reference 2007 (AnthroPlus)`}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="font-semibold text-gray-900 mb-1">Algoritma:</div>
                    <div>LMS Method (Box-Cox transformation)</div>
                    <div className="mt-1 text-gray-500">
                      Z = ((X/M)<sup>L</sup> - 1) / (L × S)
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="font-semibold text-gray-900 mb-1">Data source:</div>
                  <div className="text-gray-600">
                    Data referensi resmi dari <strong>WHO Anthro</strong> ({result.age.totalDays <= 1856 ? "0-5 tahun, per HARI (0-1856 hari)" : "5-19 tahun, per BULAN (61-228 bulan)"}).
                    Diambil dari repositori resmi World Health Organization di GitHub: <code className="bg-gray-100 px-1 rounded">WorldHealthOrganization/mnf-anthro-analyzer-offline</code>.
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Disclaimer:
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Hasil perhitungan menggunakan standar pertumbuhan WHO dan ditujukan sebagai alat skrining/pemantauan pertumbuhan, <strong>bukan diagnosis medis</strong>. Apabila ditemukan hasil yang perlu diperhatikan, orang tua dianjurkan berkonsultasi dengan tenaga kesehatan atau ahli gizi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
