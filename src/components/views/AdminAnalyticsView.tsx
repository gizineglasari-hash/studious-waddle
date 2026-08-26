"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Link as LinkIcon,
  MapPin,
  Activity,
  Lock,
  LogOut,
  ExternalLink,
  TrendingUp,
  Clock,
  RefreshCw,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";

// Admin password - bisa diubah di sini
// Default: gemas2026
const ADMIN_PASSWORD = "gemas2026";

// Vercel Analytics dashboard URL
const VERCEL_ANALYTICS_URL =
  "https://vercel.com/rahmadianiputribaiquni-3969/gemas-puskesmas-neglasari/analytics";

interface VisitStats {
  totalVisits: number;
  uniqueDays: Set<string>;
  firstVisit: string;
  lastVisit: string;
  visitsByPage: Record<string, number>;
  visitsByBrowser: Record<string, number>;
  visitsByDevice: Record<string, number>;
  visitHistory: { timestamp: string; page: string; userAgent: string }[];
}

interface RealTimeInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
  isp: string;
  browser: string;
  os: string;
  device: string;
  screenSize: string;
  language: string;
}

function getBrowserInfo(): Partial<RealTimeInfo> {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Detect browser
  if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome/")) browser = "Google Chrome";
  else if (ua.includes("Firefox/")) browser = "Mozilla Firefox";
  else if (ua.includes("Safari/")) browser = "Apple Safari";
  else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";

  // Detect OS
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Detect device
  if (/Mobi|Android/i.test(ua)) device = "Mobile";
  else if (/iPad|Tablet/i.test(ua)) device = "Tablet";

  return {
    browser,
    os,
    device,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
  };
}

async function fetchIpInfo(): Promise<Partial<RealTimeInfo>> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip || "Unknown",
        city: data.city || "Unknown",
        region: data.region || "Unknown",
        country: data.country_name || "Unknown",
        timezone: data.timezone || "Unknown",
        isp: data.org || "Unknown",
      };
    }
  } catch (e) {
    // Fallback if API fails
  }
  return { ip: "Unknown", city: "Unknown", country: "Unknown" };
}

function loadVisitStats(): VisitStats {
  if (typeof localStorage === "undefined") {
    return {
      totalVisits: 0,
      uniqueDays: new Set(),
      firstVisit: "",
      lastVisit: "",
      visitsByPage: {},
      visitsByBrowser: {},
      visitsByDevice: {},
      visitHistory: [],
    };
  }
  try {
    const stored = localStorage.getItem("gemas-analytics-stats");
    if (stored) {
      const data = JSON.parse(stored);
      return {
        totalVisits: data.totalVisits || 0,
        uniqueDays: new Set(data.uniqueDays || []),
        firstVisit: data.firstVisit || "",
        lastVisit: data.lastVisit || "",
        visitsByPage: data.visitsByPage || {},
        visitsByBrowser: data.visitsByBrowser || {},
        visitsByDevice: data.visitsByDevice || {},
        visitHistory: data.visitHistory || [],
      };
    }
  } catch (e) {
    // ignore parse errors
  }
  return {
    totalVisits: 0,
    uniqueDays: new Set(),
    firstVisit: "",
    lastVisit: "",
    visitsByPage: {},
    visitsByBrowser: {},
    visitsByDevice: {},
    visitHistory: [],
  };
}

function saveVisitStats(stats: VisitStats) {
  if (typeof localStorage === "undefined") return;
  try {
    const data = {
      totalVisits: stats.totalVisits,
      uniqueDays: Array.from(stats.uniqueDays),
      firstVisit: stats.firstVisit,
      lastVisit: stats.lastVisit,
      visitsByPage: stats.visitsByPage,
      visitsByBrowser: stats.visitsByBrowser,
      visitsByDevice: stats.visitsByDevice,
      visitHistory: stats.visitHistory.slice(-50), // keep last 50
    };
    localStorage.setItem("gemas-analytics-stats", JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function AdminAnalyticsView() {
  const { toast } = useToast();
  const { setView } = useGemasStore();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [realTimeInfo, setRealTimeInfo] = useState<RealTimeInfo | null>(null);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize stats from localStorage on mount (no setState in effect)
  const [statsLoaded, setStatsLoaded] = useState(false);
  if (!statsLoaded && typeof window !== "undefined") {
    setStatsLoaded(true);
    const loaded = loadVisitStats();
    setStats(loaded);
  }

  // Load visit stats and fetch real-time info when authenticated
  useEffect(() => {
    if (!authenticated) return;

    let cancelled = false;
    const browserInfo = getBrowserInfo();

    // Fetch real-time info async, then update state in callback (not in effect body)
    fetchIpInfo().then((ipInfo) => {
      if (cancelled) return;
      setRealTimeInfo({ ...browserInfo, ...ipInfo } as RealTimeInfo);
    });

    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      toast({
        title: "Akses diterima",
        description: "Selamat datang di Dashboard Admin GEMAS",
      });
    } else {
      toast({
        title: "Password salah",
        description: "Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
    setView("home");
  };

  const handleRefresh = () => {
    const loaded = loadVisitStats();
    setStats(loaded);
    toast({
      title: "Data diperbarui",
      description: "Statistik kunjungan telah dimuat ulang.",
    });
  };

  // ============ LOGIN VIEW ============
  if (!authenticated) {
    return (
      <div className="animate-fade-in min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl bg-white">
          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 pb-3 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg mb-3">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-900">Halaman Admin GEMAS</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Area terbatas - hanya untuk administrator
            </p>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div>
              <Label htmlFor="password" className="text-xs font-medium mb-1.5 block">
                Password Admin
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                className="rounded-lg"
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              Masuk
            </Button>
            <Button
              onClick={() => setView("home")}
              variant="outline"
              className="w-full rounded-full"
            >
              Kembali ke Beranda
            </Button>
            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
              <p>Default password: <code className="bg-gray-100 px-1 rounded text-green-700">gemas2026</code></p>
              <p className="mt-1">Ganti password di <code className="bg-gray-100 px-1 rounded">AdminAnalyticsView.tsx</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ DASHBOARD VIEW ============
  if (!stats || !realTimeInfo) {
    return (
      <div className="animate-fade-in min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-600">Memuat data analytics...</p>
        </div>
      </div>
    );
  }

  const sortedPages = Object.entries(stats.visitsByPage).sort((a, b) => b[1] - a[1]);
  const sortedBrowsers = Object.entries(stats.visitsByBrowser).sort((a, b) => b[1] - a[1]);
  const sortedDevices = Object.entries(stats.visitsByDevice).sort((a, b) => b[1] - a[1]);
  const sortedHistory = [...stats.visitHistory].reverse().slice(0, 10);

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-2 bg-red-50 text-red-700 border-red-200 rounded-full">
              <Lock className="h-3 w-3 mr-1" />
              Admin Dashboard
            </Badge>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
              Analytics GEMAS
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Pantau pengunjung dan statistik website GEMAS
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Vercel Analytics Banner */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl mb-6 overflow-hidden">
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-base font-bold text-gray-900 mb-1">
                  Vercel Analytics Dashboard (Statistik Lengkap)
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Untuk melihat statistik lengkap (Total Page Views, Total Visitors, Top Pages, Top Referrers, Top Countries, Top Browsers, Top Devices, Top Paths), buka Vercel Analytics Dashboard. Login dengan akun Vercel Anda.
                </p>
              </div>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex-shrink-0"
              >
                <a href={VERCEL_ANALYTICS_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buka Dashboard
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Total */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Total Visits</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{stats.totalVisits}</div>
              <p className="text-[10px] text-gray-500 mt-1">Device ini</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Hari Aktif</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{stats.uniqueDays.size}</div>
              <p className="text-[10px] text-gray-500 mt-1">Hari berbeda</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Halaman Dilihat</span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{sortedPages.length}</div>
              <p className="text-[10px] text-gray-500 mt-1">Halaman unik</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Kunjungan Akhir</span>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) : "—"}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {stats.lastVisit ? new Date(stats.lastVisit).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Visitor Info */}
        <Card className="border-0 shadow-lg rounded-2xl mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Informasi Pengunjung Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoItem
                icon={MapPin}
                label="Lokasi"
                value={realTimeInfo.city && realTimeInfo.city !== "Unknown"
                  ? `${realTimeInfo.city}, ${realTimeInfo.country}`
                  : realTimeInfo.country || "Unknown"}
                color="bg-rose-100 text-rose-600"
              />
              <InfoItem
                icon={Globe}
                label="IP Address"
                value={realTimeInfo.ip || "Unknown"}
                color="bg-blue-100 text-blue-600"
              />
              <InfoItem
                icon={Monitor}
                label="Browser"
                value={realTimeInfo.browser || "Unknown"}
                color="bg-purple-100 text-purple-600"
              />
              <InfoItem
                icon={Smartphone}
                label="Device"
                value={`${realTimeInfo.device} (${realTimeInfo.os})`}
                color="bg-amber-100 text-amber-600"
              />
              <InfoItem
                icon={Activity}
                label="Screen"
                value={realTimeInfo.screenSize || "Unknown"}
                color="bg-emerald-100 text-emerald-600"
              />
              <InfoItem
                icon={Globe}
                label="Bahasa"
                value={realTimeInfo.language || "Unknown"}
                color="bg-sky-100 text-sky-600"
              />
              <InfoItem
                icon={Clock}
                label="Zona Waktu"
                value={realTimeInfo.timezone || "Unknown"}
                color="bg-indigo-100 text-indigo-600"
              />
              <InfoItem
                icon={LinkIcon}
                label="ISP"
                value={(realTimeInfo.isp || "Unknown").substring(0, 30)}
                color="bg-teal-100 text-teal-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                Top Pages (Halaman Populer)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sortedPages.length > 0 ? (
                <div className="space-y-2">
                  {sortedPages.slice(0, 8).map(([page, count], i) => (
                    <div key={page} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                        <span className="text-sm text-gray-700 truncate">{page}</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">
                        {count}x
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4 text-purple-600" />
                Top Browsers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sortedBrowsers.length > 0 ? (
                <div className="space-y-2">
                  {sortedBrowsers.slice(0, 6).map(([browser, count], i) => (
                    <div key={browser} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                        <span className="text-sm text-gray-700 truncate">{browser}</span>
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs flex-shrink-0">
                        {count}x
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Devices & Recent Visits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber-600" />
                Top Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sortedDevices.length > 0 ? (
                <div className="space-y-2">
                  {sortedDevices.slice(0, 4).map(([device, count], i) => (
                    <div key={device} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                        <span className="text-sm text-gray-700 truncate">{device}</span>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs flex-shrink-0">
                        {count}x
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                Kunjungan Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sortedHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {sortedHistory.map((visit, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
                      <span className="text-gray-700 truncate flex-1">{visit.page}</span>
                      <span className="text-gray-500 ml-2 flex-shrink-0">
                        {new Date(visit.timestamp).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <Card className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>Catatan:</strong> Statistik di halaman ini hanya mencatat kunjungan dari perangkat ini (localStorage). Untuk statistik lengkap semua pengunjung website, gunakan <strong>Vercel Analytics Dashboard</strong> yang link-nya tersedia di atas. Data Vercel Analytics mencakup: Total Page Views, Total Visitors, Top Pages, Top Referrers, Top Countries, Top Browsers, Top Devices, dan Top Paths dari semua pengunjung.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-500 font-medium">{label}</div>
        <div className="text-xs text-gray-900 font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

// Import Calendar icon since we use it above
import { Calendar } from "lucide-react";
