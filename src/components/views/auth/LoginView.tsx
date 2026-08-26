"use client";

import { useState } from "react";
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  Heart,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import { useAuthStore } from "@/lib/gemas/auth-store";

type Mode = "login" | "register" | "forgot";

export function LoginView() {
  const { toast } = useToast();
  const { setView } = useGemasStore();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const [mode, setMode] = useState<Mode>("login");

  // Shared form state
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [email, setEmail] = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setNamaOrangTua("");
    setEmail("");
    setNomorTelepon("");
    setAlamat("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (next: Mode) => {
    resetFields();
    setMode(next);
  };

  // ---------------- LOGIN ----------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Form belum lengkap",
        description: "Email dan password wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = login(email, password);
      if (result.success) {
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali di GEMAS.",
        });
        setView("user-dashboard");
      } else {
        toast({
          title: "Login gagal",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REGISTER ----------------
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaOrangTua.trim() || !email.trim() || !nomorTelepon.trim() || !alamat.trim() || !password.trim()) {
      toast({
        title: "Form belum lengkap",
        description: "Mohon lengkapi semua kolom pendaftaran.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Konfirmasi password harus sama dengan password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = register({
        namaOrangTua,
        email,
        nomorTelepon,
        alamat,
        password,
      });

      if (result.success) {
        toast({
          title: "Registrasi berhasil",
          description: "Silakan masuk dengan akun yang baru dibuat.",
        });
        switchMode("login");
      } else {
        toast({
          title: "Registrasi gagal",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          onClick={() => setView("hubungi-ahli")}
          variant="ghost"
          className="mb-4 text-green-800 hover:text-green-900 hover:bg-green-100 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Card className="border-0 shadow-2xl rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-green-600 to-emerald-600 pb-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg mb-3 ring-4 ring-white/10">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
            <CardTitle className="text-xl font-extrabold text-white">
              {mode === "login" && "Masuk ke Akun GEMAS"}
              {mode === "register" && "Daftar Akun Baru"}
              {mode === "forgot" && "Lupa Password"}
            </CardTitle>
            <p className="text-xs text-green-50 mt-1">
              {mode === "login" && "Akses dashboard konsultasi gizi anak Anda"}
              {mode === "register" && "Bergabung untuk berkonsultasi dengan ahli gizi"}
              {mode === "forgot" && "Pemulihan akses akun"}
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* ============ LOGIN MODE ============ */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-lg"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-medium text-gray-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[11px] text-green-700 hover:text-green-800 font-medium"
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 mr-2 inline-block animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Masuk
                    </>
                  )}
                </Button>

                <Separator className="my-2" />

                <p className="text-center text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-green-700 hover:text-green-800 font-semibold"
                  >
                    Daftar Akun
                  </button>
                </p>
              </form>
            )}

            {/* ============ REGISTER MODE ============ */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-nama" className="text-xs font-medium text-gray-700">
                    Nama Orang Tua
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-nama"
                      type="text"
                      placeholder="Nama lengkap orang tua"
                      value={namaOrangTua}
                      onChange={(e) => setNamaOrangTua(e.target.value)}
                      className="pl-10 rounded-lg"
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-lg"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-telp" className="text-xs font-medium text-gray-700">
                    Nomor Telepon
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-telp"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={nomorTelepon}
                      onChange={(e) => setNomorTelepon(e.target.value)}
                      className="pl-10 rounded-lg"
                      autoComplete="tel"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-alamat" className="text-xs font-medium text-gray-700">
                    Alamat
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-alamat"
                      type="text"
                      placeholder="Alamat tempat tinggal"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="pl-10 rounded-lg"
                      autoComplete="street-address"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-xs font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm" className="text-xs font-medium text-gray-700">
                    Konfirmasi Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ulangi password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 mr-2 inline-block animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Daftar Akun
                    </>
                  )}
                </Button>

                <Separator className="my-2" />

                <p className="text-center text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-green-700 hover:text-green-800 font-semibold"
                  >
                    Masuk
                  </button>
                </p>
              </form>
            )}

            {/* ============ FORGOT MODE ============ */}
            {mode === "forgot" && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900 mb-1.5">
                        Hubungi Administrator
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Untuk keamanan akun, pemulihan password dilakukan melalui administrator
                        GEMAS. Silakan hubungi ahli gizi atau admin Puskesmas Neglasari melalui
                        kontak yang tersedia untuk mereset password akun Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-900 mb-1">Informasi yang perlu disiapkan:</p>
                      <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                        <li>Email yang digunakan saat mendaftar</li>
                        <li>Nama lengkap orang tua</li>
                        <li>Nomor telepon yang terdaftar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setView("hubungi-ahli")}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Lihat Kontak Ahli Gizi
                </Button>

                <Separator className="my-2" />

                <p className="text-center text-sm text-gray-600">
                  Ingat password Anda?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-green-700 hover:text-green-800 font-semibold"
                  >
                    Kembali ke Login
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-gray-500 leading-relaxed mt-4 px-4">
          Dengan masuk atau mendaftar, Anda menyetujui ketentuan layanan GEMAS
          Puskesmas Neglasari.
        </p>
      </div>
    </div>
  );
}
