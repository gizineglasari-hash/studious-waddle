"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/gemas/auth-store";

function ResetPasswordContent() {
  const router = useRouter();
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Verify that we have a valid recovery session from the email link
  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      try {
        // Restore session - this picks up the recovery token from the URL
        await restoreSession();

        if (!mounted) return;

        // Check if we have an active session (from recovery)
        // The Supabase client automatically processes the URL hash on init
        // and exchanges the recovery token for a session
        const { supabase, isSupabaseConfigured } = await import("@/lib/supabase/client");

        if (!isSupabaseConfigured || !supabase) {
          setVerifying(false);
          setError("Sistem autentikasi tidak tersedia. Hubungi admin.");
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error("[reset-password] session error:", sessionError.message);
          setSessionValid(false);
          setError("Link reset password tidak valid atau sudah kedaluwarsa. Silakan meminta link reset password baru.");
        } else if (sessionData?.session) {
          // We have a session - check if it's a recovery session
          // The session from email recovery will have a valid access_token
          setSessionValid(true);
        } else {
          // No session - link might be expired or already used
          setSessionValid(false);
          setError("Link reset password tidak valid atau sudah kedaluwarsa. Silakan meminta link reset password baru.");
        }
      } catch (err) {
        console.error("[reset-password] verify exception:", err);
        if (!mounted) return;
        setSessionValid(false);
        setError("Terjadi kesalahan saat memverifikasi link. Coba meminta link baru.");
      } finally {
        if (mounted) {
          setVerifying(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [restoreSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword) {
      setError("Password baru wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (!confirmPassword) {
      setError("Konfirmasi password wajib diisi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message);
        // Clear URL hash/token for security
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("[reset-password] submit exception:", err);
      setError("Terjadi kesalahan saat memperbarui password. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    // Navigate to the main app with login hash
    router.push("/#login");
  };

  // Loading state - verifying session
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-8">
        <Card className="border-0 shadow-2xl rounded-2xl bg-white overflow-hidden max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="h-10 w-10 text-green-600 mx-auto mb-4 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Memverifikasi link reset password...</p>
            <p className="text-xs text-gray-500 mt-1">Mohon tunggu sebentar</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-green-600 to-emerald-600 pb-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg mb-3 ring-4 ring-white/10">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
            <CardTitle className="text-xl font-extrabold text-white">
              Reset Password
            </CardTitle>
            <p className="text-xs text-green-50 mt-1">
              Buat password baru untuk akun Anda
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* Error State */}
            {error && !success && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">Link Tidak Valid</p>
                  <p className="text-sm text-gray-600 mt-2">{error}</p>
                </div>
                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Halaman Login
                </Button>
              </div>
            )}

            {/* Success State */}
            {success && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">Password Berhasil Diubah!</p>
                  <p className="text-sm text-gray-600 mt-2">{successMessage}</p>
                </div>
                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Login Sekarang
                </Button>
              </div>
            )}

            {/* Password Form - only show if session is valid and not yet success */}
            {!error && !success && sessionValid && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      Buat password baru untuk akun Anda. Password minimal 6 karakter.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-medium text-gray-700">
                    Password Baru
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-medium text-gray-700">
                    Konfirmasi Password Baru
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Validation hints */}
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Password minimal 6 karakter
                  </p>
                )}
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Password dan konfirmasi tidak sama
                  </p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Password cocok
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Simpan Password Baru
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* If no error, no success, but session invalid - show message (already handled by error state above) */}
            {!error && !success && !sessionValid && !verifying && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Memuat...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-gray-500 leading-relaxed mt-4 px-4">
          Koniciwa Gemas Gempita &mdash; UPTD Puskesmas Neglasari Kota Bandung
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
