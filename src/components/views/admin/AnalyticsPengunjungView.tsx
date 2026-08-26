"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  RefreshCw,
  ExternalLink,
  Activity,
  Hash,
  TrendingUp,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAnalyticsStore, type VisitRecord } from "@/lib/gemas/analytics-store";
import { useGemasStore } from "@/lib/gemas/store";
import { useAuthStore } from "@/lib/gemas/auth-store";

// =====================================================
// CONSTANTS
// =====================================================

const VERCEL_ANALYTICS_URL =
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL ||
  "https://vercel.com/gizineglasari-2010/koniciwa-gemas-gempita/analytics";

const PERIOD_OPTIONS: { label: string; days: number }[] = [
  { label: "Hari Ini", days: 1 },
  { label: "7 Hari", days: 7 },
  { label: "30 Hari", days: 30 },
  { label: "90 Hari", days: 90 },
  { label: "Semua", days: 0 },
];

const DEVICE_COLORS: Record<string, string> = {
  Mobile: "#10b981", // emerald-500
  Tablet: "#22c55e", // green-500
  Desktop: "#84cc16", // lime-500
};

const DEVICE_FALLBACK_COLOR = "#16a34a"; // green-600

// =====================================================
// HELPERS
// =====================================================

function formatDateTime(iso: string): string {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getDeviceIcon(device: string) {
  switch (device) {
    case "Mobile":
      return Smartphone;
    case "Tablet":
      return Tablet;
    default:
      return Monitor;
  }
}

// Display analytics field with proper fallback
// - empty / "Tidak tersedia" -> "Tidak tersedia dari sumber analytics"
// - "Memuat..." -> shown as is (still loading)
// - actual value -> shown as is
function displayField(
  value: string | undefined,
  fallback = "Tidak tersedia dari sumber analytics"
): string {
  if (!value) return fallback;
  if (value === "Tidak tersedia") return fallback;
  return value;
}

// Build a location string from city/region/country
function formatLocation(visit: VisitRecord): string {
  const parts: string[] = [];
  for (const p of [visit.city, visit.region, visit.country]) {
    if (p && p !== "Tidak tersedia" && p !== "Memuat...") {
      parts.push(p);
    }
  }
  if (parts.length === 0) {
    const anyLoading = [visit.city, visit.region, visit.country].some(
      (p) => p === "Memuat..."
    );
    return anyLoading
      ? "Memuat lokasi..."
      : "Tidak tersedia dari sumber analytics";
  }
  return parts.join(", ");
}

function sortEntries(
  record: Record<string, number> | undefined
): [string, number][] {
  if (!record) return [];
  return Object.entries(record).sort((a, b) => b[1] - a[1]);
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  bg,
  text,
  ring,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  bg: string;
  text: string;
  ring: string;
}) {
  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <CardContent className="pt-5 pb-4">
        <div
          className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3 ring-4 ${ring} ring-opacity-30`}
        >
          <Icon className={`h-5 w-5 ${text}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 break-words leading-tight">
          {value}
        </div>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 font-medium leading-tight">
          {label}
        </p>
        {subtitle && (
          <p className="text-[10px] text-gray-400 mt-1 leading-tight">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PeriodButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant={active ? "default" : "outline"}
      className={`rounded-full h-8 px-3 text-xs ${
        active
          ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
          : "border-green-200 text-green-700 hover:bg-green-50"
      }`}
    >
      {children}
    </Button>
  );
}

function DeviceDonut({
  devices,
  total,
}: {
  devices: [string, number][];
  total: number;
}) {
  if (total === 0 || devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        Tidak ada data
      </div>
    );
  }

  let cumulative = 0;
  const segments: string[] = [];
  for (const [name, count] of devices) {
    const percent = (count / total) * 100;
    const color = DEVICE_COLORS[name] || DEVICE_FALLBACK_COLOR;
    if (percent > 0) {
      segments.push(`${color} ${cumulative}% ${cumulative + percent}%`);
      cumulative += percent;
    }
  }
  if (cumulative < 100) {
    segments.push(`#e5e7eb ${cumulative}% 100%`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative h-28 w-28 flex-shrink-0">
        <div
          className="h-full w-full rounded-full shadow-sm"
          style={{
            background: `conic-gradient(${segments.join(", ")})`,
          }}
        />
        <div className="absolute inset-[24%] bg-white rounded-full flex items-center justify-center shadow-inner">
          <div className="text-center">
            <div className="text-xl font-extrabold text-gray-900">{total}</div>
            <div className="text-[10px] text-gray-500 font-medium">total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full space-y-3">
        {devices.map(([name, count]) => {
          const DeviceIcon = getDeviceIcon(name);
          const color = DEVICE_COLORS[name] || DEVICE_FALLBACK_COLOR;
          const percent = ((count / total) * 100).toFixed(1);
          return (
            <div key={name} className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}1a` }}
              >
                <DeviceIcon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {name}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {count} · {percent}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto mb-3 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Memuat data...</p>
      </div>
    </div>
  );
}

function EmptyState({
  message = "Belum ada data kunjungan.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-3">
        <Activity className="h-7 w-7 text-green-400" />
      </div>
      <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function AnalyticsPengunjungView() {
  const setView = useGemasStore((s) => s.setView);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const stats = useAnalyticsStore((s) => s.stats);
  const getStatsForPeriod = useAnalyticsStore((s) => s.getStatsForPeriod);

  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [periodDays, setPeriodDays] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [retryKey, setRetryKey] = useState(0);

  // Hydration guard (zustand persist SSR safety).
  // We intentionally call setState here to synchronize with the external
  // persisted store after first paint. This avoids hydration mismatches
  // because the server render and the first client render produce identical
  // output (the loading state), and only subsequent renders read the
  // persisted data.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date().toISOString());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auth guard - redirect non-admins to admin login
  useEffect(() => {
    if (mounted && !isAdmin) {
      setView("admin-login");
    }
  }, [mounted, isAdmin, setView]);

  // Compute filtered stats based on selected period.
  // The store's getStatsForPeriod never throws (pure read of local state),
  // so we derive the value directly during render.
  const filteredStats = useMemo(() => {
    if (!mounted) return null;
    const result = getStatsForPeriod(periodDays);
    return {
      totalVisits: result.totalVisits ?? 0,
      uniqueDays: result.uniqueDays ?? [],
      totalPageViews: result.totalPageViews ?? 0,
      firstVisit: result.firstVisit ?? "",
      lastVisit: result.lastVisit ?? "",
      visitsByPage: result.visitsByPage ?? {},
      visitsByBrowser: result.visitsByBrowser ?? {},
      visitsByDevice: result.visitsByDevice ?? {},
      recentVisits: result.recentVisits ?? [],
    };
    // retryKey forces recompute when user clicks "Coba lagi"
  }, [mounted, periodDays, stats, getStatsForPeriod, retryKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Brief loading to indicate refresh action
    setTimeout(() => {
      setLastUpdated(new Date().toISOString());
      setRefreshing(false);
    }, 600);
  };

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
    handleRefresh();
  };

  const openVercelAnalytics = () => {
    if (typeof window !== "undefined") {
      window.open(VERCEL_ANALYTICS_URL, "_blank", "noopener,noreferrer");
    }
  };

  // Show loading state during initial hydration
  if (!mounted) {
    return <LoadingState />;
  }

  // Not admin -> redirect (effect above will fire), show fallback
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="text-center">
          <Activity className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Mengalihkan ke halaman login admin...
          </p>
        </div>
      </div>
    );
  }

  // Error state (defensive — won't trigger with current local store).
  // At this point mounted is true and isAdmin is true, so filteredStats
  // being null indicates an unexpected error in the analytics store.
  if (filteredStats === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="text-center max-w-md px-4">
          <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-sm text-gray-700 font-medium mb-1">
            Gagal memuat data analytics.
          </p>
          <p className="text-xs text-gray-500 mb-4">Silakan coba lagi.</p>
          <Button
            onClick={handleRetry}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  // Derived data
  const hasData = filteredStats.totalVisits > 0;
  const recentVisits = filteredStats.recentVisits.slice(0, 10);

  const allPages = sortEntries(filteredStats.visitsByPage);
  const topPages = allPages.slice(0, 10);
  const totalPageViews = allPages.reduce((sum, [, c]) => sum + c, 0) || 1;

  const allBrowsers = sortEntries(filteredStats.visitsByBrowser);
  const totalBrowserViews = allBrowsers.reduce((sum, [, c]) => sum + c, 0) || 1;

  const allDevices = sortEntries(filteredStats.visitsByDevice);
  const totalDeviceViews =
    allDevices.reduce((sum, [, c]) => sum + c, 0) || 0;

  const statCards = [
    {
      key: "visits",
      label: "Total Visits",
      value: filteredStats.totalVisits,
      icon: Users,
      bg: "bg-green-100",
      text: "text-green-700",
      ring: "ring-green-200",
      subtitle: "Total kunjungan tercatat",
    },
    {
      key: "days",
      label: "Hari Aktif",
      value: filteredStats.uniqueDays.length,
      icon: Calendar,
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      ring: "ring-emerald-200",
      subtitle: "Hari berbeda dengan kunjungan",
    },
    {
      key: "pages",
      label: "Halaman Dilihat",
      value: filteredStats.totalPageViews,
      icon: Eye,
      bg: "bg-teal-100",
      text: "text-teal-700",
      ring: "ring-teal-200",
      subtitle: "Total view halaman",
    },
    {
      key: "last",
      label: "Kunjungan Akhir",
      value: filteredStats.lastVisit
        ? formatDateTime(filteredStats.lastVisit)
        : "Belum ada data",
      icon: Clock,
      bg: "bg-lime-100",
      text: "text-lime-700",
      ring: "ring-lime-200",
      subtitle: filteredStats.lastVisit
        ? "Waktu kunjungan terakhir"
        : "Belum ada kunjungan tercatat",
    },
  ];

  const currentPeriodLabel =
    PERIOD_OPTIONS.find((o) => o.days === periodDays)?.label || "Semua";

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <Badge
                variant="secondary"
                className="mb-1.5 bg-green-50 text-green-700 border-green-200 rounded-full"
              >
                <Activity className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                Analytics Pengunjung
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Pantau kunjungan, perangkat, dan aktivitas pengunjung secara
                real-time.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setView("admin-dashboard")}
              variant="outline"
              size="sm"
              className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="rounded-full border-green-200 text-green-700 hover:bg-green-50"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Memuat..." : "Refresh"}
            </Button>
            <Button
              onClick={openVercelAnalytics}
              size="sm"
              className="rounded-full bg-gray-900 hover:bg-gray-800 text-white"
              title="Buka Vercel Analytics Dashboard di tab baru — lihat page views, unik visitors, dan web vitals"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Vercel Analytics
            </Button>
          </div>
        </div>

        {/* Period filter */}
        <Card className="border-0 shadow-md rounded-2xl mb-6 bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Filter Periode
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERIOD_OPTIONS.map((opt) => (
                  <PeriodButton
                    key={opt.days}
                    active={periodDays === opt.days}
                    onClick={() => setPeriodDays(opt.days)}
                  >
                    {opt.label}
                  </PeriodButton>
                ))}
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-gray-500">
                {lastUpdated ? (
                  <>
                    Data terakhir diperbarui:{" "}
                    <span className="font-medium text-gray-700">
                      {formatDateTime(lastUpdated)}
                    </span>
                  </>
                ) : (
                  "Belum dimuat"
                )}
              </p>
              <p className="text-xs text-gray-400">
                Menampilkan data untuk periode:{" "}
                <span className="font-semibold text-green-700">
                  {currentPeriodLabel}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {statCards.map((card) => (
              <StatCard key={card.key} {...card} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl mb-8 bg-white">
            <CardContent className="py-6">
              <EmptyState message="Belum ada data kunjungan" />
            </CardContent>
          </Card>
        )}

        {/* Real-time visitors table */}
        <Card className="border-0 shadow-md rounded-2xl mb-6 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                  Pengunjung Real-time
                </CardTitle>
                <p className="text-xs text-gray-500">
                  10 kunjungan terbaru dengan detail perangkat &amp; lokasi
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentVisits.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto -mx-2 px-2 max-h-96 overflow-y-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left border-b border-gray-200">
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Waktu
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Lokasi
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        IP
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Browser
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Device
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Screen
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Bahasa
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Timezone
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        ISP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((v) => {
                      const DeviceIcon = getDeviceIcon(v.device);
                      return (
                        <tr
                          key={v.id}
                          className="border-b border-gray-100 hover:bg-green-50/40 transition-colors"
                        >
                          <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap text-xs">
                            {formatDateTime(v.timestamp)}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {formatLocation(v)}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs font-mono">
                            {displayField(v.ip)}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {v.browser}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            <span className="inline-flex items-center gap-1">
                              <DeviceIcon className="h-3 w-3 text-gray-400" />
                              {v.device}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs font-mono">
                            {v.screenSize}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {v.language}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {v.timezone}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {displayField(v.isp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages / Browsers / Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Top Pages */}
          <Card className="border-0 shadow-md rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Hash className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Top Halaman
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    10 halaman paling banyak dilihat
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {topPages.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {topPages.map(([page, count], idx) => {
                    const percent = ((count / totalPageViews) * 100).toFixed(1);
                    return (
                      <div key={`${page}-${idx}`}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-5 w-5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                              {page}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 text-[10px] rounded-full"
                            >
                              {count}x
                            </Badge>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {percent}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Browsers */}
          <Card className="border-0 shadow-md rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-teal-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Top Browser
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Distribusi browser pengunjung
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allBrowsers.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {allBrowsers.map(([browser, count], idx) => {
                    const percent = (
                      (count / totalBrowserViews) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={`${browser}-${idx}`}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {browser}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {count}
                            </span>
                            <span className="text-xs text-gray-400 w-10 text-right">
                              {percent}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Devices */}
          <Card className="border-0 shadow-md rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-lime-100 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-lime-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Top Perangkat
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Mobile / Tablet / Desktop
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allDevices.length === 0 ? (
                <EmptyState />
              ) : (
                <DeviceDonut devices={allDevices} total={totalDeviceViews} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 10 Last visits */}
        <Card className="border-0 shadow-md rounded-2xl mb-6 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-gray-900">
                  10 Kunjungan Terakhir
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Riwayat kunjungan paling baru
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentVisits.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        No
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Waktu
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Lokasi
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Browser
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Device
                      </th>
                      <th className="py-2 pr-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">
                        Halaman
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((v, idx) => {
                      const DeviceIcon = getDeviceIcon(v.device);
                      return (
                        <tr
                          key={v.id}
                          className="border-b border-gray-100 hover:bg-green-50/40 transition-colors"
                        >
                          <td className="py-2.5 pr-3 text-gray-500 text-xs font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap text-xs">
                            {formatDateTime(v.timestamp)}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {formatLocation(v)}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            {v.browser}
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            <span className="inline-flex items-center gap-1">
                              <DeviceIcon className="h-3 w-3 text-gray-400" />
                              {v.device}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-gray-700 text-xs">
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 text-[10px] rounded-full"
                            >
                              {v.pageLabel}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vercel Analytics CTA */}
        <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Vercel Analytics Dashboard
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mt-0.5 max-w-md">
                    Lihat analitik mendalam — page views, unik visitors, web
                    vitals, dan demografi pengunjung di dashboard Vercel.
                  </p>
                </div>
              </div>
              <Button
                onClick={openVercelAnalytics}
                size="sm"
                className="rounded-full bg-white text-gray-900 hover:bg-gray-100 flex-shrink-0"
                title="Buka Vercel Analytics Dashboard di tab baru"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Buka Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer note when no data */}
        {!hasData && (
          <p className="text-center text-xs text-gray-500 mt-6">
            Belum ada data kunjungan. Data akan terisi otomatis saat ada
            pengunjung mengakses halaman.
          </p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPengunjungView;
