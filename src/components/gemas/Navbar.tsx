"use client";

import { useState, useEffect } from "react";
import { Menu, X, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGemasStore, type ViewKey } from "@/lib/gemas/store";

const NAV_ITEMS: { key: ViewKey; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "cek-status-gizi", label: "Cek Status Gizi" },
  { key: "mp-asi", label: "MP-ASI" },
  { key: "makan-anak", label: "Makan Anak" },
  { key: "video-edukasi", label: "Video dan Media Edukasi" },
  { key: "hubungi-ahli", label: "Hubungi Ahli Gizi" },
  { key: "tentang", label: "Tentang GEMAS" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentView, setView } = useGemasStore();

  // Track visit for admin analytics (localStorage based)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("gemas-analytics-stats");
      let stats: any = stored ? JSON.parse(stored) : {
        totalVisits: 0,
        uniqueDays: [],
        firstVisit: "",
        lastVisit: "",
        visitsByPage: {},
        visitsByBrowser: {},
        visitsByDevice: {},
        visitHistory: [],
      };

      // Convert uniqueDays back to array if it's not
      if (!Array.isArray(stats.uniqueDays)) {
        stats.uniqueDays = [];
      }

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      // Get browser info
      const ua = navigator.userAgent;
      let browser = "Unknown";
      let device = "Desktop";
      if (ua.includes("Edg/")) browser = "Microsoft Edge";
      else if (ua.includes("Chrome/")) browser = "Google Chrome";
      else if (ua.includes("Firefox/")) browser = "Mozilla Firefox";
      else if (ua.includes("Safari/")) browser = "Apple Safari";
      if (/Mobi|Android/i.test(ua)) device = "Mobile";
      else if (/iPad|Tablet/i.test(ua)) device = "Tablet";

      // Determine page name
      const pageName = currentView === "home" ? "Beranda" : currentView;

      // Update stats
      stats.totalVisits = (stats.totalVisits || 0) + 1;
      if (!stats.uniqueDays.includes(todayStr)) {
        stats.uniqueDays.push(todayStr);
      }
      if (!stats.firstVisit) stats.firstVisit = now.toISOString();
      stats.lastVisit = now.toISOString();
      stats.visitsByPage = stats.visitsByPage || {};
      stats.visitsByPage[pageName] = (stats.visitsByPage[pageName] || 0) + 1;
      stats.visitsByBrowser = stats.visitsByBrowser || {};
      stats.visitsByBrowser[browser] = (stats.visitsByBrowser[browser] || 0) + 1;
      stats.visitsByDevice = stats.visitsByDevice || {};
      stats.visitsByDevice[device] = (stats.visitsByDevice[device] || 0) + 1;
      stats.visitHistory = stats.visitHistory || [];
      stats.visitHistory.push({
        timestamp: now.toISOString(),
        page: pageName,
        userAgent: browser,
      });
      // Keep only last 50 visits
      if (stats.visitHistory.length > 50) {
        stats.visitHistory = stats.visitHistory.slice(-50);
      }

      localStorage.setItem("gemas-analytics-stats", JSON.stringify(stats));
    } catch (e) {
      // Silently fail - don't break the UI
    }
  }, [currentView]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (key: ViewKey) => {
    setView(key);
    setIsOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-green-100"
          : "bg-white/80 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 group flex-shrink-0"
            aria-label="GEMAS Beranda"
          >
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="h-5 w-5 text-white" fill="white" />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                <Activity className="h-2.5 w-2.5 text-amber-900" strokeWidth={3} />
              </span>
            </div>
            <div className="text-left leading-tight">
              <div className="font-heading text-xl font-extrabold text-green-700">
                GEMAS
              </div>
              <div className="text-[10px] text-muted-foreground hidden sm:block font-medium">
                Gerakan Edukasi Makanan Anak Sehat
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center" aria-label="Navigasi utama">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item.key)}
                className={cn(
                  "px-2.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  currentView === item.key
                    ? "bg-green-100 text-green-700"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA button (desktop) */}
          <div className="hidden xl:block flex-shrink-0">
            <Button
              size="sm"
              onClick={() => handleNav("cek-status-gizi")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all rounded-full px-4"
            >
              Cek Status Gizi Anak
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="xl:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-green-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="xl:hidden border-t border-green-100 bg-white shadow-lg animate-fade-in">
          <nav
            className="mx-auto max-w-7xl px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto"
            aria-label="Navigasi mobile"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item.key)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  currentView === item.key
                    ? "bg-green-100 text-green-700"
                    : "text-gray-700 hover:bg-green-50"
                )}
              >
                {item.label}
              </button>
            ))}
            <Button
              size="sm"
              onClick={() => handleNav("cek-status-gizi")}
              className="w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
            >
              Cek Status Gizi Anak
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
