"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// =====================================================
// TYPES
// =====================================================

export interface VisitRecord {
  id: string;
  timestamp: string;
  page: string;
  pageLabel: string;
  browser: string;
  device: string;
  os: string;
  screenSize: string;
  language: string;
  timezone: string;
  // Location (from IP API - privacy-friendly, no PII stored)
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  uniqueDays: string[];
  totalPageViews: number;
  firstVisit: string;
  lastVisit: string;
  visitsByPage: Record<string, number>;
  visitsByBrowser: Record<string, number>;
  visitsByDevice: Record<string, number>;
  visitsByOS: Record<string, number>;
  visitsByCountry: Record<string, number>;
  recentVisits: VisitRecord[];
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateId(): string {
  return `visit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/")) return "Google Chrome";
  if (ua.includes("Firefox/")) return "Mozilla Firefox";
  if (ua.includes("Safari/")) return "Apple Safari";
  if (ua.includes("Opera/") || ua.includes("OPR/")) return "Opera";
  return "Unknown";
}

export function detectOS(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
}

export function detectDevice(): string {
  if (typeof navigator === "undefined") return "Desktop";
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "Mobile";
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

export function getScreenSize(): string {
  if (typeof window === "undefined") return "Unknown";
  return `${window.screen.width}x${window.screen.height}`;
}

export function getLanguage(): string {
  if (typeof navigator === "undefined") return "Unknown";
  return navigator.language || "Unknown";
}

export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  } catch {
    return "Unknown";
  }
}

// Map page ViewKey to human-readable label
export function getPageLabel(page: string): string {
  const labels: Record<string, string> = {
    home: "Beranda",
    "cek-status-gizi": "Cek Status Gizi",
    "mp-asi": "MP-ASI",
    "makan-anak": "Makan Anak",
    "video-edukasi": "Video & Media Edukasi",
    "hubungi-ahli": "Hubungi Ahli Gizi",
    tentang: "Tentang Kami",
    login: "Login Pengguna",
    register: "Registrasi",
    "user-dashboard": "Dashboard Pengguna",
    "consultation-form": "Form Konsultasi",
    "consultation-detail": "Detail Konsultasi",
    "admin-login": "Admin Login",
    "admin-dashboard": "Dashboard Admin",
    "admin-consultations": "Daftar Konsultasi",
    "admin-consultation-detail": "Detail Konsultasi Admin",
    "admin-history": "Riwayat Konsultasi",
    "admin-analytics": "Analytics Admin",
    "admin-edit-website": "Edit Website",
    "admin-analytics-pengunjung": "Analytics Pengunjung",
  };
  return labels[page] || page;
}

// =====================================================
// STORE
// =====================================================

interface AnalyticsStoreState {
  stats: AnalyticsStats;
  trackVisit: (page: string) => void;
  clearStats: () => void;
  getStatsForPeriod: (days: number) => Partial<AnalyticsStats>;
}

const EMPTY_STATS: AnalyticsStats = {
  totalVisits: 0,
  uniqueDays: [],
  totalPageViews: 0,
  firstVisit: "",
  lastVisit: "",
  visitsByPage: {},
  visitsByBrowser: {},
  visitsByDevice: {},
  visitsByOS: {},
  visitsByCountry: {},
  recentVisits: [],
};

export const useAnalyticsStore = create<AnalyticsStoreState>()(
  persist(
    (set, get) => ({
      stats: EMPTY_STATS,

      trackVisit: (page) => {
        if (typeof window === "undefined") return;
        if (typeof navigator === "undefined") return;

        try {
          const current = get().stats;
          const now = new Date();
          const todayStr = now.toISOString().split("T")[0];

          const browser = detectBrowser();
          const os = detectOS();
          const device = detectDevice();
          const screenSize = getScreenSize();
          const language = getLanguage();
          const timezone = getTimezone();
          const pageLabel = getPageLabel(page);

          // Create visit record (IP/location fetched async separately)
          const visit: VisitRecord = {
            id: generateId(),
            timestamp: now.toISOString(),
            page,
            pageLabel,
            browser,
            device,
            os,
            screenSize,
            language,
            timezone,
            ip: "Memuat...",
            city: "Memuat...",
            region: "Memuat...",
            country: "Memuat...",
            isp: "Memuat...",
          };

          // Fetch IP info asynchronously
          fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
              const updated = get().stats;
              const visitIdx = updated.recentVisits.findIndex((v) => v.id === visit.id);
              if (visitIdx >= 0) {
                updated.recentVisits[visitIdx] = {
                  ...updated.recentVisits[visitIdx],
                  ip: data.ip || "Tidak tersedia",
                  city: data.city || "Tidak tersedia",
                  region: data.region || "Tidak tersedia",
                  country: data.country_name || "Tidak tersedia",
                  isp: data.org || "Tidak tersedia",
                };
                // Update country stats
                const countryKey = data.country_name || "Unknown";
                updated.visitsByCountry[countryKey] = (updated.visitsByCountry[countryKey] || 0) + 1;
                set({ stats: { ...updated } });
              }
            })
            .catch(() => {
              const updated = get().stats;
              const visitIdx = updated.recentVisits.findIndex((v) => v.id === visit.id);
              if (visitIdx >= 0) {
                updated.recentVisits[visitIdx] = {
                  ...updated.recentVisits[visitIdx],
                  ip: "Tidak tersedia",
                  city: "Tidak tersedia",
                  region: "Tidak tersedia",
                  country: "Tidak tersedia",
                  isp: "Tidak tersedia",
                };
                set({ stats: { ...updated } });
              }
            });

          // Update stats
          const newUniqueDays = current.uniqueDays.includes(todayStr)
            ? current.uniqueDays
            : [...current.uniqueDays, todayStr];

          const newVisitsByPage = { ...current.visitsByPage };
          newVisitsByPage[pageLabel] = (newVisitsByPage[pageLabel] || 0) + 1;

          const newVisitsByBrowser = { ...current.visitsByBrowser };
          newVisitsByBrowser[browser] = (newVisitsByBrowser[browser] || 0) + 1;

          const newVisitsByDevice = { ...current.visitsByDevice };
          newVisitsByDevice[device] = (newVisitsByDevice[device] || 0) + 1;

          const newVisitsByOS = { ...current.visitsByOS };
          newVisitsByOS[os] = (newVisitsByOS[os] || 0) + 1;

          const newRecentVisits = [visit, ...current.recentVisits].slice(0, 100); // Keep last 100

          set({
            stats: {
              totalVisits: current.totalVisits + 1,
              uniqueDays: newUniqueDays,
              totalPageViews: current.totalPageViews + 1,
              firstVisit: current.firstVisit || now.toISOString(),
              lastVisit: now.toISOString(),
              visitsByPage: newVisitsByPage,
              visitsByBrowser: newVisitsByBrowser,
              visitsByDevice: newVisitsByDevice,
              visitsByOS: newVisitsByOS,
              visitsByCountry: current.visitsByCountry,
              recentVisits: newRecentVisits,
            },
          });
        } catch (e) {
          // Silently fail
        }
      },

      clearStats: () => {
        set({ stats: EMPTY_STATS });
      },

      getStatsForPeriod: (days) => {
        const stats = get().stats;
        if (days === 0) return stats; // "Semua"

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const filteredVisits = stats.recentVisits.filter(
          (v) => new Date(v.timestamp) >= cutoff
        );

        const filteredDays = stats.uniqueDays.filter(
          (d) => new Date(d) >= cutoff
        );

        // Recompute aggregated stats from filtered visits
        const visitsByPage: Record<string, number> = {};
        const visitsByBrowser: Record<string, number> = {};
        const visitsByDevice: Record<string, number> = {};
        const visitsByOS: Record<string, number> = {};

        for (const v of filteredVisits) {
          visitsByPage[v.pageLabel] = (visitsByPage[v.pageLabel] || 0) + 1;
          visitsByBrowser[v.browser] = (visitsByBrowser[v.browser] || 0) + 1;
          visitsByDevice[v.device] = (visitsByDevice[v.device] || 0) + 1;
          visitsByOS[v.os] = (visitsByOS[v.os] || 0) + 1;
        }

        return {
          totalVisits: filteredVisits.length,
          uniqueDays: filteredDays,
          totalPageViews: filteredVisits.length,
          firstVisit: filteredVisits[filteredVisits.length - 1]?.timestamp || "",
          lastVisit: filteredVisits[0]?.timestamp || "",
          visitsByPage,
          visitsByBrowser,
          visitsByDevice,
          visitsByOS,
          recentVisits: filteredVisits.slice(0, 10),
        };
      },
    }),
    {
      name: "gemas-analytics-store",
    }
  )
);
