/**
 * Unit Test untuk WHO Calculator (LMS Method)
 *
 * Test data dari WHO Anthro / WHO AnthroPlus reference.
 * Memverifikasi bahwa perhitungan Z-score menghasilkan nilai yang konsisten
 * dengan standar WHO.
 *
 * Untuk menjalankan: bun test tests/who-calculator.test.ts
 * atau: npx vitest tests/who-calculator.test.ts
 */

import { describe, expect, it } from "vitest";
import {
  computeZScore,
  valueFromZScore,
  calculateAge,
  calculateNutritionStatus,
  validateInput,
  classifyStatus,
  formatAge,
  type ChildInput,
} from "../src/lib/who/calculator";

describe("WHO Calculator - LMS Method", () => {
  describe("computeZScore (rumus dasar LMS)", () => {
    it("Z-score = 0 saat X = M (median)", () => {
      // Untuk X = M (median), Z harus = 0
      const z = computeZScore(10, -0.1716, 10, 0.1088);
      expect(z).toBeCloseTo(0, 5);
    });

    it("Z-score = +1 SD saat X = M * (1 + L*S*1)^(1/L)", () => {
      // Untuk Z = 1, X harus = M * (1 + L*S*1)^(1/L)
      const L = -0.1716;
      const M = 10.151;
      const S = 0.1088;
      const X = valueFromZScore(1, L, M, S);
      const z = computeZScore(X, L, M, S);
      expect(z).toBeCloseTo(1, 4);
    });

    it("Z-score = -1 SD saat X = M * (1 + L*S*(-1))^(1/L)", () => {
      const L = -0.1716;
      const M = 10.151;
      const S = 0.1088;
      const X = valueFromZScore(-1, L, M, S);
      const z = computeZScore(X, L, M, S);
      expect(z).toBeCloseTo(-1, 4);
    });

    it("Z-score = +2 SD saat X = M * (1 + L*S*2)^(1/L)", () => {
      const L = -0.1716;
      const M = 10.151;
      const S = 0.1088;
      const X = valueFromZScore(2, L, M, S);
      const z = computeZScore(X, L, M, S);
      expect(z).toBeCloseTo(2, 4);
    });

    it("Z-score = -2 SD saat X = M * (1 + L*S*(-2))^(1/L)", () => {
      const L = -0.1716;
      const M = 10.151;
      const S = 0.1088;
      const X = valueFromZScore(-2, L, M, S);
      const z = computeZScore(X, L, M, S);
      expect(z).toBeCloseTo(-2, 4);
    });

    it("Z-score = +3 SD dan -3 SD", () => {
      const L = -0.1716;
      const M = 10.151;
      const S = 0.1088;
      const X3 = valueFromZScore(3, L, M, S);
      expect(computeZScore(X3, L, M, S)).toBeCloseTo(3, 4);
      const Xn3 = valueFromZScore(-3, L, M, S);
      expect(computeZScore(Xn3, L, M, S)).toBeCloseTo(-3, 4);
    });

    it("L = 0 (log transform) - rumus Z = ln(X/M)/S", () => {
      // Untuk LFA, L = 1, bukan 0. Tapi mari uji secara matematis.
      // Untuk L = 0: Z = ln(X/M) / S
      const M = 75.0;
      const S = 0.04;
      const X = 75.0 * Math.exp(S * 2); // X untuk Z = 2
      const z = computeZScore(X, 0, M, S);
      expect(z).toBeCloseTo(2, 4);
    });
  });

  describe("calculateAge (perhitungan umur)", () => {
    it("Umur 0 hari saat lahir", () => {
      const age = calculateAge("2024-01-15", "2024-01-15");
      expect(age.totalDays).toBe(0);
      expect(age.years).toBe(0);
      expect(age.months).toBe(0);
      expect(age.days).toBe(0);
    });

    it("Umur 1 bulan", () => {
      const age = calculateAge("2024-01-15", "2024-02-15");
      expect(age.years).toBe(0);
      expect(age.months).toBe(1);
      expect(age.days).toBe(0);
    });

    it("Umur 2 tahun 4 bulan", () => {
      const age = calculateAge("2024-04-25", "2026-08-25");
      expect(age.years).toBe(2);
      expect(age.months).toBe(4);
      // Total bulan (decimal) mendekati 28 (sedikit kurang karena 4 bulan = 122 hari, bukan 121.75)
      expect(age.totalMonths).toBeGreaterThan(27.5);
      expect(age.totalMonths).toBeLessThan(28.5);
    });

    it("Format usia Indonesia", () => {
      const age = calculateAge("2024-04-25", "2026-08-25");
      const formatted = formatAge(age);
      expect(formatted).toContain("tahun");
      expect(formatted).toContain("bulan");
    });

    it("Penanganan tahun kabisat", () => {
      const age = calculateAge("2024-02-28", "2024-03-01");
      expect(age.days).toBe(2); // 2024 adalah tahun kabisat
    });
  });

  describe("validateInput (validasi input)", () => {
    const validInput: ChildInput = {
      nama: "Budi",
      jenisKelamin: "L",
      tanggalLahir: "2024-04-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 12.5,
      panjangTinggiBadan: 89,
      jenisPengukuran: "tinggi",
    };

    it("Input valid -> tidak ada error", () => {
      const errors = validateInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it("Nama kosong -> error", () => {
      const errors = validateInput({ ...validInput, nama: "" });
      expect(errors.some((e) => e.includes("Nama"))).toBe(true);
    });

    it("Berat badan negatif -> error", () => {
      const errors = validateInput({ ...validInput, beratBadan: -5 });
      expect(errors.some((e) => e.includes("Berat badan"))).toBe(true);
    });

    it("Berat badan 0 -> error", () => {
      const errors = validateInput({ ...validInput, beratBadan: 0 });
      expect(errors.some((e) => e.includes("Berat badan"))).toBe(true);
    });

    it("Berat badan > 60 kg -> error", () => {
      const errors = validateInput({ ...validInput, beratBadan: 100 });
      expect(errors.some((e) => e.includes("Berat badan"))).toBe(true);
    });

    it("Tanggal ukur sebelum tanggal lahir -> error", () => {
      const errors = validateInput({
        ...validInput,
        tanggalUkur: "2023-01-01",
      });
      // Case-insensitive match
      const hasError = errors.some((e) =>
        e.toLowerCase().includes("tanggal pengukuran tidak boleh sebelum")
      );
      expect(hasError).toBe(true);
    });

    it("Tinggi badan tidak realistis -> error", () => {
      const errors = validateInput({ ...validInput, panjangTinggiBadan: 5 });
      expect(errors.some((e) => e.includes("Panjang/tinggi"))).toBe(true);
    });
  });

  describe("calculateNutritionStatus (perhitungan status gizi)", () => {
    it("Anak normal 28 bulan laki-laki", () => {
      // Budi: 28 bulan, laki-laki, BB 12.5 kg, TB 89 cm
      const input: ChildInput = {
        nama: "Budi",
        jenisKelamin: "L",
        tanggalLahir: "2024-04-25",
        tanggalUkur: "2026-08-25",
        beratBadan: 12.5,
        panjangTinggiBadan: 89,
        jenisPengukuran: "tinggi",
      };
      const result = calculateNutritionStatus(input);
      expect(result.results.length).toBeGreaterThan(0);
      // Anak normal - tidak ada masalah gizi
      const bbu = result.results.find((r) => r.indicator === "BB/U");
      expect(bbu).toBeDefined();
      expect(bbu!.zScore).not.toBeNull();
      // Z-score untuk anak dengan BB 12.5 kg di usia 28 bulan harus dekat median (sekitar -0.5)
      expect(bbu!.zScore!).toBeGreaterThan(-2);
      expect(bbu!.zScore!).toBeLessThan(2);
    });

    it("Anak usia 7 tahun menggunakan indikator yang sesuai (5-19 tahun)", () => {
      // Anak usia 7 tahun = 84 bulan (pasti > 60 bulan)
      const input: ChildInput = {
        nama: "Anak 7 Tahun",
        jenisKelamin: "L",
        tanggalLahir: "2019-08-25",
        tanggalUkur: "2026-08-25",
        beratBadan: 23.0,
        panjangTinggiBadan: 122,
        jenisPengukuran: "tinggi",
      };
      const result = calculateNutritionStatus(input);
      expect(result.age.totalMonths).toBeGreaterThan(60);
      // Untuk usia > 60 bulan, indikator TB/U dan IMT/U yang aktif
      const tbu = result.results.find((r) => r.indicator === "TB/U");
      expect(tbu).toBeDefined();
      const imtu = result.results.find((r) => r.indicator === "IMT/U");
      expect(imtu).toBeDefined();
      // BB/U dan BB/TB tidak tersedia untuk >60 bulan
      const bbu = result.results.find((r) => r.indicator === "BB/U");
      expect(bbu).toBeUndefined();
      const bbtb = result.results.find((r) => r.indicator === "BB/TB");
      expect(bbtb).toBeUndefined();
    });

    it("Bayi baru lahir (usia 0 bulan)", () => {
      const input: ChildInput = {
        nama: "Bayi Baru Lahir",
        jenisKelamin: "P",
        tanggalLahir: "2026-08-25",
        tanggalUkur: "2026-08-25",
        beratBadan: 3.2,
        panjangTinggiBadan: 49,
        jenisPengukuran: "panjang",
      };
      const result = calculateNutritionStatus(input);
      expect(result.results.length).toBeGreaterThan(0);
      const bbu = result.results.find((r) => r.indicator === "BB/U");
      expect(bbu).toBeDefined();
      // Bayi baru lahir normal: BB ~3.2 kg
      expect(bbu!.statusKey).toBe("normal");
    });

    it("Anak sangat kurus (Z < -3 pada BB/TB)", () => {
      // Untuk Z ~ -3.2 pada BB/TB boys 89 cm (M ~ 14.6 kg):
      // X = M * (1 + L*S*Z)^(1/L) = 14.6 * (1 + (-0.3521)*0.1227*(-3.2))^(1/(-0.3521))
      // ≈ 14.6 * 0.685 ≈ 10.0 kg
      const input: ChildInput = {
        nama: "Anak Sangat Kurus",
        jenisKelamin: "L",
        tanggalLahir: "2024-04-25",
        tanggalUkur: "2026-08-25",
        beratBadan: 10.0, // Sangat kurus (Z ~ -3.2)
        panjangTinggiBadan: 89,
        jenisPengukuran: "tinggi",
      };
      const result = calculateNutritionStatus(input);
      const wfh = result.results.find((r) => r.indicator === "BB/TB");
      expect(wfh).toBeDefined();
      expect(wfh!.zScore).not.toBeNull();
      expect(wfh!.zScore!).toBeLessThan(-3);
      expect(wfh!.statusKey).toBe("sangat-kurus");
    });
  });

  describe("classifyStatus (klasifikasi status gizi)", () => {
    it("BB/U klasifikasi normal", () => {
      expect(classifyStatus("BB/U", 0)).toBe("normal");
      expect(classifyStatus("BB/U", -1)).toBe("normal");
      expect(classifyStatus("BB/U", 1)).toBe("normal");
    });

    it("BB/U klasifikasi kurang (Z < -2)", () => {
      expect(classifyStatus("BB/U", -2.5)).toBe("kurang");
      expect(classifyStatus("BB/U", -2.99)).toBe("kurang");
    });

    it("BB/U klasifikasi sangat kurang (Z < -3)", () => {
      expect(classifyStatus("BB/U", -3.5)).toBe("sangat-kurang");
    });

    it("TB/U klasifikasi stunting", () => {
      expect(classifyStatus("TB/U", -2.5)).toBe("pendek");
      expect(classifyStatus("TB/U", -3.5)).toBe("sangat-pendek");
    });

    it("BB/TB klasifikasi kurus/gemuk", () => {
      expect(classifyStatus("BB/TB", -2.5)).toBe("kurus");
      expect(classifyStatus("BB/TB", -3.5)).toBe("sangat-kurus");
      expect(classifyStatus("BB/TB", 1.5)).toBe("risiko");
      expect(classifyStatus("BB/TB", 2.5)).toBe("gemuk");
    });

    it("IMT/U klasifikasi", () => {
      expect(classifyStatus("IMT/U", -2.5)).toBe("kurus");
      expect(classifyStatus("IMT/U", 1.5)).toBe("risiko");
      expect(classifyStatus("IMT/U", 2.5)).toBe("gemuk");
    });
  });

  describe("valueFromZScore (invers LMS)", () => {
    it("Median (Z=0) mengembalikan M", () => {
      const X = valueFromZScore(0, -0.1716, 10, 0.1088);
      expect(X).toBeCloseTo(10, 5);
    });

    it("Round-trip: Z -> X -> Z konsisten", () => {
      const L = -0.1716;
      const M = 12.0;
      const S = 0.11;
      for (const z of [-3, -2, -1, 0, 1, 2, 3]) {
        const X = valueFromZScore(z, L, M, S);
        const zBack = computeZScore(X, L, M, S);
        expect(zBack).toBeCloseTo(z, 4);
      }
    });
  });
});
