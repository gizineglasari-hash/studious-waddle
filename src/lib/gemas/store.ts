"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewKey =
  | "home"
  | "cek-status-gizi"
  | "mp-asi"
  | "makan-anak"
  | "video-edukasi"
  | "hubungi-ahli"
  | "tentang"
  | "admin-analytics"; // hidden admin view (access via Ctrl+Shift+A or #admin-gemas-tersembunyi)

export interface MeasurementRecord {
  id: string;
  nama: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  tanggalUkur: string;
  beratBadan: number;
  panjangTinggiBadan: number;
  jenisPengukuran: "panjang" | "tinggi";
  ageLabel: string;
  bmi: number;
  results: {
    indicator: string;
    zScore: number | null;
    status: string;
    statusKey: string;
  }[];
  overallStatus: string;
  overallStatusKey: string;
  createdAt: string;
}

interface GemasState {
  currentView: ViewKey;
  history: MeasurementRecord[];
  setView: (view: ViewKey) => void;
  addMeasurement: (record: MeasurementRecord) => void;
  removeMeasurement: (id: string) => void;
  clearHistory: () => void;
}

export const useGemasStore = create<GemasState>()(
  persist(
    (set) => ({
      currentView: "home",
      history: [],
      setView: (view) => {
        set({ currentView: view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      addMeasurement: (record) =>
        set((state) => ({
          history: [record, ...state.history].slice(0, 100), // simpan maks 100
        })),
      removeMeasurement: (id) =>
        set((state) => ({
          history: state.history.filter((r) => r.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "gemas-storage",
      partialize: (state) => ({ history: state.history }),
    }
  )
);
