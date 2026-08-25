/**
 * WHO Growth Standards - Calculator (LMS Method)
 *
 * Implementasi ALGORITMA WHO ANTHRO yang akurat menggunakan:
 * - Data WHO Child Growth Standards (0-5 tahun, per HARI)
 * - Data WHO Reference 2007 (5-19 tahun, per BULAN)
 * - Metode LMS (Box-Cox transformation)
 * - Interpolasi linear antar titik data (sama seperti WHO Anthro)
 * - Aturan konversi Panjang <-> Tinggi (0.7 cm)
 * - Per-indicator classification sesuai WHO
 * - Extreme value flagging sesuai WHO Anthro rules
 *
 * Referensi:
 *  - WHO Anthro v3.2.2 (software resmi WHO)
 *  - WHO AnthroPlus v1.0.4
 *  - WHO Child Growth Standards documentation
 *  - Onis M et al. "WHO Child Growth Standards" (2006)
 *
 * Algoritma Z-score (LMS):
 *   Jika L != 0: Z = ((X/M)^L - 1) / (L * S)
 *   Jika L = 0:  Z = ln(X/M) / S
 *
 * Catatan: WHO Anthro menggunakan interpolasi linear antara titik data harian.
 */

import {
  wfa_boys,
  wfa_girls,
  lfa_boys,
  lfa_girls,
  hfa_boys,
  hfa_girls,
  wfl_boys,
  wfl_girls,
  wfh_boys,
  wfh_girls,
  bfa_boys,
  bfa_girls,
  bfa519_boys,
  bfa519_girls,
  hfa519_boys,
  hfa519_girls,
  type Sex,
  type MeasurementType,
  type IndicatorKey,
  type AgeLmsTuple,
  type HeightLmsTuple,
} from "./data";

// =====================================================
// TIPE DATA
// =====================================================

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
  totalDays: number; // exact age in days
  totalMonths: number; // decimal months for WHO computation
}

export type StatusKey =
  | "sangat-kurang"
  | "kurang"
  | "normal"
  | "berlebih"
  | "sangat-pendek"
  | "pendek"
  | "tinggi"
  | "sangat-kurus"
  | "kurus"
  | "risiko"
  | "gemuk"
  | "tidak-valid";

export interface IndicatorResult {
  indicator: IndicatorKey;
  zScore: number | null; // presisi tinggi (full float)
  status: string; // label untuk display
  statusKey: StatusKey;
  medianValue: number | null; // M value dari WHO reference
  isOutOfRange: boolean; // true jika di luar rentang valid WHO
  flag?: "normal" | "extreme-high" | "extreme-low" | "out-of-range";
  message?: string;
  reference: string; // "WHO Child Growth Standards (2006)" atau "WHO Reference 2007"
}

export interface CalcResult {
  input: ChildInput;
  age: AgeBreakdown;
  bmi: number; // calculated BMI (presisi tinggi)
  results: IndicatorResult[];
  overallStatus: string;
  overallStatusKey: string;
  hasProblem: boolean;
  needsConsultation: boolean;
  warnings: string[];
  invalidData: boolean;
  reference: string; // overall reference used
}

// =====================================================
// PERHITUNGAN UMUR (EXACT AGE)
// =====================================================

/**
 * Menghitung selisih hari antara dua tanggal (calendar days, includes leap years).
 * Sama seperti perhitungan WHO Anthro.
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / msPerDay);
}

/**
 * Menghitung umur anak pada tanggal pengukuran (exact age).
 * Mengikuti metode WHO Anthro:
 *  - totalDays: exact age in calendar days
 *  - years/months/days: breakdown komponen
 *  - totalMonths: totalDays / 30.4375 (WHO conversion)
 *
 * Catatan: WHO Anthro menggunakan 30.4375 hari per bulan untuk konversi.
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
  // WHO Anthro conversion: 1 month = 30.4375 days
  const totalMonths = totalDays / 30.4375;

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

// =====================================================
// LMS - INTERPOLASI LINEAR
// =====================================================

/**
 * Interpolasi linear untuk data berbasis umur (age in days or months).
 * Sama seperti WHO Anthro: linear interpolation between adjacent data points.
 *
 * @param data Array of [age, L, M, S] sorted by age
 * @param age Age to look up (in days or months, matching data)
 * @returns {L, M, S} interpolated, or null if out of range
 */
function interpolateAgeLms(
  data: AgeLmsTuple[],
  age: number
): { L: number; M: number; S: number } | null {
  if (data.length === 0) return null;

  // Di luar rentang data
  if (age < data[0][0] || age > data[data.length - 1][0]) {
    return null;
  }

  // Binary search untuk menemukan range [low, high] yang berisi age
  let low = 0;
  let high = data.length - 1;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (data[mid][0] <= age) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const p1 = data[low];
  const p2 = data[high];

  // Exact match
  if (age === p1[0]) return { L: p1[1], M: p1[2], S: p1[3] };
  if (age === p2[0]) return { L: p2[1], M: p2[2], S: p2[3] };

  // Linear interpolation
  const t = (age - p1[0]) / (p2[0] - p1[0]);
  return {
    L: p1[1] + (p2[1] - p1[1]) * t,
    M: p1[2] + (p2[2] - p1[2]) * t,
    S: p1[3] + (p2[3] - p1[3]) * t,
  };
}

/**
 * Interpolasi linear untuk data berbasis panjang/tinggi (cm, step 0.1 cm).
 *
 * @param data Array of [cm_x10, L, M, S] sorted by cm_x10
 * @param cm Length/height in cm (decimal)
 * @returns {L, M, S} interpolated, or null if out of range
 */
function interpolateHeightLms(
  data: HeightLmsTuple[],
  cm: number
): { L: number; M: number; S: number } | null {
  if (data.length === 0) return null;

  const cmX10 = Math.round(cm * 10);

  // Di luar rentang data
  if (cmX10 < data[0][0] || cmX10 > data[data.length - 1][0]) {
    return null;
  }

  // Binary search
  let low = 0;
  let high = data.length - 1;
  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (data[mid][0] <= cmX10) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const p1 = data[low];
  const p2 = data[high];

  if (cmX10 === p1[0]) return { L: p1[1], M: p1[2], S: p1[3] };
  if (cmX10 === p2[0]) return { L: p2[1], M: p2[2], S: p2[3] };

  // Linear interpolation
  const t = (cmX10 - p1[0]) / (p2[0] - p1[0]);
  return {
    L: p1[1] + (p2[1] - p1[1]) * t,
    M: p1[2] + (p2[2] - p1[2]) * t,
    S: p1[3] + (p2[3] - p1[3]) * t,
  };
}

// =====================================================
// LMS - Z-SCORE CALCULATION
// =====================================================

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
 * Menghitung nilai pengukuran dari Z-score (invers LMS).
 * Berguna untuk generate kurva SD pada grafik.
 *
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

// =====================================================
// EXTREME VALUE FLAGGING (WHO Anthro rules)
// =====================================================

/**
 * WHO Anthro flag rules for extreme values:
 *  - WFA: -5 <= Z <= 5
 *  - HFA/LFA: -5 <= Z <= 6 (HFA) / -5 <= Z <= 6 (LFA)
 *  - WFL/WFH: -5 <= Z <= 5
 *  - BFA: -5 <= Z <= 5
 *
 * Flag 2 = extreme high (above max)
 * Flag 3 = extreme low (below min)
 *
 * Sumber: WHO Anthro documentation
 */
function flagExtremeZ(indicator: IndicatorKey, z: number): IndicatorResult["flag"] {
  if (!isFinite(z)) return "out-of-range";

  const limits: Record<IndicatorKey, { min: number; max: number }> = {
    "BB/U": { min: -5, max: 5 },
    "TB/U": { min: -5, max: 6 },
    "BB/TB": { min: -5, max: 5 },
    "IMT/U": { min: -5, max: 5 },
  };

  const limit = limits[indicator];
  if (z < limit.min) return "extreme-low";
  if (z > limit.max) return "extreme-high";
  return "normal";
}

// =====================================================
// KLASIFIKASI PER INDIKATOR (sesuai WHO)
// =====================================================

/**
 * Klasifikasi Weight-for-Age (BB/U) berdasarkan Z-score WHO.
 *  - Z < -3: Severely underweight (Berat badan sangat kurang)
 *  - -3 <= Z < -2: Underweight (Berat badan kurang)
 *  - -2 <= Z <= 2: Normal
 *  - Z > 2: Possible risk of overweight (Berat badan berlebih)
 */
function classifyWeightForAge(z: number): StatusKey {
  if (z < -3) return "sangat-kurang";
  if (z < -2) return "kurang";
  if (z <= 2) return "normal";
  return "berlebih";
}

/**
 * Klasifikasi Length/Height-for-Age (PB/U, TB/U) berdasarkan Z-score WHO.
 *  - Z < -3: Severely stunted (Sangat pendek)
 *  - -3 <= Z < -2: Stunted (Pendek)
 *  - -2 <= Z <= 3: Normal
 *  - Z > 3: Tall (Tinggi)
 */
function classifyHeightForAge(z: number): StatusKey {
  if (z < -3) return "sangat-pendek";
  if (z < -2) return "pendek";
  if (z <= 3) return "normal";
  return "tinggi";
}

/**
 * Klasifikasi Weight-for-Length/Height (BB/PB, BB/TB) berdasarkan Z-score WHO.
 *  - Z < -3: Severely wasted (Sangat kurus)
 *  - -3 <= Z < -2: Wasted (Kurus)
 *  - -2 <= Z <= 1: Normal
 *  - 1 < Z <= 2: Possible risk of overweight (Berisiko gemuk)
 *  - 2 < Z <= 3: Overweight (Gemuk)
 *  - Z > 3: Obese (Sangat gemuk)
 */
function classifyWeightForHeight(z: number): StatusKey {
  if (z < -3) return "sangat-kurus";
  if (z < -2) return "kurus";
  if (z <= 1) return "normal";
  if (z <= 2) return "risiko";
  if (z <= 3) return "gemuk";
  return "gemuk"; // Z > 3 tetap gemuk (sangat gemuk) - tidak ada kategori terpisah
}

/**
 * Klasifikasi BMI-for-Age (IMT/U) berdasarkan Z-score WHO.
 * Sama dengan Weight-for-Height: -3, -2, +1, +2, +3 cutoffs.
 */
function classifyBMIForAge(z: number): StatusKey {
  if (z < -3) return "sangat-kurus";
  if (z < -2) return "kurus";
  if (z <= 1) return "normal";
  if (z <= 2) return "risiko";
  if (z <= 3) return "gemuk";
  return "gemuk";
}

/**
 * Dispatcher untuk klasifikasi berdasarkan indikator.
 */
export function classifyStatus(indicator: IndicatorKey, z: number): StatusKey {
  switch (indicator) {
    case "BB/U":
      return classifyWeightForAge(z);
    case "TB/U":
      return classifyHeightForAge(z);
    case "BB/TB":
      return classifyWeightForHeight(z);
    case "IMT/U":
      return classifyBMIForAge(z);
    default:
      return "normal";
  }
}

/**
 * Label status dalam Bahasa Indonesia.
 */
export function statusLabel(key: StatusKey): string {
  const map: Record<StatusKey, string> = {
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

// =====================================================
// VALIDASI INPUT
// =====================================================

/**
 * Validasi input anak sebelum perhitungan.
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
  } else if (input.beratBadan > 100) {
    errors.push("Berat badan tidak realistis (maksimum 100 kg).");
  } else if (input.beratBadan < 0.5) {
    errors.push("Berat badan terlalu kecil (minimum 0.5 kg).");
  }

  if (typeof input.panjangTinggiBadan !== "number" || isNaN(input.panjangTinggiBadan)) {
    errors.push("Panjang/tinggi badan harus berupa angka yang valid.");
  } else if (input.panjangTinggiBadan <= 0) {
    errors.push("Panjang/tinggi badan harus lebih besar dari 0.");
  } else if (input.panjangTinggiBadan > 220) {
    errors.push("Panjang/tinggi badan tidak realistis (maksimum 220 cm).");
  } else if (input.panjangTinggiBadan < 30) {
    errors.push("Panjang/tinggi badan terlalu kecil (minimum 30 cm).");
  }

  if (input.jenisPengukuran !== "panjang" && input.jenisPengukuran !== "tinggi") {
    errors.push("Jenis pengukuran wajib dipilih (Panjang Badan atau Tinggi Badan).");
  }

  return errors;
}

// =====================================================
// DATA LOOKUP (per indicator, per sex)
// =====================================================

/**
 * Dapatkan data LMS untuk indikator berbasis umur (WFA, LFA, HFA, BFA, BFA519, HFA519).
 */
function getLmsForAge(
  indicator: "BB/U" | "TB/U" | "IMT/U",
  sex: Sex,
  ageDays: number,
  ageMonths: number
): { L: number; M: number; S: number; reference: string } | null {
  // Untuk 0-5 tahun (0-1856 hari): gunakan WHO Child Growth Standards 2006
  if (ageDays >= 0 && ageDays <= 1856) {
    let data: AgeLmsTuple[];
    if (indicator === "BB/U") {
      data = sex === "L" ? wfa_boys : wfa_girls;
    } else if (indicator === "TB/U") {
      // Untuk <24 bulan (731 hari): gunakan Length (recumbent)
      // Untuk >=24 bulan: gunakan Height (standing)
      // WHO Anthro otomatis memilih berdasarkan umur
      if (ageDays < 731) {
        data = sex === "L" ? lfa_boys : lfa_girls;
      } else {
        data = sex === "L" ? hfa_boys : hfa_girls;
      }
    } else if (indicator === "IMT/U") {
      data = sex === "L" ? bfa_boys : bfa_girls;
    } else {
      return null;
    }
    const lms = interpolateAgeLms(data, ageDays);
    if (lms) {
      return { ...lms, reference: "WHO Child Growth Standards (2006)" };
    }
    return null;
  }

  // Untuk 5-19 tahun (61-228 bulan): gunakan WHO Reference 2007
  if (ageMonths >= 61 && ageMonths <= 228.5) {
    let data: AgeLmsTuple[];
    if (indicator === "TB/U") {
      data = sex === "L" ? hfa519_boys : hfa519_girls;
    } else if (indicator === "IMT/U") {
      data = sex === "L" ? bfa519_boys : bfa519_girls;
    } else {
      // BB/U untuk 5-19 tahun tidak didukung oleh WHO 2007 reference
      // WHO 2007 hanya menyediakan BMI-for-age dan Height-for-age
      return null;
    }
    // WHO 2007 data is monthly (61, 62, ..., 228)
    // For ages between months, use floor() to get the month
    // (This matches WHO AnthroPlus behavior)
    const lookupMonth = Math.min(228, Math.max(61, Math.floor(ageMonths)));
    const lms = interpolateAgeLms(data, lookupMonth);
    if (lms) {
      return { ...lms, reference: "WHO Reference 2007 (AnthroPlus)" };
    }
    return null;
  }

  return null;
}

/**
 * Dapatkan data LMS untuk indikator berbasis panjang/tinggi (WFL, WFH).
 *
 * Aturan WHO Anthro:
 *  - Jika umur < 24 bulan (731 hari): gunakan Length (WFL)
 *  - Jika umur >= 24 bulan: gunakan Height (WFH)
 *  - Jika user mengukur dengan jenis yang tidak sesuai umur,
 *    konversi: Length -> Height (-0.7 cm), Height -> Length (+0.7 cm)
 *  - WHO juga punya aturan: jika length/height < 87 cm, gunakan WFL;
 *    jika >= 87 cm, gunakan WFH (meski umur < 24 bulan)
 */
function getLmsForHeight(
  sex: Sex,
  ageDays: number,
  measurementType: MeasurementType,
  height: number
): { L: number; M: number; S: number; reference: string } | null {
  // Tentukan apakah gunakan WFL (length) atau WFH (height)
  // Aturan WHO Anthro:
  //  - Default: umur < 24 bulan -> length; >= 24 bulan -> height
  //  - Override: jika length/height >= 87 cm -> gunakan WFH (height)
  //              jika length/height < 87 cm -> gunakan WFL (length)
  let useLength: boolean;
  if (height < 87) {
    useLength = true;
  } else {
    useLength = false;
  }
  // Override based on age (WHO Anthro default)
  if (ageDays < 731) {
    useLength = true; // < 24 bulan default length
  } else {
    useLength = false; // >= 24 bulan default height
  }
  // Re-check by height threshold (final decision)
  if (height < 87) {
    useLength = true;
  } else if (height >= 87) {
    useLength = false;
  }

  // Konversi jika user menggunakan jenis pengukuran yang tidak sesuai
  let actualHeight = height;
  if (useLength && measurementType === "tinggi") {
    // Anak perlu dihitung sebagai length, tapi user ukur standing height
    // Konversi height -> length: +0.7 cm
    actualHeight = height + 0.7;
  } else if (!useLength && measurementType === "panjang") {
    // Anak perlu dihitung sebagai height, tapi user ukur recumbent length
    // Konversi length -> height: -0.7 cm
    actualHeight = height - 0.7;
  }

  const data = useLength
    ? sex === "L"
      ? wfl_boys
      : wfl_girls
    : sex === "L"
    ? wfh_boys
    : wfh_girls;

  const lms = interpolateHeightLms(data, actualHeight);
  if (lms) {
    return {
      ...lms,
      reference: "WHO Child Growth Standards (2006)",
    };
  }
  return null;
}

// =====================================================
// FUNGSI UTAMA: calculateNutritionStatus
// =====================================================

/**
 * Menghitung seluruh hasil status gizi anak.
 *
 * Algoritma:
 * 1. Validasi input
 * 2. Hitung usia (exact age in days)
 * 3. Tentukan indikator yang relevan berdasarkan umur:
 *    - 0-1856 hari (0-5 tahun): BB/U, TB/U, BB/TB, IMT/U
 *    - 1857 hari-228 bulan (5-19 tahun): TB/U, IMT/U (BB/U tidak tersedia)
 * 4. Untuk setiap indikator: hitung Z-score menggunakan LMS method
 * 5. Flag extreme values per WHO Anthro rules
 * 6. Klasifikasikan status gizi per indikator
 * 7. Tentukan status keseluruhan dan apakah perlu konsultasi
 */
export function calculateNutritionStatus(input: ChildInput): CalcResult {
  const warnings: string[] = [];
  let invalidData = false;

  // Hitung usia
  const age = calculateAge(input.tanggalLahir, input.tanggalUkur);

  // Validasi rentang usia (WHO: 0-228 bulan / 0-19 tahun)
  if (age.totalDays < 0) {
    invalidData = true;
    warnings.push("Tanggal pengukuran tidak boleh sebelum tanggal lahir.");
  }
  if (age.totalMonths > 228) {
    warnings.push(
      "Usia anak melebihi 19 tahun (228 bulan). Kalkulator GEMAS hanya mendukung rentang usia 0-19 tahun."
    );
    invalidData = true;
  }

  // Hitung BMI dengan presisi tinggi
  const heightM = input.panjangTinggiBadan / 100;
  const bmi = input.beratBadan / (heightM * heightM);

  const results: IndicatorResult[] = [];
  let overallReference = "WHO Child Growth Standards (2006)";

  // Tentukan indikator berdasarkan umur
  const isUnder5 = age.totalDays <= 1856; // 0-5 tahun

  if (isUnder5) {
    // ============================================
    // 0-5 TAHUN: 4 INDIKATOR (BB/U, TB/U, BB/TB, IMT/U)
    // ============================================

    // 1. BB/U (Weight-for-Age)
    const wfaLms = getLmsForAge("BB/U", input.jenisKelamin, age.totalDays, age.totalMonths);
    if (wfaLms) {
      const z = computeZScore(input.beratBadan, wfaLms.L, wfaLms.M, wfaLms.S);
      const flag = flagExtremeZ("BB/U", z);
      const isOut = flag !== "normal";
      const statusKey = isOut ? "tidak-valid" : classifyWeightForAge(z);
      results.push({
        indicator: "BB/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(statusKey),
        statusKey,
        medianValue: wfaLms.M,
        isOutOfRange: isOut,
        flag,
        message: isOut
          ? `Nilai Z-score ${z.toFixed(2)} di luar rentang valid WHO (-5 hingga +5 SD). Kemungkinan terdapat kesalahan input data atau pengukuran.`
          : undefined,
        reference: wfaLms.reference,
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
        flag: "out-of-range",
        message: "Usia di luar rentang valid WHO untuk BB/U (0-5 tahun).",
        reference: "WHO Child Growth Standards (2006)",
      });
      invalidData = true;
    }

    // 2. TB/U atau PB/U (Length/Height-for-Age)
    const lhfaLms = getLmsForAge("TB/U", input.jenisKelamin, age.totalDays, age.totalMonths);
    if (lhfaLms) {
      // Tentukan apakah gunakan PB (length) atau TB (height)
      // Untuk umur < 24 bulan: gunakan length (PB)
      // Untuk umur >= 24 bulan: gunakan height (TB)
      // Jika user mengukur dengan jenis yang tidak sesuai, konversi
      let actualHeight = input.panjangTinggiBadan;
      const useLengthForHFA = age.totalDays < 731; // < 24 bulan
      if (useLengthForHFA && input.jenisPengukuran === "tinggi") {
        // Hitung sebagai length, tapi user ukur standing height -> +0.7 cm
        actualHeight = input.panjangTinggiBadan + 0.7;
      } else if (!useLengthForHFA && input.jenisPengukuran === "panjang") {
        // Hitung sebagai height, tapi user ukur recumbent length -> -0.7 cm
        actualHeight = input.panjangTinggiBadan - 0.7;
      }
      const z = computeZScore(actualHeight, lhfaLms.L, lhfaLms.M, lhfaLms.S);
      const flag = flagExtremeZ("TB/U", z);
      const isOut = flag !== "normal";
      const statusKey = isOut ? "tidak-valid" : classifyHeightForAge(z);
      results.push({
        indicator: "TB/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(statusKey),
        statusKey,
        medianValue: lhfaLms.M,
        isOutOfRange: isOut,
        flag,
        message: isOut
          ? `Nilai Z-score ${z.toFixed(2)} di luar rentang valid WHO.`
          : age.totalDays < 731
          ? "Indikator PB/U (Panjang Badan menurut Umur) - diukur dalam posisi telentang."
          : "Indikator TB/U (Tinggi Badan menurut Umur) - diukur dalam posisi berdiri.",
        reference: lhfaLms.reference,
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
        flag: "out-of-range",
        reference: "WHO Child Growth Standards (2006)",
      });
      invalidData = true;
    }

    // 3. BB/TB atau BB/PB (Weight-for-Length/Height)
    const wfhLms = getLmsForHeight(
      input.jenisKelamin,
      age.totalDays,
      input.jenisPengukuran,
      input.panjangTinggiBadan
    );
    if (wfhLms) {
      const z = computeZScore(input.beratBadan, wfhLms.L, wfhLms.M, wfhLms.S);
      const flag = flagExtremeZ("BB/TB", z);
      const isOut = flag !== "normal";
      const statusKey = isOut ? "tidak-valid" : classifyWeightForHeight(z);
      // Tentukan label indikator: BB/PB (recumbent) atau BB/TB (standing)
      const isLengthIndicator = input.panjangTinggiBadan < 87 || age.totalDays < 731;
      results.push({
        indicator: "BB/TB", // gunakan label umum
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(statusKey),
        statusKey,
        medianValue: wfhLms.M,
        isOutOfRange: isOut,
        flag,
        message: isOut
          ? `Nilai Z-score ${z.toFixed(2)} di luar rentang valid WHO.`
          : isLengthIndicator
          ? "Indikator BB/PB (Berat Badan menurut Panjang Badan) - menggunakan referensi Weight-for-Length."
          : "Indikator BB/TB (Berat Badan menurut Tinggi Badan) - menggunakan referensi Weight-for-Height.",
        reference: wfhLms.reference,
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
        flag: "out-of-range",
        message:
          "Panjang/tinggi badan di luar rentang referensi WHO (45-120 cm). Periksa kembali hasil pengukuran.",
        reference: "WHO Child Growth Standards (2006)",
      });
      invalidData = true;
    }

    // 4. IMT/U (BMI-for-Age)
    const bfaLms = getLmsForAge("IMT/U", input.jenisKelamin, age.totalDays, age.totalMonths);
    if (bfaLms) {
      const z = computeZScore(bmi, bfaLms.L, bfaLms.M, bfaLms.S);
      const flag = flagExtremeZ("IMT/U", z);
      const isOut = flag !== "normal";
      const statusKey = isOut ? "tidak-valid" : classifyBMIForAge(z);
      results.push({
        indicator: "IMT/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(statusKey),
        statusKey,
        medianValue: bfaLms.M,
        isOutOfRange: isOut,
        flag,
        message: isOut
          ? `Nilai Z-score ${z.toFixed(2)} di luar rentang valid WHO.`
          : undefined,
        reference: bfaLms.reference,
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
        flag: "out-of-range",
        reference: "WHO Child Growth Standards (2006)",
      });
      invalidData = true;
    }
  } else {
    // ============================================
    // 5-19 TAHUN: 2 INDIKATOR (TB/U, IMT/U)
    // ============================================
    overallReference = "WHO Reference 2007 (AnthroPlus)";

    // 1. TB/U (Height-for-Age)
    const hfa519Lms = getLmsForAge("TB/U", input.jenisKelamin, age.totalDays, age.totalMonths);
    if (hfa519Lms) {
      const z = computeZScore(input.panjangTinggiBadan, hfa519Lms.L, hfa519Lms.M, hfa519Lms.S);
      const flag = flagExtremeZ("TB/U", z);
      const isOut = flag !== "normal";
      const statusKey = isOut ? "tidak-valid" : classifyHeightForAge(z);
      results.push({
        indicator: "TB/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(statusKey),
        statusKey,
        medianValue: hfa519Lms.M,
        isOutOfRange: isOut,
        flag,
        reference: hfa519Lms.reference,
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
        flag: "out-of-range",
        reference: "WHO Reference 2007 (AnthroPlus)",
      });
      invalidData = true;
    }

    // 2. IMT/U (BMI-for-Age)
    const bfa519Lms = getLmsForAge("IMT/U", input.jenisKelamin, age.totalDays, age.totalMonths);
    if (bfa519Lms) {
      const z = computeZScore(bmi, bfa519Lms.L, bfa519Lms.M, bfa519Lms.S);
      const flag = flagExtremeZ("IMT/U", z);
      const isOut = flag !== "normal";
      const statusKey = isOut ? "tidak-valid" : classifyBMIForAge(z);
      results.push({
        indicator: "IMT/U",
        zScore: isOut ? null : z,
        status: isOut ? "Data perlu diperiksa" : statusLabel(statusKey),
        statusKey,
        medianValue: bfa519Lms.M,
        isOutOfRange: isOut,
        flag,
        reference: bfa519Lms.reference,
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
        flag: "out-of-range",
        reference: "WHO Reference 2007 (AnthroPlus)",
      });
      invalidData = true;
    }

    // Catatan: BB/U dan BB/TB tidak tersedia untuk anak 5-19 tahun
    results.push({
      indicator: "BB/U",
      zScore: null,
      status: "Tidak tersedia untuk usia 5-19 tahun",
      statusKey: "tidak-valid",
      medianValue: null,
      isOutOfRange: false,
      flag: "out-of-range",
      message: "Indikator BB/U tidak didukung oleh WHO Reference 2007 (hanya TB/U dan IMT/U yang tersedia).",
      reference: "WHO Reference 2007 (AnthroPlus)",
    });
    results.push({
      indicator: "BB/TB",
      zScore: null,
      status: "Tidak tersedia untuk usia 5-19 tahun",
      statusKey: "tidak-valid",
      medianValue: null,
      isOutOfRange: false,
      flag: "out-of-range",
      message: "Indikator BB/TB tidak didukung oleh WHO Reference 2007.",
      reference: "WHO Reference 2007 (AnthroPlus)",
    });
  }

  // ============================================
  // TENTUKAN STATUS KESELURUHAN
  // ============================================

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
      r.statusKey === "sangat-kurus" ||
      r.statusKey === "gemuk"
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
    reference: overallReference,
  };
}

// =====================================================
// DATA GRAFIK KURVA PERTUMBUHAN
// =====================================================

/**
 * Mendapatkan data kurva pertumbuhan untuk grafik.
 * Mengembalikan array titik data untuk median, +1SD, -1SD, +2SD, -2SD, +3SD, -3SD.
 */
export function getGrowthCurveData(
  indicator: "BB/U" | "TB/U" | "BB/TB" | "IMT/U",
  sex: Sex,
  ageDays: number,
  ageMonths: number,
  measurementType?: MeasurementType,
  currentHeight?: number
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
  const result: any[] = [];

  // Tentukan rentang umur untuk grafik (12 bulan sekitar umur anak)
  const currentMonth = ageMonths;
  const startMonth = Math.max(0, Math.floor(currentMonth) - 6);
  const endMonth = isUnder5Month(currentMonth) ? Math.min(60, Math.ceil(currentMonth) + 6) : Math.min(228, Math.ceil(currentMonth) + 12);

  for (let m = startMonth; m <= endMonth; m++) {
    // Konversi bulan ke hari (WHO: 1 month = 30.4375 days)
    const day = m * 30.4375;
    let lms: { L: number; M: number; S: number } | null = null;

    if (indicator === "BB/U" && m <= 60) {
      const data = sex === "L" ? wfa_boys : wfa_girls;
      lms = interpolateAgeLms(data, day);
    } else if (indicator === "TB/U") {
      if (m < 24) {
        const data = sex === "L" ? lfa_boys : lfa_girls;
        lms = interpolateAgeLms(data, day);
      } else if (m <= 60) {
        const data = sex === "L" ? hfa_boys : hfa_girls;
        lms = interpolateAgeLms(data, day);
      } else if (m <= 228) {
        const data = sex === "L" ? hfa519_boys : hfa519_girls;
        lms = interpolateAgeLms(data, m);
      }
    } else if (indicator === "IMT/U") {
      if (m <= 60) {
        const data = sex === "L" ? bfa_boys : bfa_girls;
        lms = interpolateAgeLms(data, day);
      } else if (m <= 228) {
        const data = sex === "L" ? bfa519_boys : bfa519_girls;
        lms = interpolateAgeLms(data, m);
      }
    }

    if (lms) {
      const point: any = { month: m };
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

function isUnder5Month(month: number): boolean {
  return month <= 60;
}

/**
 * Mendapatkan data kurva untuk BB/TB (berdasarkan panjang/tinggi, bukan umur).
 */
export function getWfhCurveData(
  sex: Sex,
  ageDays: number,
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
  // Tentukan WFL atau WFH berdasarkan umur dan tinggi
  const useLength = ageDays < 731 || currentHeight < 87;
  const data = useLength
    ? sex === "L"
      ? wfl_boys
      : wfl_girls
    : sex === "L"
    ? wfh_boys
    : wfh_girls;

  const sdValues = [-3, -2, -1, 0, 1, 2, 3];
  const result: any[] = [];

  const startCm = Math.max(data[0][0] / 10, Math.floor(currentHeight) - 10);
  const endCm = Math.min(data[data.length - 1][0] / 10, Math.ceil(currentHeight) + 10);

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
