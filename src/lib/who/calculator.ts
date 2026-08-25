/**
 * WHO Child Growth Standards - Calculator (LMS method)
 *
 * Mengimplementasikan algoritma WHO LMS untuk perhitungan Z-score yang akurat
 * sesuai dengan WHO Anthro / WHO AnthroPlus.
 *
 * Rumus LMS:
 *   Jika L != 0: Z = ((X/M)^L - 1) / (L * S)
 *   Jika L = 0:  Z = ln(X/M) / S
 *
 * Sumber referensi:
 *  - WHO Child Growth Standards (2006) untuk 0-60 bulan
 *  - WHO Growth Reference 2007 untuk 61-228 bulan
 *  - WHO Anthro v3.2.2 (software resmi WHO)
 *  - WHO AnthroPlus v1.0.4
 *
 * URL:
 *  - https://www.who.int/tools/child-growth-standards
 *  - https://www.who.int/tools/growth-reference-data-for-5to19-years
 */

import {
  WFA_BOYS,
  WFA_GIRLS,
  type LmsPoint,
} from "./wfa-data";
import {
  LFA_BOYS,
  HFA_BOYS,
  LFA_GIRLS,
  HFA_GIRLS,
} from "./lhfa-data";
import {
  WFL_BOYS,
  WFH_BOYS,
  WFL_GIRLS,
  WFH_GIRLS,
  type LmsHeightPoint,
} from "./wfh-data";
import { BFA_BOYS, BFA_GIRLS } from "./bfa-data";
import {
  HFA_BOYS_5_19,
  HFA_GIRLS_5_19,
  BFA_BOYS_5_19,
  BFA_GIRLS_5_19,
} from "./ref519-data";

export type Sex = "L" | "P";
export type MeasurementType = "panjang" | "tinggi";
export type IndicatorKey = "BB/U" | "TB/U" | "BB/TB" | "IMT/U";

export interface ChildInput {
  nama: string;
  jenisKelamin: Sex;
  tanggalLahir: string; // ISO date string YYYY-MM-DD
  tanggalUkur: string; // ISO date string YYYY-MM-DD
  beratBadan: number; // kg
  panjangTinggiBadan: number; // cm
  jenisPengukuran: MeasurementType; // panjang (recumbent) atau tinggi (standing)
}

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number; // decimal months for WHO computation
}

export interface IndicatorResult {
  indicator: IndicatorKey;
  zScore: number | null;
  status: string;
  statusKey: "sangat-kurang" | "kurang" | "normal" | "berlebih" | "risiko" | "sangat-pendek" | "pendek" | "tinggi" | "sangat-kurus" | "kurus" | "gemuk" | "tidak-valid";
  medianValue: number | null;
  isOutOfRange: boolean;
  message?: string;
}

export interface CalcResult {
  input: ChildInput;
  age: AgeBreakdown;
  bmi: number; // calculated BMI
  results: IndicatorResult[];
  overallStatus: string;
  overallStatusKey: string;
  hasProblem: boolean;
  needsConsultation: boolean;
  warnings: string[];
  invalidData: boolean;
}

/** Days per month for WHO age calculation (WHO Anthro uses 30.4375) */
const DAYS_PER_MONTH = 30.4375;

/**
 * Menghitung selisih hari antara dua tanggal.
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / msPerDay);
}

/**
 * Menghitung umur anak pada tanggal pengukuran (tahun-bulan-hari).
 * Sama seperti perhitungan WHO Anthro.
 */
export function calculateAge(birthDate: string, measureDate: string): AgeBreakdown {
  const birth = new Date(birthDate);
  const measure = new Date(measureDate);

  let years = measure.getFullYear() - birth.getFullYear();
  let months = measure.getMonth() - birth.getMonth();
  let days = measure.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // days in previous month relative to measureDate
    const prevMonth = new Date(measure.getFullYear(), measure.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = daysBetween(birth, measure);
  const totalMonths = totalDays / DAYS_PER_MONTH;

  return { years, months, days, totalDays, totalMonths };
}

/**
 * Format usia ke string Indonesia "X tahun Y bulan Z hari"
 */
export function formatAge(age: AgeBreakdown): string {
  const parts: string[] = [];
  if (age.years > 0) parts.push(`${age.years} tahun`);
  if (age.months > 0) parts.push(`${age.months} bulan`);
  if (age.days > 0 || parts.length === 0) parts.push(`${age.days} hari`);
  return parts.join(" ");
}

/**
 * Interpolasi linear antara dua titik LMS berdasarkan umur dalam bulan.
 */
function interpolateAgeLms(data: LmsPoint[], ageMonths: number): {
  L: number;
  M: number;
  S: number;
} | null {
  if (data.length === 0) return null;

  // Jika di luar rentang, return null
  if (ageMonths < data[0].month || ageMonths > data[data.length - 1].month) {
    return null;
  }

  // Binary search untuk menemukan titik terdekat
  let low = 0;
  let high = data.length - 1;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (data[mid].month <= ageMonths) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const p1 = data[low];
  const p2 = data[high];

  // Jika exact match
  if (ageMonths === p1.month) {
    return { L: p1.L, M: p1.M, S: p1.S };
  }
  if (ageMonths === p2.month) {
    return { L: p2.L, M: p2.M, S: p2.S };
  }

  // Interpolasi linear
  const t = (ageMonths - p1.month) / (p2.month - p1.month);
  return {
    L: p1.L + (p2.L - p1.L) * t,
    M: p1.M + (p2.M - p1.M) * t,
    S: p1.S + (p2.S - p1.S) * t,
  };
}

/**
 * Interpolasi linear antara dua titik LMS berdasarkan panjang/tinggi badan (cm).
 */
function interpolateHeightLms(
  data: LmsHeightPoint[],
  height: number
): { L: number; M: number; S: number } | null {
  if (data.length === 0) return null;
  if (height < data[0].cm || height > data[data.length - 1].cm) {
    return null;
  }

  let low = 0;
  let high = data.length - 1;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (data[mid].cm <= height) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const p1 = data[low];
  const p2 = data[high];

  if (height === p1.cm) return { L: p1.L, M: p1.M, S: p1.S };
  if (height === p2.cm) return { L: p2.L, M: p2.M, S: p2.S };

  const t = (height - p1.cm) / (p2.cm - p1.cm);
  return {
    L: p1.L + (p2.L - p1.L) * t,
    M: p1.M + (p2.M - p1.M) * t,
    S: p1.S + (p2.S - p1.S) * t,
  };
}

/**
 * Menghitung Z-score menggunakan rumus LMS WHO.
 *
 * Z = ((X/M)^L - 1) / (L * S)   jika L != 0
 * Z = ln(X/M) / S                jika L = 0
 *
 * @param X nilai pengukuran (berat/tinggi/BMI)
 * @param L Box-Cox power
 * @param M median
 * @param S koefisien variasi
 * @returns Z-score (presisi tinggi, tanpa pembulatan)
 */
export function computeZScore(X: number, L: number, M: number, S: number): number {
  if (X <= 0 || M <= 0 || S <= 0) {
    return NaN;
  }
  if (Math.abs(L) < 1e-10) {
    // L = 0: log transform
    return Math.log(X / M) / S;
  }
  // L != 0
  const ratio = X / M;
  const powered = Math.pow(ratio, L);
  return (powered - 1) / (L * S);
}

/**
 * Menghitung nilai pengukuran dari Z-score (invers LMS) - berguna untuk grafik.
 * X = M * (1 + L*S*Z)^(1/L)  jika L != 0
 * X = M * exp(S*Z)            jika L = 0
 */
export function valueFromZScore(Z: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 1e-10) {
    return M * Math.exp(S * Z);
  }
  const inner = 1 + L * S * Z;
  if (inner <= 0) return NaN;
  return M * Math.pow(inner, 1 / L);
}

/**
 * Validasi input anak.
 * Mengembalikan array pesan error jika ada.
 */
export function validateInput(input: ChildInput): string[] {
  const errors: string[] = [];

  if (!input.nama || input.nama.trim().length === 0) {
    errors.push("Nama anak tidak boleh kosong.");
  }
  if (input.jenisKelamin !== "L" && input.jenisKelamin !== "P") {
    errors.push("Jenis kelamin wajib dipilih.");
  }
  if (!input.tanggalLahir) {
    errors.push("Tanggal lahir wajib diisi.");
  }
  if (!input.tanggalUkur) {
    errors.push("Tanggal pengukuran wajib diisi.");
  }

  if (input.tanggalLahir && input.tanggalUkur) {
    const birth = new Date(input.tanggalLahir);
    const measure = new Date(input.tanggalUkur);
    if (measure < birth) {
      errors.push("Tanggal pengukuran tidak boleh sebelum tanggal lahir.");
    }
  }

  if (typeof input.beratBadan !== "number" || isNaN(input.beratBadan)) {
    errors.push("Berat badan harus berupa angka yang valid.");
  } else if (input.beratBadan <= 0) {
    errors.push("Berat badan harus lebih besar dari 0.");
  } else if (input.beratBadan > 60) {
    errors.push("Berat badan terlalu besar (maksimum 60 kg untuk kalkulator ini).");
  } else if (input.beratBadan < 0.5) {
    errors.push("Berat badan terlalu kecil (minimum 0.5 kg).");
  }

  if (typeof input.panjangTinggiBadan !== "number" || isNaN(input.panjangTinggiBadan)) {
    errors.push("Panjang/tinggi badan harus berupa angka yang valid.");
  } else if (input.panjangTinggiBadan <= 0) {
    errors.push("Panjang/tinggi badan harus lebih besar dari 0.");
  } else if (input.panjangTinggiBadan > 200) {
    errors.push("Panjang/tinggi badan tidak realistis (maksimum 200 cm).");
  } else if (input.panjangTinggiBadan < 30) {
    errors.push("Panjang/tinggi badan terlalu kecil (minimum 30 cm).");
  }

  return errors;
}

/**
 * Klasifikasi status gizi berdasarkan Z-score dan indikator.
 * Mengacu pada standar WHO dan Kementerian Kesehatan Indonesia.
 */
export function classifyStatus(
  indicator: IndicatorKey,
  z: number
): IndicatorResult["statusKey"] {
  switch (indicator) {
    case "BB/U":
      if (z < -3) return "sangat-kurang";
      if (z < -2) return "kurang";
      if (z <= 2) return "normal";
      return "berlebih";
    case "TB/U":
      if (z < -3) return "sangat-pendek";
      if (z < -2) return "pendek";
      if (z <= 3) return "normal";
      return "tinggi";
    case "BB/TB":
      if (z < -3) return "sangat-kurus";
      if (z < -2) return "kurus";
      if (z <= 1) return "normal";
      if (z <= 2) return "risiko";
      return "gemuk";
    case "IMT/U":
      if (z < -3) return "sangat-kurus";
      if (z < -2) return "kurus";
      if (z <= 1) return "normal";
      if (z <= 2) return "risiko";
      return "gemuk";
    default:
      return "normal";
  }
}

export function statusLabel(key: IndicatorResult["statusKey"]): string {
  const map: Record<IndicatorResult["statusKey"], string> = {
    "sangat-kurang": "Berat badan sangat kurang",
    "kurang": "Berat badan kurang",
    "normal": "Normal",
    "berlebih": "Berat badan berlebih",
    "sangat-pendek": "Sangat pendek",
    "pendek": "Pendek (stunting)",
    "tinggi": "Tinggi",
    "sangat-kurus": "Sangat kurus",
    "kurus": "Kurus",
    "risiko": "Berisiko gemuk",
    "gemuk": "Gemuk",
    "tidak-valid": "Data perlu diperiksa",
  };
  return map[key] ?? "Normal";
}

/**
 * Mendapatkan data LMS untuk indikator tertentu berdasarkan jenis kelamin dan umur.
 */
function getLmsForAge(
  indicator: "BB/U" | "TB/U" | "IMT/U",
  sex: Sex,
  ageMonths: number
): { L: number; M: number; S: number } | null {
  let data: LmsPoint[] = [];
  let data519: LmsPoint[] | null = null;

  if (indicator === "BB/U") {
    if (ageMonths < 0 || ageMonths > 60) return null;
    data = sex === "L" ? WFA_BOYS : WFA_GIRLS;
  } else if (indicator === "TB/U") {
    if (ageMonths < 0) return null;
    if (ageMonths <= 60) {
      // Untuk umur < 24 bulan: gunakan length (PB), >= 24 bulan: gunakan height (TB)
      // Karena PB dan TB adalah indikator yang sama (TB/U), data disusun sesuai umur.
      // Kita pakai gabungan LFA (0-23m) + HFA (24-60m).
      if (ageMonths < 24) {
        data = sex === "L" ? LFA_BOYS : LFA_GIRLS;
      } else {
        data = sex === "L" ? HFA_BOYS : HFA_GIRLS;
      }
    } else if (ageMonths <= 228) {
      data519 = sex === "L" ? HFA_BOYS_5_19 : HFA_GIRLS_5_19;
      data = data519;
    } else {
      return null;
    }
  } else if (indicator === "IMT/U") {
    if (ageMonths < 0) return null;
    if (ageMonths <= 60) {
      data = sex === "L" ? BFA_BOYS : BFA_GIRLS;
    } else if (ageMonths <= 228) {
      data519 = sex === "L" ? BFA_BOYS_5_19 : BFA_GIRLS_5_19;
      data = data519;
    } else {
      return null;
    }
  }

  return interpolateAgeLms(data, ageMonths);
}

/**
 * Mendapatkan data LMS untuk indikator BB/TB atau BB/PB berdasarkan panjang/tinggi.
 * WHO otomatis memilih antara length (PB) dan height (TB) berdasarkan:
 *  - Jika umur < 24 bulan: gunakan length (WFL)
 *  - Jika umur >= 24 bulan: gunakan height (WFH)
 * Selain itu, WHO juga mengonversi jika user mengukur dengan posisi berbeda.
 */
function getLmsForHeight(
  sex: Sex,
  ageMonths: number,
  measurementType: MeasurementType,
  height: number
): { L: number; M: number; S: number } | null {
  // Tentukan apakah gunakan WFL (length) atau WFH (height)
  // Aturan WHO: umur <24 bulan -> length; >=24 bulan -> height
  let useLength = ageMonths < 24;

  // Konversi jika user menggunakan jenis pengukuran yang tidak sesuai umur
  // (misalnya mengukur panjang pada anak >=24 bulan)
  let actualHeight = height;
  if (useLength && measurementType === "tinggi") {
    // Anak <24 bulan tapi diukur tinggi (standing), konversi ke length
    actualHeight = height + 0.7;
  } else if (!useLength && measurementType === "panjang") {
    // Anak >=24 bulan tapi diukur panjang (recumbent), konversi ke height
    actualHeight = height - 0.7;
  }

  let data: LmsHeightPoint[] = [];
  if (useLength) {
    data = sex === "L" ? WFL_BOYS : WFL_GIRLS;
  } else {
    data = sex === "L" ? WFH_BOYS : WFH_GIRLS;
  }

  return interpolateHeightLms(data, actualHeight);
}

/**
 * Fungsi utama: menghitung seluruh hasil status gizi anak.
 *
 * Algoritma:
 * 1. Validasi input
 * 2. Hitung usia (tahun-bulan-hari) dan total bulan
 * 3. Tentukan indikator yang relevan berdasarkan umur:
 *    - 0-60 bulan: BB/U, TB/U (atau PB/U), BB/TB (atau BB/PB), IMT/U
 *    - 61-228 bulan (5-19 tahun): TB/U, IMT/U
 * 4. Untuk setiap indikator: hitung Z-score menggunakan LMS method
 * 5. Klasifikasikan status gizi
 * 6. Tentukan status keseluruhan dan apakah perlu konsultasi
 */
export function calculateNutritionStatus(input: ChildInput): CalcResult {
  const warnings: string[] = [];
  let invalidData = false;

  // Hitung usia
  const age = calculateAge(input.tanggalLahir, input.tanggalUkur);

  // Validasi rentang usia (WHO: 0-228 bulan / 0-19 tahun)
  if (age.totalMonths < 0) {
    invalidData = true;
  }
  if (age.totalMonths > 228) {
    warnings.push(
      "Usia anak melebihi 19 tahun (228 bulan). Kalkulator GEMAS hanya mendukung rentang usia 0-19 tahun."
    );
    invalidData = true;
  }

  // Hitung BMI
  const heightM = input.panjangTinggiBadan / 100;
  const bmi = input.beratBadan / (heightM * heightM);

  const results: IndicatorResult[] = [];

  // Tentukan indikator yang akan dihitung berdasarkan umur
  const isUnder5 = age.totalMonths <= 60;

  if (isUnder5) {
    // 0-60 bulan: BB/U, TB/U, BB/TB (atau BB/PB), IMT/U

    // 1. BB/U (Weight-for-age)
    const wfaLms = getLmsForAge("BB/U", input.jenisKelamin, age.totalMonths);
    if (wfaLms) {
      const z = computeZScore(input.beratBadan, wfaLms.L, wfaLms.M, wfaLms.S);
      const isOut = !isFinite(z) || z < -5 || z > 5;
      results.push({
        indicator: "BB/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(classifyStatus("BB/U", z)),
        statusKey: isOut ? "tidak-valid" : classifyStatus("BB/U", z),
        medianValue: wfaLms.M,
        isOutOfRange: isOut,
        message: isOut
          ? "Nilai Z-score di luar rentang valid WHO (-5 sampai +5). Kemungkinan terdapat kesalahan input data."
          : undefined,
      });
      if (isOut) invalidData = true;
    } else {
      results.push({
        indicator: "BB/U",
        zScore: null,
        status: "Tidak dapat dihitung",
        statusKey: "tidak-valid",
        medianValue: null,
        isOutOfRange: true,
        message: "Usia di luar rentang valid WHO untuk indikator BB/U (0-60 bulan).",
      });
      invalidData = true;
    }

    // 2. TB/U (Length/Height-for-age) - termasuk PB/U untuk <24 bulan
    const lhfaLms = getLmsForAge("TB/U", input.jenisKelamin, age.totalMonths);
    if (lhfaLms) {
      // Tentukan apakah gunakan PB atau TB
      let actualHeight = input.panjangTinggiBadan;
      if (age.totalMonths < 24 && input.jenisPengukuran === "tinggi") {
        actualHeight = input.panjangTinggiBadan + 0.7;
      } else if (age.totalMonths >= 24 && input.jenisPengukuran === "panjang") {
        actualHeight = input.panjangTinggiBadan - 0.7;
      }
      const z = computeZScore(actualHeight, lhfaLms.L, lhfaLms.M, lhfaLms.S);
      const isOut = !isFinite(z) || z < -5 || z > 5;
      results.push({
        indicator: "TB/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(classifyStatus("TB/U", z)),
        statusKey: isOut ? "tidak-valid" : classifyStatus("TB/U", z),
        medianValue: lhfaLms.M,
        isOutOfRange: isOut,
        message: isOut
          ? "Nilai Z-score di luar rentang valid WHO."
          : age.totalMonths < 24
          ? "Indikator PB/U (Panjang Badan menurut Umur)"
          : "Indikator TB/U (Tinggi Badan menurut Umur)",
      });
      if (isOut) invalidData = true;
    } else {
      results.push({
        indicator: "TB/U",
        zScore: null,
        status: "Tidak dapat dihitung",
        statusKey: "tidak-valid",
        medianValue: null,
        isOutOfRange: true,
      });
      invalidData = true;
    }

    // 3. BB/TB atau BB/PB (Weight-for-length/height)
    const wfhLms = getLmsForHeight(
      input.jenisKelamin,
      age.totalMonths,
      input.jenisPengukuran,
      input.panjangTinggiBadan
    );
    if (wfhLms) {
      const z = computeZScore(input.beratBadan, wfhLms.L, wfhLms.M, wfhLms.S);
      const isOut = !isFinite(z) || z < -5 || z > 5;
      const ind: IndicatorKey = age.totalMonths < 24 ? "BB/TB" : "BB/TB"; // both labeled BB/TB
      results.push({
        indicator: ind,
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(classifyStatus("BB/TB", z)),
        statusKey: isOut ? "tidak-valid" : classifyStatus("BB/TB", z),
        medianValue: wfhLms.M,
        isOutOfRange: isOut,
        message: isOut
          ? "Nilai Z-score di luar rentang valid WHO."
          : age.totalMonths < 24
          ? "Indikator BB/PB (Berat Badan menurut Panjang Badan)"
          : "Indikator BB/TB (Berat Badan menurut Tinggi Badan)",
      });
      if (isOut) invalidData = true;
    } else {
      results.push({
        indicator: "BB/TB",
        zScore: null,
        status: "Data perlu diperiksa",
        statusKey: "tidak-valid",
        medianValue: null,
        isOutOfRange: true,
        message:
          "Panjang/tinggi badan di luar rentang referensi WHO (45-120 cm). Periksa kembali hasil pengukuran.",
      });
      invalidData = true;
    }

    // 4. IMT/U (BMI-for-age)
    const bfaLms = getLmsForAge("IMT/U", input.jenisKelamin, age.totalMonths);
    if (bfaLms) {
      const z = computeZScore(bmi, bfaLms.L, bfaLms.M, bfaLms.S);
      const isOut = !isFinite(z) || z < -5 || z > 5;
      results.push({
        indicator: "IMT/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(classifyStatus("IMT/U", z)),
        statusKey: isOut ? "tidak-valid" : classifyStatus("IMT/U", z),
        medianValue: bfaLms.M,
        isOutOfRange: isOut,
        message: isOut ? "Nilai Z-score di luar rentang valid WHO." : undefined,
      });
      if (isOut) invalidData = true;
    } else {
      results.push({
        indicator: "IMT/U",
        zScore: null,
        status: "Tidak dapat dihitung",
        statusKey: "tidak-valid",
        medianValue: null,
        isOutOfRange: true,
      });
      invalidData = true;
    }
  } else {
    // 61-228 bulan (5-19 tahun): TB/U, IMT/U saja
    // 1. TB/U
    const hfaLms = getLmsForAge("TB/U", input.jenisKelamin, age.totalMonths);
    if (hfaLms) {
      const z = computeZScore(input.panjangTinggiBadan, hfaLms.L, hfaLms.M, hfaLms.S);
      const isOut = !isFinite(z) || z < -5 || z > 5;
      results.push({
        indicator: "TB/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(classifyStatus("TB/U", z)),
        statusKey: isOut ? "tidak-valid" : classifyStatus("TB/U", z),
        medianValue: hfaLms.M,
        isOutOfRange: isOut,
      });
      if (isOut) invalidData = true;
    } else {
      results.push({
        indicator: "TB/U",
        zScore: null,
        status: "Tidak dapat dihitung",
        statusKey: "tidak-valid",
        medianValue: null,
        isOutOfRange: true,
      });
      invalidData = true;
    }

    // 2. IMT/U
    const bfaLms = getLmsForAge("IMT/U", input.jenisKelamin, age.totalMonths);
    if (bfaLms) {
      const z = computeZScore(bmi, bfaLms.L, bfaLms.M, bfaLms.S);
      const isOut = !isFinite(z) || z < -5 || z > 5;
      results.push({
        indicator: "IMT/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(classifyStatus("IMT/U", z)),
        statusKey: isOut ? "tidak-valid" : classifyStatus("IMT/U", z),
        medianValue: bfaLms.M,
        isOutOfRange: isOut,
      });
      if (isOut) invalidData = true;
    } else {
      results.push({
        indicator: "IMT/U",
        zScore: null,
        status: "Tidak dapat dihitung",
        statusKey: "tidak-valid",
        medianValue: null,
        isOutOfRange: true,
      });
      invalidData = true;
    }
  }

  // Tentukan status keseluruhan
  const hasProblemResults = results.filter(
    (r) =>
      r.statusKey === "sangat-kurang" ||
      r.statusKey === "kurang" ||
      r.statusKey === "sangat-pendek" ||
      r.statusKey === "pendek" ||
      r.statusKey === "sangat-kurus" ||
      r.statusKey === "kurus" ||
      r.statusKey === "gemuk" ||
      r.statusKey === "berlebih" ||
      r.statusKey === "risiko"
  );

  const hasSevere = results.some(
    (r) =>
      r.statusKey === "sangat-kurang" ||
      r.statusKey === "sangat-pendek" ||
      r.statusKey === "sangat-kurus"
  );

  const hasProblem = hasProblemResults.length > 0;
  const needsConsultation = hasSevere || hasProblemResults.length >= 2;

  let overallStatusKey = "normal";
  if (invalidData) {
    overallStatusKey = "tidak-valid";
  } else if (hasSevere) {
    overallStatusKey = "perlu-konsultasi";
  } else if (hasProblem) {
    overallStatusKey = "perlu-perhatian";
  }

  let overallStatus = "Pertumbuhan anak dalam rentang normal sesuai standar WHO.";
  if (invalidData) {
    overallStatus =
      "Beberapa data perlu diperiksa kembali. Pastikan tanggal lahir, jenis kelamin, berat badan, serta panjang/tinggi badan sudah benar.";
  } else if (hasSevere) {
    overallStatus =
      "Terdapat indikator yang menunjukkan masalah gizi yang serius. Segera konsultasikan dengan tenaga kesehatan atau ahli gizi.";
  } else if (hasProblem) {
    overallStatus =
      "Pertumbuhan anak perlu mendapatkan perhatian. Pantau secara rutin dan konsultasikan dengan tenaga kesehatan.";
  }

  return {
    input,
    age,
    bmi,
    results,
    overallStatus,
    overallStatusKey,
    hasProblem,
    needsConsultation,
    warnings,
    invalidData,
  };
}

/**
 * Mendapatkan data kurva pertumbuhan untuk grafik.
 * Mengembalikan array titik data untuk median, +1SD, -1SD, +2SD, -2SD, +3SD, -3SD.
 */
export function getGrowthCurveData(
  indicator: "BB/U" | "TB/U" | "BB/TB" | "IMT/U",
  sex: Sex,
  ageMonths: number,
  measurementType?: MeasurementType
): {
  month: number;
  median: number;
  sd3neg: number;
  sd2neg: number;
  sd1neg: number;
  sd1: number;
  sd2: number;
  sd3: number;
}[] {
  const sdValues = [-3, -2, -1, 0, 1, 2, 3];
  const result: {
    month: number;
    median: number;
    sd3neg: number;
    sd2neg: number;
    sd1neg: number;
    sd1: number;
    sd2: number;
    sd3: number;
  }[] = [];

  // Tentukan rentang umur untuk grafik (12 bulan sekitar umur anak)
  const startMonth = Math.max(0, Math.floor(ageMonths) - 6);
  const endMonth = Math.min(60, Math.ceil(ageMonths) + 6);
  const step = 1;

  for (let m = startMonth; m <= endMonth; m += step) {
    let lms: { L: number; M: number; S: number } | null = null;
    let label = `${m}`;

    if (indicator === "BB/U" && m >= 0 && m <= 60) {
      lms = interpolateAgeLms(sex === "L" ? WFA_BOYS : WFA_GIRLS, m);
    } else if (indicator === "TB/U") {
      if (m >= 0 && m < 24) {
        lms = interpolateAgeLms(sex === "L" ? LFA_BOYS : LFA_GIRLS, m);
      } else if (m >= 24 && m <= 60) {
        lms = interpolateAgeLms(sex === "L" ? HFA_BOYS : HFA_GIRLS, m);
      } else if (m > 60 && m <= 228) {
        lms = interpolateAgeLms(sex === "L" ? HFA_BOYS_5_19 : HFA_GIRLS_5_19, m);
      }
    } else if (indicator === "IMT/U") {
      if (m >= 0 && m <= 60) {
        lms = interpolateAgeLms(sex === "L" ? BFA_BOYS : BFA_GIRLS, m);
      } else if (m > 60 && m <= 228) {
        lms = interpolateAgeLms(sex === "L" ? BFA_BOYS_5_19 : BFA_GIRLS_5_19, m);
      }
    }

    if (lms) {
      const point: any = { month: m, label };
      sdValues.forEach((sd) => {
        const val = valueFromZScore(sd, lms!.L, lms!.M, lms!.S);
        if (sd === -3) point.sd3neg = val;
        if (sd === -2) point.sd2neg = val;
        if (sd === -1) point.sd1neg = val;
        if (sd === 0) point.median = val;
        if (sd === 1) point.sd1 = val;
        if (sd === 2) point.sd2 = val;
        if (sd === 3) point.sd3 = val;
      });
      result.push(point);
    }
  }

  return result;
}

/**
 * Mendapatkan data kurva untuk BB/TB (berdasarkan panjang/tinggi, bukan umur).
 */
export function getWfhCurveData(
  sex: Sex,
  ageMonths: number,
  currentHeight: number
): {
  cm: number;
  median: number;
  sd3neg: number;
  sd2neg: number;
  sd1neg: number;
  sd1: number;
  sd2: number;
  sd3: number;
}[] {
  const useLength = ageMonths < 24;
  const data = useLength
    ? sex === "L"
      ? WFL_BOYS
      : WFL_GIRLS
    : sex === "L"
    ? WFH_BOYS
    : WFH_GIRLS;

  const sdValues = [-3, -2, -1, 0, 1, 2, 3];
  const result: any[] = [];

  const startCm = Math.max(data[0].cm, Math.floor(currentHeight) - 10);
  const endCm = Math.min(data[data.length - 1].cm, Math.ceil(currentHeight) + 10);

  for (let cm = startCm; cm <= endCm; cm += 1) {
    const lms = interpolateHeightLms(data, cm);
    if (lms) {
      const point: any = { cm };
      sdValues.forEach((sd) => {
        const val = valueFromZScore(sd, lms!.L, lms!.M, lms!.S);
        if (sd === -3) point.sd3neg = val;
        if (sd === -2) point.sd2neg = val;
        if (sd === -1) point.sd1neg = val;
        if (sd === 0) point.median = val;
        if (sd === 1) point.sd1 = val;
        if (sd === 2) point.sd2 = val;
        if (sd === 3) point.sd3 = val;
      });
      result.push(point);
    }
  }

  return result;
}
