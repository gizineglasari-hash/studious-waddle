"use client";

import { useState } from "react";
import { Shield, Lock, Mail, ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGemasStore } from "@/lib/gemas/store";
import { useAuthStore, AUTH_DEFAULTS } from "@/lib/gemas/auth-store";

export function AdminLoginView() {
  const { toast } = useToast();
  const { setView } = useGemasStore();
  const adminLogin = useAuthStore((state) => state.adminLogin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
      const result = adminLogin(email, password);
      if (result.success) {
        toast({
          title: "Login berhasil",
          description: "Selamat datang, Administrator GEMAS.",
        });
        setView("admin-dashboard");
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

  const fillDefaultCredentials = () => {
    setEmail(AUTH_DEFAULTS.adminEmail);
    setPassword(AUTH_DEFAULTS.adminPassword);
  };

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          onClick={() => setView("home")}
          variant="ghost"
          className="mb-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Button>

        <Card className="border-0 shadow-2xl rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg mb-3 ring-4 ring-white/10">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-extrabold text-white">
              Admin GEMAS
            </CardTitle>
            <p className="text-xs text-gray-300 mt-1">
              Panel Administrasi Konsultasi Gizi
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Lock className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] text-amber-300 uppercase tracking-wider font-medium">
                Area Terbatas - Administrator
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-medium text-gray-700">
                  Email Admin
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@gemas.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-lg"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-xs font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password admin"
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
                    <Shield className="h-4 w-4 mr-2" />
                    Masuk sebagai Admin
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-2" />

            {/* Default credentials hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-start gap-2">
                <KeyRound className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900 mb-1.5">
                    Kredensial Default Admin
                  </p>
                  <div className="space-y-1 text-xs text-amber-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-700">Email:</span>
                      <code className="bg-white px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px] break-all">
                        {AUTH_DEFAULTS.adminEmail}
                      </code>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-700">Password:</span>
                      <code className="bg-white px-1.5 py-0.5 rounded text-amber-900 font-mono text-[11px]">
                        {AUTH_DEFAULTS.adminPassword}
                      </code>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={fillDefaultCredentials}
                    variant="outline"
                    size="sm"
                    className="mt-2.5 h-7 text-[11px] rounded-full border-amber-300 text-amber-800 hover:bg-amber-100 w-full"
                  >
                    <KeyRound className="h-3 w-3 mr-1" />
                    Isi Otomatis Kredensial
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-500 leading-relaxed">
              Halaman ini khusus untuk administrator GEMAS.
              <br />
              Pengguna umum silakan{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-green-700 hover:text-green-800 underline font-medium"
              >
                login di sini
              </button>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
