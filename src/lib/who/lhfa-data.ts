/**
 * WHO Child Growth Standards - Length/Height-for-Age (PB/U, TB/U) 0-60 months
 *
 * Sumber: WHO Child Growth Standards (2006)
 *  - lhfa_boys_0-to-2-years_zscores.txt  (Length-for-age, recumbent, 0-23m)
 *  - lhfa_boys_2-to-5-years_zscores.txt  (Height-for-age, standing, 24-60m)
 *  - lhfa_girls_0-to-2-years_zscores.txt
 *  - lhfa_girls_2-to-5-years_zscores.txt
 *
 * Catatan WHO:
 *  - Anak <24 bulan diukur dalam posisi telentang (Panjang Badan / Length)
 *  - Anak >=24 bulan diukur dalam posisi berdiri (Tinggi Badan / Height)
 *  - Standar WHO berbeda untuk length vs height (selisih ~0.7 cm)
 *
 * Rentang valid:
 *  - Boys: 0-60 bulan, PB 45-110 cm / TB 65-120 cm
 *  - Girls: 0-60 bulan, PB 45-110 cm / TB 65-120 cm
 *
 * Pada semua titik umur, nilai L untuk LHFA adalah 1.0 (konstan),
 * sehingga rumus Z = ((X/M)^1 - 1) / (1 * S) = (X/M - 1) / S
 */

import { LmsPoint } from "./wfa-data";

/** Boys Length-for-age (recumbent) 0-23 bulan */
export const LFA_BOYS: LmsPoint[] = [
  { month: 0, L: 1, M: 49.1548, S: 0.03642 },
  { month: 1, L: 1, M: 53.6756, S: 0.03492 },
  { month: 2, L: 1, M: 57.1083, S: 0.03404 },
  { month: 3, L: 1, M: 59.9016, S: 0.03350 },
  { month: 4, L: 1, M: 62.1432, S: 0.03313 },
  { month: 5, L: 1, M: 64.0352, S: 0.03287 },
  { month: 6, L: 1, M: 65.6873, S: 0.03270 },
  { month: 7, L: 1, M: 67.1725, S: 0.03258 },
  { month: 8, L: 1, M: 68.5220, S: 0.03250 },
  { month: 9, L: 1, M: 69.7622, S: 0.03243 },
  { month: 10, L: 1, M: 70.9126, S: 0.03239 },
  { month: 11, L: 1, M: 71.9833, S: 0.03237 },
  { month: 12, L: 1, M: 72.9843, S: 0.03235 },
  { month: 13, L: 1, M: 73.9254, S: 0.03235 },
  { month: 14, L: 1, M: 74.8149, S: 0.03237 },
  { month: 15, L: 1, M: 75.6602, S: 0.03240 },
  { month: 16, L: 1, M: 76.4672, S: 0.03243 },
  { month: 17, L: 1, M: 77.2410, S: 0.03247 },
  { month: 18, L: 1, M: 77.9858, S: 0.03252 },
  { month: 19, L: 1, M: 78.7046, S: 0.03257 },
  { month: 20, L: 1, M: 79.4001, S: 0.03262 },
  { month: 21, L: 1, M: 80.0742, S: 0.03267 },
  { month: 22, L: 1, M: 80.7289, S: 0.03272 },
  { month: 23, L: 1, M: 81.3656, S: 0.03277 },
];

/** Boys Height-for-age (standing) 24-60 bulan */
export const HFA_BOYS: LmsPoint[] = [
  { month: 24, L: 1, M: 82.0983, S: 0.03283 },
  { month: 25, L: 1, M: 82.7480, S: 0.03288 },
  { month: 26, L: 1, M: 83.3854, S: 0.03294 },
  { month: 27, L: 1, M: 84.0103, S: 0.03299 },
  { month: 28, L: 1, M: 84.6233, S: 0.03305 },
  { month: 29, L: 1, M: 85.2247, S: 0.03310 },
  { month: 30, L: 1, M: 85.8153, S: 0.03316 },
  { month: 31, L: 1, M: 86.3953, S: 0.03321 },
  { month: 32, L: 1, M: 86.9652, S: 0.03327 },
  { month: 33, L: 1, M: 87.5254, S: 0.03332 },
  { month: 34, L: 1, M: 88.0760, S: 0.03338 },
  { month: 35, L: 1, M: 88.6177, S: 0.03344 },
  { month: 36, L: 1, M: 89.1507, S: 0.03349 },
  { month: 37, L: 1, M: 89.6754, S: 0.03355 },
  { month: 38, L: 1, M: 90.1919, S: 0.03361 },
  { month: 39, L: 1, M: 90.7005, S: 0.03366 },
  { month: 40, L: 1, M: 91.2014, S: 0.03372 },
  { month: 41, L: 1, M: 91.6950, S: 0.03378 },
  { month: 42, L: 1, M: 92.1815, S: 0.03383 },
  { month: 43, L: 1, M: 92.6613, S: 0.03389 },
  { month: 44, L: 1, M: 93.1347, S: 0.03395 },
  { month: 45, L: 1, M: 93.6020, S: 0.03401 },
  { month: 46, L: 1, M: 94.0636, S: 0.03407 },
  { month: 47, L: 1, M: 94.5196, S: 0.03412 },
  { month: 48, L: 1, M: 94.9704, S: 0.03418 },
  { month: 49, L: 1, M: 95.4162, S: 0.03424 },
  { month: 50, L: 1, M: 95.8573, S: 0.03430 },
  { month: 51, L: 1, M: 96.2940, S: 0.03436 },
  { month: 52, L: 1, M: 96.7273, S: 0.03442 },
  { month: 53, L: 1, M: 97.1575, S: 0.03448 },
  { month: 54, L: 1, M: 97.5846, S: 0.03455 },
  { month: 55, L: 1, M: 98.0089, S: 0.03461 },
  { month: 56, L: 1, M: 98.4306, S: 0.03467 },
  { month: 57, L: 1, M: 98.8498, S: 0.03473 },
  { month: 58, L: 1, M: 99.2667, S: 0.03480 },
  { month: 59, L: 1, M: 99.6814, S: 0.03486 },
  { month: 60, L: 1, M: 100.0940, S: 0.03492 },
];

/** Girls Length-for-age (recumbent) 0-23 bulan */
export const LFA_GIRLS: LmsPoint[] = [
  { month: 0, L: 1, M: 48.5890, S: 0.03678 },
  { month: 1, L: 1, M: 52.9978, S: 0.03538 },
  { month: 2, L: 1, M: 56.3951, S: 0.03453 },
  { month: 3, L: 1, M: 59.1432, S: 0.03402 },
  { month: 4, L: 1, M: 61.4204, S: 0.03367 },
  { month: 5, L: 1, M: 63.3745, S: 0.03343 },
  { month: 6, L: 1, M: 65.1118, S: 0.03327 },
  { month: 7, L: 1, M: 66.6857, S: 0.03316 },
  { month: 8, L: 1, M: 68.1313, S: 0.03308 },
  { month: 9, L: 1, M: 69.4713, S: 0.03303 },
  { month: 10, L: 1, M: 70.7216, S: 0.03299 },
  { month: 11, L: 1, M: 71.8939, S: 0.03298 },
  { month: 12, L: 1, M: 73.0000, S: 0.03297 },
  { month: 13, L: 1, M: 74.0467, S: 0.03297 },
  { month: 14, L: 1, M: 75.0422, S: 0.03298 },
  { month: 15, L: 1, M: 75.9926, S: 0.03300 },
  { month: 16, L: 1, M: 76.9037, S: 0.03303 },
  { month: 17, L: 1, M: 77.7796, S: 0.03307 },
  { month: 18, L: 1, M: 78.6241, S: 0.03311 },
  { month: 19, L: 1, M: 79.4400, S: 0.03316 },
  { month: 20, L: 1, M: 80.2298, S: 0.03321 },
  { month: 21, L: 1, M: 80.9961, S: 0.03327 },
  { month: 22, L: 1, M: 81.7406, S: 0.03333 },
  { month: 23, L: 1, M: 82.4651, S: 0.03340 },
];

/** Girls Height-for-age (standing) 24-60 bulan */
export const HFA_GIRLS: LmsPoint[] = [
  { month: 24, L: 1, M: 83.2026, S: 0.03347 },
  { month: 25, L: 1, M: 83.8759, S: 0.03353 },
  { month: 26, L: 1, M: 84.5414, S: 0.03360 },
  { month: 27, L: 1, M: 85.1993, S: 0.03366 },
  { month: 28, L: 1, M: 85.8496, S: 0.03373 },
  { month: 29, L: 1, M: 86.4924, S: 0.03380 },
  { month: 30, L: 1, M: 87.1278, S: 0.03387 },
  { month: 31, L: 1, M: 87.7558, S: 0.03393 },
  { month: 32, L: 1, M: 88.3764, S: 0.03400 },
  { month: 33, L: 1, M: 88.9898, S: 0.03407 },
  { month: 34, L: 1, M: 89.5961, S: 0.03413 },
  { month: 35, L: 1, M: 90.1954, S: 0.03420 },
  { month: 36, L: 1, M: 90.7879, S: 0.03427 },
  { month: 37, L: 1, M: 91.3738, S: 0.03433 },
  { month: 38, L: 1, M: 91.9533, S: 0.03440 },
  { month: 39, L: 1, M: 92.5266, S: 0.03446 },
  { month: 40, L: 1, M: 93.0940, S: 0.03453 },
  { month: 41, L: 1, M: 93.6556, S: 0.03459 },
  { month: 42, L: 1, M: 94.2117, S: 0.03466 },
  { month: 43, L: 1, M: 94.7625, S: 0.03472 },
  { month: 44, L: 1, M: 95.3082, S: 0.03479 },
  { month: 45, L: 1, M: 95.8490, S: 0.03485 },
  { month: 46, L: 1, M: 96.3850, S: 0.03492 },
  { month: 47, L: 1, M: 96.9165, S: 0.03498 },
  { month: 48, L: 1, M: 97.4436, S: 0.03505 },
  { month: 49, L: 1, M: 97.9665, S: 0.03511 },
  { month: 50, L: 1, M: 98.4853, S: 0.03518 },
  { month: 51, L: 1, M: 99.0001, S: 0.03524 },
  { month: 52, L: 1, M: 99.5111, S: 0.03531 },
  { month: 53, L: 1, M: 100.0183, S: 0.03537 },
  { month: 54, L: 1, M: 100.5219, S: 0.03543 },
  { month: 55, L: 1, M: 101.0219, S: 0.03550 },
  { month: 56, L: 1, M: 101.5186, S: 0.03556 },
  { month: 57, L: 1, M: 102.0119, S: 0.03562 },
  { month: 58, L: 1, M: 102.5020, S: 0.03569 },
  { month: 59, L: 1, M: 102.9890, S: 0.03575 },
  { month: 60, L: 1, M: 103.4730, S: 0.03581 },
];
