/**
 * WHO Growth Standards - Reference Data Index
 *
 * Semua data referensi WHO yang digunakan oleh calculator GEMAS.
 *
 * Sumber:
 * 1. WHO Child Growth Standards (2006) - untuk anak 0-5 tahun (0-1856 hari)
 *    Diambil dari file resmi WHO Anthro:
 *    - WorldHealthOrganization/mnf-anthro-analyzer-offline (GitHub WHO official)
 *    URL: https://github.com/WorldHealthOrganization/mnf-anthro-analyzer-offline
 *
 * 2. WHO Reference 2007 - untuk anak 5-19 tahun (61-228 bulan)
 *    Sumber referensi data: WHO AnthroPlus
 *
 * Format data: [age_in_days_or_month, L, M, S] atau [cm_x10, L, M, S]
 *   - L = Box-Cox power
 *   - M = median
 *   - S = coefficient of variation
 *
 * Z-score menggunakan LMS:
 *   L != 0: Z = ((X/M)^L - 1) / (L * S)
 *   L = 0:  Z = ln(X/M) / S
 */

// WHO Child Growth Standards 0-5 years (data per HARI)
import { wfa_boys } from "./wfa_boys";
import { wfa_girls } from "./wfa_girls";
export { wfa_boys, wfa_girls };

import { lfa_boys } from "./lfa_boys";
import { lfa_girls } from "./lfa_girls";
export { lfa_boys, lfa_girls };

import { hfa_boys } from "./hfa_boys";
import { hfa_girls } from "./hfa_girls";
export { hfa_boys, hfa_girls };

import { wfl_boys } from "./wfl_boys";
import { wfl_girls } from "./wfl_girls";
export { wfl_boys, wfl_girls };

import { wfh_boys } from "./wfh_boys";
import { wfh_girls } from "./wfh_girls";
export { wfh_boys, wfh_girls };

import { bfa_boys } from "./bfa_boys";
import { bfa_girls } from "./bfa_girls";
export { bfa_boys, bfa_girls };

import { bfa519_boys } from "./bfa519_boys";
import { bfa519_girls } from "./bfa519_girls";
export { bfa519_boys, bfa519_girls };

import { hfa519_boys } from "./hfa519_boys";
import { hfa519_girls } from "./hfa519_girls";
export { hfa519_boys, hfa519_girls };

export type Sex = "L" | "P";
export type MeasurementType = "panjang" | "tinggi";
export type IndicatorKey = "BB/U" | "TB/U" | "BB/TB" | "IMT/U";

/** Tuple format untuk data berbasis umur: [day, L, M, S] atau [month, L, M, S] */
export type AgeLmsTuple = [number, number, number, number];

/** Tuple format untuk data berbasis panjang/tinggi: [cm_x10, L, M, S] */
export type HeightLmsTuple = [number, number, number, number];

export const WHO_REFERENCE_INFO = {
  source_05: "WHO Child Growth Standards (2006)",
  source_519: "WHO Reference 2007 (AnthroPlus)",
  url: "https://www.who.int/tools/child-growth-standards",
  url_519: "https://www.who.int/tools/growth-reference-data-for-5to19-years",
  notes:
    "Data referensi resmi WHO Anthro. Untuk 0-5 tahun, data per HARI (0-1856 hari). Untuk 5-19 tahun, data per BULAN (61-228 bulan).",
};
