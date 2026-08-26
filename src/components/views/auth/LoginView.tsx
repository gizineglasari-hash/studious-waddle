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
  const resetPassword = useAuthStore((state) => state.resetPassword);

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

  // ---------------- FORGOT PASSWORD ----------------
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast({
        title: "Email belum diisi",
        description: "Masukkan email yang terdaftar.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setResetSent(true);
        toast({
          title: "Email reset terkirim",
          description: result.message,
        });
      } else {
        toast({
          title: "Gagal mengirim reset",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE PASSWORD (from email link) ----------------
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      toast({
        title: "Password tidak valid",
        description: "Password minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Konfirmasi password tidak sama.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (!supabase) {
        toast({
          title: "Error",
          description: "Sistem reset password tidak tersedia.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Gagal update password",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setPasswordUpdated(true);
        toast({
          title: "Password berhasil diubah",
          description: "Silakan login dengan password baru Anda.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if we're in reset mode (from email link with hash #reset-password)
  const isResetMode = typeof window !== "undefined" && window.location.hash === "#reset-password";

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

            {/* ============ RESET PASSWORD MODE (from email link) ============ */}
            {isResetMode && (
              <div className="space-y-5">
                {passwordUpdated ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Password Berhasil Diubah!</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Password Anda telah diperbarui. Silakan login dengan password baru.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        window.location.hash = "";
                        switchMode("login");
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login Sekarang
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                          Buat password baru untuk akun Anda. Password minimal 6 karakter.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimal 6 karakter"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-9 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Konfirmasi Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ulangi password baru"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                    >
                      {loading ? "Menyimpan..." : "Simpan Password Baru"}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* ============ FORGOT MODE (request reset email) ============ */}
            {mode === "forgot" && !isResetMode && (
              <div className="space-y-5">
                {resetSent ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Email Terkirim!</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Kami telah mengirim link reset password ke <strong>{resetEmail}</strong>.
                        Silakan cek inbox email Anda (juga cek folder spam).
                      </p>
                    </div>
                    <Button
                      onClick={() => switchMode("login")}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Kembali ke Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                          Masukkan email yang terdaftar. Kami akan mengirim link untuk reset password ke email Anda.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Email Terdaftar</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="email@contoh.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                    >
                      {loading ? "Mengirim..." : "Kirim Link Reset Password"}
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
                  </form>
                )}
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
