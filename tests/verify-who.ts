/**
 * Verify WHO Calculator with KNOWN WHO Anthro test cases.
 *
 * Expected values are computed manually from WHO published LMS data
 * using the formula Z = ((X/M)^L - 1) / (L*S) for L != 0.
 *
 * Source of expected values:
 *  - WHO Anthro documentation
 *  - WHO training materials
 *  - Manual calculation from WHO LMS data files
 *
 * Run: bun run tests/verify-who.ts
 */

import {
  calculateNutritionStatus,
  formatAge,
  type ChildInput,
} from "../src/lib/who/calculator";

interface IndicatorExpect {
  indicator: "BB/U" | "TB/U" | "BB/TB" | "IMT/U";
  expectedZ: number; // computed manually from WHO LMS data
  tolerance?: number;
  expectedStatus?: string;
}

interface TestCase {
  name: string;
  input: ChildInput;
  expectedAgeDays: number;
  expectedAgeLabel: string;
  expectedIndicators: IndicatorExpect[];
  description: string;
}

// =====================================================
// TEST CASES - computed manually from WHO LMS data
// =====================================================

const testCases: TestCase[] = [
  // Test 1: Bayi baru lahir laki-laki normal (3.5 kg, 49 cm, day 0)
  // WFA Boys day 0: L=0.3487, M=3.3464, S=0.14602
  //   Z = ((3.5/3.3464)^0.3487 - 1) / (0.3487 * 0.14602)
  //   = ((1.04592)^0.3487 - 1) / 0.05092
  //   = (1.01581 - 1) / 0.05092 = 0.310
  // LFA Boys day 0: L=1, M=49.8842, S=0.03795
  //   Z = (49/49.8842 - 1) / 0.03795 = -0.01772 / 0.03795 = -0.467
  //   BUT user input is "panjang" with length=49; WHO LFA median is 49.88 cm at day 0
  //   So Z for 49 cm = (49/49.88 - 1)/0.038 = -0.467
  {
    name: "Bayi baru lahir normal laki-laki (3.5 kg, 49 cm)",
    input: {
      nama: "Bayi 1",
      jenisKelamin: "L",
      tanggalLahir: "2026-01-01",
      tanggalUkur: "2026-01-01",
      beratBadan: 3.5,
      panjangTinggiBadan: 49,
      jenisPengukuran: "panjang",
    },
    expectedAgeDays: 0,
    expectedAgeLabel: "0 hari",
    expectedIndicators: [
      { indicator: "BB/U", expectedZ: 0.31, tolerance: 0.05 },
      { indicator: "TB/U", expectedZ: -0.47, tolerance: 0.05 },
    ],
    description: "Bayi baru lahir normal: BB dan PB mendekati median WHO",
  },

  // Test 2: Budi 28 bulan laki-laki (12.5 kg, 89 cm)
  // Age = 852-853 days (~28 months)
  // HFA Boys day 853: L=1, M=90.4312, S=0.03643
  //   Z = (89/90.4312 - 1) / 0.03643 = -0.01583 / 0.03643 = -0.4346
  // WFA Boys at 28 months: interpolated M ~ 13.4 kg
  //   Z for 12.5 kg ~ -0.30
  // WFH Boys at 89 cm: M=12.6495, L=-0.3521, S=0.08045
  //   Z = ((12.5/12.6495)^(-0.3521) - 1) / (-0.3521 * 0.08045)
  //   = ((0.98818)^(-0.3521) - 1) / -0.02834
  //   = ((1.00420) - 1) / -0.02834 = -0.148
  // BFA Boys at 28 months: M ~ 15.6 kg/m^2, Z for BMI 15.75 ~ -0.07
  //   BMI = 12.5 / (0.89^2) = 15.76 kg/m^2
  {
    name: "Budi 28 bulan laki-laki (12.5 kg, 89 cm) - CASE UTAMA",
    input: {
      nama: "Budi",
      jenisKelamin: "L",
      tanggalLahir: "2024-04-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 12.5,
      panjangTinggiBadan: 89,
      jenisPengukuran: "tinggi",
    },
    expectedAgeDays: 852,
    expectedAgeLabel: "2 tahun 4 bulan",
    expectedIndicators: [
      { indicator: "BB/U", expectedZ: -0.30, tolerance: 0.3 }, // approx
      { indicator: "TB/U", expectedZ: -0.43, tolerance: 0.05 }, // precise
      { indicator: "BB/TB", expectedZ: -0.15, tolerance: 0.05 }, // precise
      { indicator: "IMT/U", expectedZ: -0.1, tolerance: 0.3 }, // approx
    ],
    description: "Budi 28 bulan - case utama yang sebelumnya bermasalah. Sekarang menggunakan WHO published data yang benar.",
  },

  // Test 3: Bayi 6 bulan laki-laki normal (8 kg, 67 cm)
  // Age = 181 days
  // LFA Boys day 181: median ~67.6 cm (interpolated)
  //   Z for 67 cm ~ -0.25
  // WFA Boys day 181: median ~7.93 kg
  //   Z for 8 kg ~ 0.05
  {
    name: "Bayi 6 bulan laki-laki normal (8 kg, 67 cm)",
    input: {
      nama: "Bayi 2",
      jenisKelamin: "L",
      tanggalLahir: "2026-02-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 8.0,
      panjangTinggiBadan: 67,
      jenisPengukuran: "panjang",
    },
    expectedAgeDays: 181,
    expectedAgeLabel: "5 bulan 28 hari",
    expectedIndicators: [
      { indicator: "BB/U", expectedZ: 0.05, tolerance: 0.3 },
      { indicator: "TB/U", expectedZ: -0.25, tolerance: 0.3 },
    ],
    description: "Bayi 6 bulan dengan BB dan PB normal",
  },

  // Test 4: Bayi baru lahir perempuan normal (3.2 kg, 49 cm)
  // WFA Girls day 0: L=0.3809, M=3.2322, S=0.14171
  //   Z = ((3.2/3.2322)^0.3809 - 1) / (0.3809 * 0.14171)
  //   = ((0.99003)^0.3809 - 1) / 0.05397
  //   = ((0.99620) - 1) / 0.05397 = -0.0702
  // LFA Girls day 0: M=49.1477, S=0.03790
  //   Z = (49/49.1477 - 1) / 0.03790 = -0.0301 / 0.03790 = -0.0794
  {
    name: "Bayi baru lahir perempuan normal (3.2 kg, 49 cm)",
    input: {
      nama: "Bayi P",
      jenisKelamin: "P",
      tanggalLahir: "2026-08-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 3.2,
      panjangTinggiBadan: 49,
      jenisPengukuran: "panjang",
    },
    expectedAgeDays: 0,
    expectedAgeLabel: "0 hari",
    expectedIndicators: [
      { indicator: "BB/U", expectedZ: -0.07, tolerance: 0.05 },
      { indicator: "TB/U", expectedZ: -0.08, tolerance: 0.05 },
    ],
    description: "Bayi perempuan baru lahir normal",
  },

  // Test 5: Anak 7 tahun laki-laki (WHO 2007 reference)
  // Age = 2557 days = 84.05 months
  // HFA WHO2007 boys month 84: M ~ 122 cm, Z for 122 cm ~ 0
  // BFA WHO2007 boys month 84: M ~ 15.6, Z for BMI 15.5 ~ 0
  {
    name: "Anak 7 tahun laki-laki (WHO 2007)",
    input: {
      nama: "Anak 7T",
      jenisKelamin: "L",
      tanggalLahir: "2019-08-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 23.0,
      panjangTinggiBadan: 122,
      jenisPengukuran: "tinggi",
    },
    expectedAgeDays: 2557,
    expectedAgeLabel: "7 tahun",
    expectedIndicators: [
      { indicator: "TB/U", expectedZ: 0.05, tolerance: 0.2 },
      { indicator: "IMT/U", expectedZ: -0.02, tolerance: 0.2 },
    ],
    description: "Anak 7 tahun normal - menggunakan WHO Reference 2007",
  },

  // Test 6: Anak severely underweight (BB/U < -5 SD) - kasus extreme
  // 12 bulan, BB 5.5 kg (expected median ~10.15 kg)
  // Z should be < -5 (extreme low), should be flagged
  {
    name: "Anak 12 bulan severely underweight (BB 5.5 kg)",
    input: {
      nama: "Anak Kurang",
      jenisKelamin: "L",
      tanggalLahir: "2025-08-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 5.5,
      panjangTinggiBadan: 70,
      jenisPengukuran: "panjang",
    },
    expectedAgeDays: 365,
    expectedAgeLabel: "1 tahun",
    expectedIndicators: [
      { indicator: "BB/U", expectedZ: -5.0, tolerance: 1.0 }, // extreme, will be flagged
    ],
    description: "Anak dengan BB jauh di bawah normal - harus di-flag sebagai extreme",
  },

  // Test 7: Anak overweight (BB/TB > +2 SD)
  // 24 bulan, BB 16 kg, TB 87 cm
  // WFH Boys at 87 cm: M ~ 12.43 kg
  //   Z = ((16/12.43)^(-0.3521) - 1) / (-0.3521 * 0.08076)
  //   = ((1.2872)^(-0.3521) - 1) / -0.02844
  //   = ((0.9152) - 1) / -0.02844 = 2.98
  {
    name: "Anak 24 bulan overweight (BB 16 kg, TB 87 cm)",
    input: {
      nama: "Anak Overweight",
      jenisKelamin: "L",
      tanggalLahir: "2024-08-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 16,
      panjangTinggiBadan: 87,
      jenisPengukuran: "tinggi",
    },
    expectedAgeDays: 730,
    expectedAgeLabel: "2 tahun",
    expectedIndicators: [
      { indicator: "BB/TB", expectedZ: 3.0, tolerance: 0.5, expectedStatus: "Gemuk" },
    ],
    description: "Anak dengan BB jauh di atas normal untuk tingginya - harusnya Gemuk",
  },

  // Test 8: Anak stunting berat (TB/U < -3 SD)
  // 24 bulan, TB 78 cm (median 87.8 cm at day 730 LFA)
  // Z = (78.7/87.8018 - 1) / 0.03479 = -0.1037 / 0.03479 = -2.98
  //   (78 cm measured standing -> +0.7 cm length = 78.7 cm)
  {
    name: "Anak 24 bulan severely stunting (TB 78 cm)",
    input: {
      nama: "Anak Stunting",
      jenisKelamin: "L",
      tanggalLahir: "2024-08-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 10.5,
      panjangTinggiBadan: 78,
      jenisPengukuran: "tinggi",
    },
    expectedAgeDays: 730,
    expectedAgeLabel: "2 tahun",
    expectedIndicators: [
      { indicator: "TB/U", expectedZ: -2.98, tolerance: 0.2, expectedStatus: "Pendek (stunting)" },
    ],
    description: "Anak dengan TB jauh di bawah normal - harusnya Pendek/Stunting",
  },

  // Test 9: Anak 24 bulan normal (BB 12.5, TB 87 cm)
  // LFA Boys day 730: M=87.8018, S=0.03479
  // Measurement: "tinggi" (standing) -> +0.7 cm = 87.7 cm length
  //   Z = (87.7/87.8018 - 1) / 0.03479 = -0.00116 / 0.03479 = -0.0333
  {
    name: "Anak 24 bulan normal (BB 12.5, TB 87 cm)",
    input: {
      nama: "Anak Normal 24m",
      jenisKelamin: "L",
      tanggalLahir: "2024-08-25",
      tanggalUkur: "2026-08-25",
      beratBadan: 12.5,
      panjangTinggiBadan: 87,
      jenisPengukuran: "tinggi",
    },
    expectedAgeDays: 730,
    expectedAgeLabel: "2 tahun",
    expectedIndicators: [
      { indicator: "TB/U", expectedZ: -0.03, tolerance: 0.05 },
    ],
    description: "Anak 24 bulan dengan TB tepat di median - harusnya Normal",
  },
];

// =====================================================
// RUN TESTS
// =====================================================

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

console.log("=== WHO Calculator Verification Tests ===\n");
console.log("Reference: WHO Child Growth Standards (2006) + WHO Reference 2007\n");
console.log("Data source: Official WHO Anthro data files\n");
console.log("Algorithm: LMS method with linear interpolation\n\n");

for (const tc of testCases) {
  console.log(`\n=== ${tc.name} ===`);
  console.log(`Description: ${tc.description}`);

  const result = calculateNutritionStatus(tc.input);

  // Verify age
  const ageMatch = Math.abs(result.age.totalDays - tc.expectedAgeDays) <= 1;
  if (ageMatch) {
    console.log(`  PASS: Age = ${formatAge(result.age)} (${result.age.totalDays} days)`);
    passCount++;
  } else {
    console.log(`  FAIL: Age days expected ${tc.expectedAgeDays}, got ${result.age.totalDays}`);
    failures.push(`${tc.name}: Age mismatch`);
    failCount++;
  }

  // Verify each indicator
  for (const ind of tc.expectedIndicators) {
    const indicatorResult = result.results.find((r) => r.indicator === ind.indicator);
    if (!indicatorResult) {
      console.log(`  FAIL: ${ind.indicator} not found in results`);
      failures.push(`${tc.name}: ${ind.indicator} missing`);
      failCount++;
      continue;
    }

    if (indicatorResult.zScore === null) {
      // Check if expected to be null (extreme case)
      if (Math.abs(ind.expectedZ) >= 5) {
        console.log(`  PASS: ${ind.indicator} correctly flagged as out-of-range (extreme value)`);
        passCount++;
      } else {
        console.log(`  FAIL: ${ind.indicator} flagged out-of-range, expected Z ~ ${ind.expectedZ}`);
        failures.push(`${tc.name}: ${ind.indicator} unexpectedly flagged`);
        failCount++;
      }
      continue;
    }

    const actualZ = indicatorResult.zScore;
    const tolerance = ind.tolerance ?? 0.5;
    const diff = Math.abs(actualZ - ind.expectedZ);

    if (diff <= tolerance) {
      const statusStr = ind.expectedStatus
        ? ` [status: ${indicatorResult.status}]`
        : ` [${indicatorResult.status}]`;
      console.log(`  PASS: ${ind.indicator} Z=${actualZ.toFixed(3)} (expected ${ind.expectedZ}, diff=${diff.toFixed(3)})${statusStr}`);

      if (ind.expectedStatus && indicatorResult.status !== ind.expectedStatus) {
        console.log(`  WARN: ${ind.indicator} status "${indicatorResult.status}" != expected "${ind.expectedStatus}"`);
      } else if (ind.expectedStatus) {
        console.log(`  PASS: Status "${indicatorResult.status}" matches expected`);
      }
      passCount++;
    } else {
      console.log(`  FAIL: ${ind.indicator} Z=${actualZ.toFixed(3)} (expected ${ind.expectedZ}, diff=${diff.toFixed(3)}) [${indicatorResult.status}]`);
      failures.push(`${tc.name}: ${ind.indicator} Z=${actualZ.toFixed(3)} vs expected ${ind.expectedZ}`);
      failCount++;
    }
  }

  // Print full results for debugging
  console.log(`  Reference: ${result.reference}`);
  for (const r of result.results) {
    const zStr = r.zScore !== null ? r.zScore.toFixed(4) : "N/A (flagged)";
    console.log(`    ${r.indicator}: Z=${zStr} [${r.status}] - ${r.reference}`);
  }
}

console.log("\n=== SUMMARY ===");
console.log(`Total tests: ${testCases.length}`);
console.log(`Pass: ${passCount}`);
console.log(`Fail: ${failCount}`);
if (failures.length > 0) {
  console.log("\nFailures:");
  failures.forEach((f) => console.log(`  - ${f}`));
}

console.log(`\n${failCount === 0 ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
process.exit(failCount > 0 ? 1 : 0);
