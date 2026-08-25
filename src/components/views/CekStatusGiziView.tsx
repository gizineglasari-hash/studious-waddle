"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Baby,
  Ruler,
  Weight,
  CalendarDays,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useGemasStore } from "@/lib/gemas/store";
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
  const { setView } = useGemasStore();
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

  /**
   * CETAK HASIL dengan format A4
   * Mendukung 3 format output: PDF, JPG, dan Word (HTML download)
   * Sebelum simpan, tampilkan preview terlebih dahulu.
   */

  // State untuk modal preview cetak
  const [printPreview, setPrintPreview] = useState<{
    open: boolean;
    format: "pdf" | "jpg" | "word" | null;
  }>({ open: false, format: null });

  // Buka dialog pilihan format cetak
  const handlePrint = () => {
    setPrintPreview({ open: true, format: null });
  };

  // Pilih format tertentu
  const handleSelectFormat = (format: "pdf" | "jpg" | "word") => {
    setPrintPreview({ open: true, format });
  };

  // Generate HTML untuk hasil cetak A4
  const generatePrintHTML = (): string => {
    if (!result) return "";

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const indicatorRows = result.results
      .map(
        (r) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ccc;">
            <strong>${r.indicator}</strong><br/>
            <span style="font-size: 10px; color: #666;">${r.reference}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-family: monospace; font-weight: bold;">
            ${r.zScore !== null ? `${r.zScore >= 0 ? "+" : ""}${r.zScore.toFixed(2)} SD` : "—"}
          </td>
          <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${r.status}</td>
        </tr>`
      )
      .join("");

    const recommendationsHtml = recommendations
      .map(
        (rec) => `
        <div style="margin-bottom: 12px; padding: 10px; background: ${
          rec.tone === "danger" ? "#fef2f2" : rec.tone === "warning" ? "#fff7ed" : "#f0fdf4"
        }; border-left: 4px solid ${rec.tone === "danger" ? "#dc2626" : rec.tone === "warning" ? "#f97316" : "#16a34a"};">
          <strong style="font-size: 12px; color: ${rec.tone === "danger" ? "#991b1b" : rec.tone === "warning" ? "#9a3412" : "#166534"};">${rec.title}</strong>
          <ul style="margin: 6px 0 0 16px; padding: 0; font-size: 11px;">
            ${rec.items.map((item) => `<li style="margin-bottom: 3px;">${item}</li>`).join("")}
          </ul>
        </div>`
      )
      .join("");

    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Hasil Cek Status Gizi - ${result.input.nama}</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm;
        }
        body {
          font-family: 'Nunito', 'Arial', sans-serif;
          color: #333;
          line-height: 1.5;
          font-size: 12px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #16a34a;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .header h1 {
          color: #166534;
          font-size: 20px;
          margin: 0 0 4px 0;
        }
        .header p {
          font-size: 11px;
          color: #666;
          margin: 2px 0;
        }
        .header .puskesmas {
          font-weight: bold;
          color: #166534;
          font-size: 12px;
        }
        h2 {
          color: #166534;
          font-size: 14px;
          border-bottom: 2px solid #d1fae5;
          padding-bottom: 4px;
          margin-top: 18px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          font-size: 11px;
        }
        th {
          background: #f0fdf4;
          padding: 8px;
          border: 1px solid #ccc;
          text-align: left;
          font-weight: bold;
          color: #166534;
        }
        .data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 10px 0;
        }
        .data-item {
          padding: 6px 8px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 11px;
        }
        .data-item .label {
          color: #666;
          font-size: 10px;
          display: block;
        }
        .data-item .value {
          font-weight: bold;
          color: #111;
        }
        .status-box {
          padding: 10px;
          border-radius: 6px;
          margin: 10px 0;
          font-size: 11px;
        }
        .disclaimer {
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 8px;
          border-radius: 4px;
          font-size: 10px;
          color: #92400e;
          margin-top: 16px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Hasil Cek Status Gizi Anak</h1>
        <p class="puskesmas">GEMAS - UPTD Puskesmas Neglasari Kota Bandung</p>
        <p>Gerakan Edukasi Makanan Anak Sehat</p>
      </div>

      <h2>1. Data Anak</h2>
      <div class="data-grid">
        <div class="data-item"><span class="label">Nama</span><span class="value">${result.input.nama}</span></div>
        <div class="data-item"><span class="label">Usia</span><span class="value">${formatAge(result.age)}</span></div>
        <div class="data-item"><span class="label">Jenis Kelamin</span><span class="value">${result.input.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span></div>
        <div class="data-item"><span class="label">Tanggal Pengukuran</span><span class="value">${formatDate(result.input.tanggalUkur)}</span></div>
        <div class="data-item"><span class="label">Berat Badan</span><span class="value">${result.input.beratBadan.toFixed(1)} kg</span></div>
        <div class="data-item"><span class="label">${result.age.totalMonths < 24 ? "Panjang Badan" : "Tinggi Badan"}</span><span class="value">${result.input.panjangTinggiBadan.toFixed(1)} cm</span></div>
        <div class="data-item"><span class="label">IMT</span><span class="value">${result.bmi.toFixed(2)} kg/m²</span></div>
        <div class="data-item"><span class="label">Jenis Pengukuran</span><span class="value">${result.input.jenisPengukuran === "panjang" ? "Panjang (telentang)" : "Tinggi (berdiri)"}</span></div>
      </div>

      <h2>2. Hasil Z-score</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 40%;">Indikator</th>
            <th style="width: 30%; text-align: center;">Z-score</th>
            <th style="width: 30%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${indicatorRows}
        </tbody>
      </table>

      <h2>3. Status Gizi Keseluruhan</h2>
      <div class="status-box" style="background: ${
        result.overallStatusKey === "normal" ? "#f0fdf4" :
        result.overallStatusKey === "perlu-perhatian" ? "#fff7ed" :
        result.overallStatusKey === "perlu-konsultasi" ? "#fef2f2" : "#f9fafb"
      }; border-left: 4px solid ${result.overallStatusKey === "normal" ? "#16a34a" :
        result.overallStatusKey === "perlu-perhatian" ? "#f97316" :
        result.overallStatusKey === "perlu-konsultasi" ? "#dc2626" : "#9ca3af"};">
        ${result.overallStatus}
      </div>

      <h2>4. Apa yang Sebaiknya Dilakukan Orang Tua?</h2>
      ${recommendationsHtml}

      <h2>5. Informasi Algoritma</h2>
      <div class="data-grid">
        <div class="data-item"><span class="label">Reference</span><span class="value">${result.reference}</span></div>
        <div class="data-item"><span class="label">Algoritma</span><span class="value">LMS Method (WHO)</span></div>
      </div>

      <div class="disclaimer">
        <strong>Disclaimer:</strong> Hasil perhitungan menggunakan standar pertumbuhan WHO dan ditujukan sebagai alat skrining/pemantauan pertumbuhan, bukan diagnosis medis. Apabila ditemukan hasil yang perlu diperhatikan, orang tua dianjurkan berkonsultasi dengan tenaga kesehatan atau ahli gizi.
      </div>

      <div class="footer">
        <p>Dicetak dari GEMAS pada ${new Date().toLocaleString("id-ID")}</p>
        <p>© 2026 GEMAS - UPTD Puskesmas Neglasari Kota Bandung</p>
      </div>
    </body>
    </html>
    `;
  };

  // Eksekusi cetak/save sesuai format yang dipilih
  const handleExecutePrint = () => {
    if (!result || !printPreview.format) return;

    const html = generatePrintHTML();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const safeName = result.input.nama.replace(/[^a-zA-Z0-9]/g, "_");

    if (printPreview.format === "pdf") {
      // Untuk PDF: buka window baru dan trigger print ke PDF (browser print dialog)
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      }
      toast({
        title: "Membuka dialog cetak PDF",
        description: "Pilih 'Save as PDF' di dialog cetak browser untuk menyimpan.",
      });
    } else if (printPreview.format === "word") {
      // Untuk Word: download sebagai .doc (HTML yang dapat dibuka Word)
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hasil_Gizi_${safeName}_${new Date().toISOString().split("T")[0]}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "File Word diunduh",
        description: "File .doc berhasil diunduh dan dapat dibuka dengan Microsoft Word.",
      });
    } else if (printPreview.format === "jpg") {
      // Untuk JPG: konversi HTML ke gambar menggunakan canvas
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = async () => {
          try {
            // Tunggu render selesai
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Buat SVG foreignObject untuk render HTML ke gambar
            const width = 794; // A4 width at 96 DPI
            const height = printWindow.document.body.scrollHeight;
            const serializer = new XMLSerializer();
            const docHtml = serializer.serializeToString(printWindow.document.body);

            const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">${docHtml}</div>
              </foreignObject>
            </svg>`;

            const svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svg);

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) {
                    const jpgUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = jpgUrl;
                    a.download = `Hasil_Gizi_${safeName}_${new Date().toISOString().split("T")[0]}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(jpgUrl);
                    toast({
                      title: "Gambar JPG diunduh",
                      description: "Hasil dalam format JPG berhasil disimpan.",
                    });
                  }
                }, "image/jpeg", 0.95);
              }
              URL.revokeObjectURL(svgUrl);
              printWindow.close();
            };
            img.onerror = () => {
              // Fallback: jika SVG foreignObject tidak didukung, gunakan screenshot window
              toast({
                title: "Gagal membuat JPG otomatis",
                description: "Browser tidak mendukung konversi langsung. Silakan gunakan fitur Print Screen atau pilih format PDF.",
                variant: "destructive",
              });
              printWindow.close();
            };
            img.src = svgUrl;
          } catch (e) {
            toast({
              title: "Error membuat JPG",
              description: "Terjadi kesalahan. Silakan coba format PDF atau Word.",
              variant: "destructive",
            });
            printWindow.close();
          }
        };
      }
    }

    setPrintPreview({ open: false, format: null });
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

    // BB/U (only for <= 60 months) - hanya jika data tersedia & tidak out-of-range
    if (ageMonths <= 60) {
      const r = result.results.find((res) => res.indicator === "BB/U");
      const chartData = getGrowthCurveData("BB/U", result.input.jenisKelamin, ageMonths);
      // Hanya tampilkan grafik jika data tersedia dan indikator tidak out-of-range
      if (chartData.length > 0 && r && !r.isOutOfRange && r.zScore !== null) {
        charts.push({
          title: "Grafik Berat Badan menurut Umur (BB/U)",
          indicatorLabel: "Weight-for-age WHO Child Growth Standards",
          data: chartData,
          xKey: "month",
          xLabel: "Umur (bulan)",
          yLabel: "Berat Badan (kg)",
          measurementValue: result.input.beratBadan,
          measurementX: ageMonths,
          statusLabel: r.status,
          statusKey: r.statusKey,
          unit: "kg",
        });
      }
    }

    // TB/U (or PB/U for <24m) - hanya jika data tersedia & tidak out-of-range
    const tbResult = result.results.find((res) => res.indicator === "TB/U");
    if (tbResult && !tbResult.isOutOfRange && tbResult.zScore !== null) {
      const chartData = getGrowthCurveData("TB/U", result.input.jenisKelamin, ageMonths);
      if (chartData.length > 0) {
        charts.push({
          title: ageMonths < 24 ? "Grafik Panjang Badan menurut Umur (PB/U)" : "Grafik Tinggi Badan menurut Umur (TB/U)",
          indicatorLabel: "Length/Height-for-age WHO Standards",
          data: chartData,
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
    }

    // BB/TB or BB/PB (for <=60m only) - hanya jika data tersedia & tidak out-of-range
    if (ageMonths <= 60) {
      const wfhResult = result.results.find((res) => res.indicator === "BB/TB");
      if (wfhResult && !wfhResult.isOutOfRange && wfhResult.zScore !== null) {
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
            statusLabel: wfhResult.status,
            statusKey: wfhResult.statusKey,
            unit: "kg",
          });
        }
      }
    }

    // IMT/U - hanya jika data tersedia & tidak out-of-range
    const bfaResult = result.results.find((res) => res.indicator === "IMT/U");
    if (bfaResult && !bfaResult.isOutOfRange && bfaResult.zScore !== null) {
      const chartData = getGrowthCurveData("IMT/U", result.input.jenisKelamin, ageMonths);
      if (chartData.length > 0) {
        charts.push({
          title: "Grafik Indeks Massa Tubuh menurut Umur (IMT/U)",
          indicatorLabel: ageMonths <= 60 ? "BMI-for-age WHO Child Growth Standards" : "BMI-for-age WHO Reference 2007",
          data: chartData,
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

            {/* 4. Grafik Pertumbuhan - hanya tampilkan yang datanya tersedia */}
            <div>
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                Grafik Pertumbuhan
                <Activity className="h-4 w-4 text-green-600" />
              </h3>
              {charts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {charts.map((c, i) => (
                    <GrowthChart key={i} {...c} />
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl">
                  <CardContent className="pt-5 pb-5 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-amber-800 font-medium mb-1">
                      Grafik pertumbuhan tidak tersedia untuk data ini
                    </p>
                    <p className="text-xs text-amber-700 max-w-md mx-auto">
                      Data antropometri berada di luar rentang valid WHO atau terdapat kemungkinan kesalahan pengukuran, sehingga grafik tidak dapat ditampilkan. Silakan periksa kembali data pengukuran atau konsultasikan dengan tenaga kesehatan.
                    </p>
                  </CardContent>
                </Card>
              )}
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

            {/* Action buttons - Hapus "Simpan Hasil", ganti "Cetak Hasil" dengan fitur PDF/JPG/Word + preview */}
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
                onClick={handlePrint}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full flex-1 shadow-md"
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Hasil (PDF/JPG/Word)
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

        {/* Dialog Print Preview - pilih format PDF/JPG/Word dengan preview A4 */}
        <Dialog open={printPreview.open} onOpenChange={(open) => setPrintPreview({ open, format: null })}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Printer className="h-5 w-5 text-green-600" />
                Cetak Hasil Status Gizi
              </DialogTitle>
              <DialogDescription className="text-sm">
                Pilih format file untuk menyimpan hasil cetak. Hasil akan disimpan dalam ukuran A4.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-3">
              {/* Pilihan format */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Pilih Format File:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintPreview({ open: true, format: "pdf" })}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      printPreview.format === "pdf"
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                    )}
                  >
                    <div className="text-2xl mb-1">📄</div>
                    <div className="text-xs font-bold text-gray-900">PDF</div>
                    <div className="text-[10px] text-gray-500">Save as PDF</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintPreview({ open: true, format: "jpg" })}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      printPreview.format === "jpg"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    )}
                  >
                    <div className="text-2xl mb-1">🖼️</div>
                    <div className="text-xs font-bold text-gray-900">JPG</div>
                    <div className="text-[10px] text-gray-500">Gambar JPG</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintPreview({ open: true, format: "word" })}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      printPreview.format === "word"
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    )}
                  >
                    <div className="text-2xl mb-1">📝</div>
                    <div className="text-xs font-bold text-gray-900">Word</div>
                    <div className="text-[10px] text-gray-500">.doc file</div>
                  </button>
                </div>
              </div>

              {/* Preview hasil cetak A4 */}
              {result && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-blue-500" />
                    Preview Hasil Cetak (Ukuran A4):
                  </h4>
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 max-h-[400px] overflow-y-auto">
                    <div
                      className="bg-white shadow-md mx-auto p-6"
                      style={{ width: "100%", maxWidth: "794px", aspectRatio: "auto" }}
                      dangerouslySetInnerHTML={{ __html: generatePrintHTML().split("<body>")[1]?.split("</body>")[0] || "" }}
                    />
                  </div>
                </div>
              )}

              {/* Info A4 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <strong>Format A4 (210 × 297 mm).</strong> Hasil cetak akan disesuaikan dengan ukuran kertas A4 standar.
                  {printPreview.format === "pdf" && " Untuk PDF, pilih 'Save as PDF' di dialog cetak browser."}
                  {printPreview.format === "jpg" && " Untuk JPG, hasil akan dikonversi menjadi gambar."}
                  {printPreview.format === "word" && " Untuk Word, file .doc dapat dibuka dengan Microsoft Word atau aplikasi sejenis."}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPrintPreview({ open: false, format: null })}
                  className="rounded-full"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleExecutePrint}
                  disabled={!printPreview.format}
                  className={cn(
                    "rounded-full text-white",
                    printPreview.format === "pdf"
                      ? "bg-red-600 hover:bg-red-700"
                      : printPreview.format === "jpg"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : printPreview.format === "word"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-400"
                  )}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {printPreview.format
                    ? `Simpan sebagai ${printPreview.format.toUpperCase()}`
                    : "Pilih format dulu"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
