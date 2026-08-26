"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// =====================================================
// TYPES
// =====================================================

export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  namaOrangTua: string;
  email: string;
  nomorTelepon: string;
  alamat: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  userId: string;
  namaAnak: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  beratBadan: number;
  tinggiBadan: number;
  createdAt: string;
  updatedAt: string;
}

export type ConsultationStatus =
  | "Menunggu Jawaban"
  | "Sedang Diproses"
  | "Sudah Dijawab"
  | "Selesai";

export interface Consultation {
  id: string;
  userId: string;
  childId: string;
  // Snapshot of child data at time of consultation
  namaAnak: string;
  tanggalLahirAnak: string;
  jenisKelaminAnak: "L" | "P";
  beratBadanAnak: number;
  tinggiBadanAnak: number;
  // Snapshot of parent data
  namaOrangTua: string;
  nomorTelepon: string;
  alamat: string;
  // Consultation content
  pertanyaan: string;
  jawaban: string;
  status: ConsultationStatus;
  adminId: string | null;
  adminName: string | null;
  createdAt: string;
  answeredAt: string | null;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  consultationId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// =====================================================
// SIMPLE PASSWORD HASH (DEMO ONLY - used by localStorage fallback)
// =====================================================

function simpleHash(password: string): string {
  // This is NOT cryptographically secure.
  // For production, use Supabase Auth or NextAuth with proper hashing.
  let hash = 0;
  const salt = "GEMAS_2026_SALT_KEY";
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  // Convert to hex and add extra layer
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return btoa(hex + salt + password.length);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate valid UUID for Supabase tables (all id columns are UUID type)
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Pick the right ID generator based on Supabase availability
function genId(): string {
  return isSupabaseConfigured ? generateUUID() : generateId();
}

// =====================================================
// DEFAULT ADMIN
// =====================================================

const DEFAULT_ADMIN_EMAIL = "admin@gemas.id";
const DEFAULT_ADMIN_PASSWORD = "admin2026";

// =====================================================
// SUPABASE ROW MAPPERS
// Convert snake_case DB rows to camelCase TypeScript interfaces.
// All mappers are defensive: missing/null fields fall back to safe defaults.
// =====================================================

interface ProfileRow {
  id: string;
  nama_orang_tua: string | null;
  email: string | null;
  nomor_telepon: string | null;
  alamat: string | null;
  password_hash: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

interface ChildRow {
  id: string;
  user_id: string;
  nama_anak: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  berat_badan: number | null;
  tinggi_badan: number | null;
  created_at: string;
  updated_at: string;
}

interface ConsultationRow {
  id: string;
  user_id: string;
  child_id: string | null;
  nama_anak: string | null;
  tanggal_lahir_anak: string | null;
  jenis_kelamin_anak: string | null;
  berat_badan_anak: number | null;
  tinggi_badan_anak: number | null;
  nama_orang_tua: string | null;
  nomor_telepon: string | null;
  alamat: string | null;
  pertanyaan: string | null;
  jawaban: string | null;
  status: string | null;
  admin_id: string | null;
  admin_name: string | null;
  created_at: string;
  answered_at: string | null;
  updated_at: string;
}

interface NotificationRow {
  id: string;
  user_id: string;
  consultation_id: string;
  title: string | null;
  message: string | null;
  is_read: boolean | null;
  created_at: string;
}

function mapProfileRow(row: ProfileRow, fallbackEmail?: string): UserProfile {
  const role: UserRole =
    row.role === "admin" ? "admin" : "user";
  return {
    id: row.id,
    namaOrangTua: row.nama_orang_tua ?? "",
    email: row.email ?? fallbackEmail ?? "",
    nomorTelepon: row.nomor_telepon ?? "",
    alamat: row.alamat ?? "",
    passwordHash: row.password_hash ?? "",
    role,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function mapChildRow(row: ChildRow): ChildProfile {
  return {
    id: row.id,
    userId: row.user_id,
    namaAnak: row.nama_anak ?? "",
    tanggalLahir: row.tanggal_lahir ?? "",
    jenisKelamin: row.jenis_kelamin === "P" ? "P" : "L",
    beratBadan: typeof row.berat_badan === "number" ? row.berat_badan : Number(row.berat_badan) || 0,
    tinggiBadan:
      typeof row.tinggi_badan === "number" ? row.tinggi_badan : Number(row.tinggi_badan) || 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function mapConsultationRow(row: ConsultationRow): Consultation {
  const status: ConsultationStatus =
    row.status === "Sedang Diproses" ||
    row.status === "Sudah Dijawab" ||
    row.status === "Selesai"
      ? (row.status as ConsultationStatus)
      : "Menunggu Jawaban";
  return {
    id: row.id,
    userId: row.user_id,
    childId: row.child_id ?? "",
    namaAnak: row.nama_anak ?? "",
    tanggalLahirAnak: row.tanggal_lahir_anak ?? "",
    jenisKelaminAnak: row.jenis_kelamin_anak === "P" ? "P" : "L",
    beratBadanAnak:
      typeof row.berat_badan_anak === "number"
        ? row.berat_badan_anak
        : Number(row.berat_badan_anak) || 0,
    tinggiBadanAnak:
      typeof row.tinggi_badan_anak === "number"
        ? row.tinggi_badan_anak
        : Number(row.tinggi_badan_anak) || 0,
    namaOrangTua: row.nama_orang_tua ?? "",
    nomorTelepon: row.nomor_telepon ?? "",
    alamat: row.alamat ?? "",
    pertanyaan: row.pertanyaan ?? "",
    jawaban: row.jawaban ?? "",
    status,
    adminId: row.admin_id,
    adminName: row.admin_name,
    createdAt: row.created_at ?? new Date().toISOString(),
    answeredAt: row.answered_at,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    consultationId: row.consultation_id,
    title: row.title ?? "",
    message: row.message ?? "",
    isRead: row.is_read === true,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// =====================================================
// AUTH STORE
// =====================================================

interface AuthState {
  // Current session
  currentUserId: string | null;
  currentAdminId: string | null;
  isAdmin: boolean;

  // Async-loading / error flags (used by Supabase mode for UX feedback)
  isAuthLoading: boolean;
  authError: string | null;
  lastRefreshedAt: string | null;

  // Data (persisted in localStorage mode; cached in Supabase mode)
  users: UserProfile[];
  children: ChildProfile[];
  consultations: Consultation[];
  notifications: AppNotification[];

  // Auth actions
  register: (data: {
    namaOrangTua: string;
    email: string;
    nomorTelepon: string;
    alamat: string;
    password: string;
  }) => { success: boolean; message: string };

  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;

  adminLogin: (email: string, password: string) => { success: boolean; message: string };
  adminLogout: () => void;

  // Profile actions
  updateProfile: (userId: string, data: Partial<UserProfile>) => void;
  getCurrentUser: () => UserProfile | null;

  // Children actions
  addChild: (data: Omit<ChildProfile, "id" | "userId" | "createdAt" | "updatedAt">) => { success: boolean; message: string };
  updateChild: (childId: string, data: Partial<ChildProfile>) => void;
  getChildrenByUser: (userId: string) => ChildProfile[];
  getLastChild: (userId: string) => ChildProfile | null;

  // Consultation actions
  createConsultation: (data: {
    childId: string;
    pertanyaan: string;
  }) => { success: boolean; message: string; consultationId?: string };

  answerConsultation: (
    consultationId: string,
    jawaban: string,
    adminId: string,
    adminName: string
  ) => { success: boolean; message: string };

  updateConsultationStatus: (consultationId: string, status: ConsultationStatus) => void;

  getConsultationsByUser: (userId: string) => Consultation[];
  getConsultationById: (id: string) => Consultation | null;
  getAllConsultations: () => Consultation[];

  // Notification actions
  getNotificationsByUser: (userId: string) => AppNotification[];
  getUnreadNotificationCount: (userId: string) => number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  // Stats (for admin)
  getStats: () => {
    totalConsultations: number;
    menungguJawaban: number;
    sedangDiproses: number;
    sudahDijawab: number;
    selesai: number;
    totalUsers: number;
  };

  // Supabase-only helpers (no-ops in localStorage mode)
  restoreSession: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

// =====================================================
// STORE IMPLEMENTATION
//
// KEY DESIGN PRINCIPLE (per spec rule #6):
//   "Use async where needed but keep the store interface synchronous
//    (use internal async, return sync)."
//
// All public method signatures stay EXACTLY the same as before (sync return
// types) so existing callers don't need any changes. When Supabase is
// configured, methods fire async Supabase operations in the background
// (fire-and-forget IIFE) and apply optimistic updates to local state
// immediately. When Supabase is NOT configured, the original localStorage
// logic runs unchanged.
//
// For `login()`/`adminLogin()` specifically, we set the current user/admin
// id optimistically (to a placeholder id) so the dashboard renders right
// away. When the async Supabase response arrives, we replace the
// placeholder with the real user id and call `refreshData()` to populate
// consultations/notifications/children from the server.
// =====================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      currentAdminId: null,
      isAdmin: false,
      isAuthLoading: false,
      authError: null,
      lastRefreshedAt: null,
      users: [],
      children: [],
      consultations: [],
      notifications: [],

      // ============ AUTH ============
      register: (data) => {
        const emailLower = data.email.toLowerCase().trim();

        // Sync validation
        if (!data.namaOrangTua.trim()) {
          return { success: false, message: "Nama orang tua wajib diisi." };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
          return { success: false, message: "Format email tidak valid." };
        }
        if (data.password.length < 6) {
          return { success: false, message: "Password minimal 6 karakter." };
        }
        if (!data.nomorTelepon.trim()) {
          return { success: false, message: "Nomor telepon wajib diisi." };
        }

        if (isSupabaseConfigured && supabase) {
          // Fire signUp in background. A database trigger is expected to
          // auto-create the matching row in `public.profiles`.
          void (async () => {
            try {
              const { data: signUpData, error } = await supabase.auth.signUp({
                email: emailLower,
                password: data.password,
                options: {
                  data: {
                    nama_orang_tua: data.namaOrangTua.trim(),
                    nomor_telepon: data.nomorTelepon.trim(),
                    alamat: data.alamat.trim(),
                  },
                },
              });

              if (error) {
                console.error("[Supabase register] error:", error.message);
                return;
              }

              // Cache the new profile locally so the user can log in
              // immediately after registration.
              if (signUpData.user) {
                const now = new Date().toISOString();
                const cachedProfile: UserProfile = {
                  id: signUpData.user.id,
                  namaOrangTua: data.namaOrangTua.trim(),
                  email: emailLower,
                  nomorTelepon: data.nomorTelepon.trim(),
                  alamat: data.alamat.trim(),
                  passwordHash: "",
                  role: "user",
                  createdAt: signUpData.user.created_at || now,
                  updatedAt: now,
                };
                set((state) => ({
                  users: [
                    ...state.users.filter((u) => u.id !== cachedProfile.id),
                    cachedProfile,
                  ],
                }));
              }
            } catch (err) {
              console.error("[Supabase register] exception:", err);
            }
          })();

          return { success: true, message: "Registrasi berhasil. Silakan login." };
        }

        // ----- localStorage fallback -----
        const { users } = get();
        if (users.some((u) => u.email.toLowerCase() === emailLower)) {
          return { success: false, message: "Email sudah terdaftar. Silakan login." };
        }

        const newUser: UserProfile = {
          id: genId(),
          namaOrangTua: data.namaOrangTua.trim(),
          email: emailLower,
          nomorTelepon: data.nomorTelepon.trim(),
          alamat: data.alamat.trim(),
          passwordHash: simpleHash(data.password),
          role: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ users: [...state.users, newUser] }));
        return { success: true, message: "Registrasi berhasil. Silakan login." };
      },

      login: (email, password) => {
        const emailLower = email.toLowerCase().trim();

        // Sync validation
        if (!emailLower) {
          return { success: false, message: "Email wajib diisi." };
        }
        if (!password) {
          return { success: false, message: "Password wajib diisi." };
        }

        if (isSupabaseConfigured && supabase) {
          // Optimistic placeholder so the dashboard can render while we
          // wait for Supabase to confirm credentials. The placeholder is
          // replaced by the real profile once signIn resolves.
          const placeholderId = `supabase-pending-${emailLower}`;
          const placeholderUser: UserProfile = {
            id: placeholderId,
            namaOrangTua: "Memuat data pengguna...",
            email: emailLower,
            nomorTelepon: "",
            alamat: "",
            passwordHash: "",
            role: "user",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            currentUserId: placeholderId,
            isAdmin: false,
            isAuthLoading: true,
            authError: null,
            users: [
              ...state.users.filter((u) => u.id !== placeholderId),
              placeholderUser,
            ],
          }));

          // Fire signInWithPassword in the background.
          void (async () => {
            try {
              const { data: signInData, error } =
                await supabase.auth.signInWithPassword({
                  email: emailLower,
                  password,
                });

              if (error || !signInData.user) {
                console.error("[Supabase login] error:", error?.message);
                set((state) => ({
                  currentUserId: null,
                  isAuthLoading: false,
                  authError: error?.message || "Login gagal.",
                  users: state.users.filter((u) => u.id !== placeholderId),
                }));
                return;
              }

              const userId = signInData.user.id;

              // Fetch the matching profile row.
              let profile: UserProfile | null = null;
              try {
                const { data: profileRow, error: profileError } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", userId)
                  .maybeSingle();

                if (profileError) {
                  console.error("[Supabase login] profile error:", profileError.message);
                }
                if (profileRow) {
                  profile = mapProfileRow(profileRow as ProfileRow, signInData.user.email);
                } else {
                  // Profile not yet created — derive from auth metadata.
                  profile = {
                    id: userId,
                    namaOrangTua:
                      (signInData.user.user_metadata?.nama_orang_tua as string) || "",
                    email: signInData.user.email || emailLower,
                    nomorTelepon:
                      (signInData.user.user_metadata?.nomor_telepon as string) || "",
                    alamat: (signInData.user.user_metadata?.alamat as string) || "",
                    passwordHash: "",
                    role: "user",
                    createdAt: signInData.user.created_at || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                }
              } catch (err) {
                console.error("[Supabase login] profile fetch exception:", err);
              }

              // Replace placeholder with the real profile.
              set((state) => ({
                currentUserId: userId,
                isAuthLoading: false,
                authError: null,
                users: profile
                  ? [
                      ...state.users.filter(
                        (u) => u.id !== placeholderId && u.id !== profile!.id
                      ),
                      profile!,
                    ]
                  : state.users.filter((u) => u.id !== placeholderId),
              }));

              // Hydrate the rest of the data (consultations, notifications,
              // children) from the server.
              await get().refreshData();
            } catch (err) {
              console.error("[Supabase login] exception:", err);
              set((state) => ({
                currentUserId: null,
                isAuthLoading: false,
                authError: err instanceof Error ? err.message : "Login gagal.",
                users: state.users.filter((u) => u.id !== placeholderId),
              }));
            }
          })();

          return { success: true, message: "Login berhasil." };
        }

        // ----- localStorage fallback -----
        const { users } = get();
        const user = users.find((u) => u.email.toLowerCase() === emailLower);
        if (!user) {
          return { success: false, message: "Email tidak terdaftar." };
        }
        if (user.passwordHash !== simpleHash(password)) {
          return { success: false, message: "Password salah." };
        }
        set({ currentUserId: user.id, isAdmin: false });
        return { success: true, message: "Login berhasil." };
      },

      logout: () => {
        if (isSupabaseConfigured && supabase) {
          // Fire signOut in the background; clear local state synchronously
          // so the UI reacts instantly.
          void (async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.error("[Supabase logout] exception:", err);
            }
          })();
        }
        set({ currentUserId: null, isAdmin: false, authError: null });
      },

      adminLogin: (email, password) => {
        const emailLower = email.toLowerCase().trim();

        // Check default admin credentials (works in both modes).
        const isDefaultAdmin =
          emailLower === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;

        if (isSupabaseConfigured && supabase) {
          // If using default admin credentials, sign in to Supabase too
          // (assumes the default admin account exists in Supabase Auth).
          if (isDefaultAdmin) {
            void (async () => {
              try {
                const { error } = await supabase.auth.signInWithPassword({
                  email: emailLower,
                  password,
                });
                if (error) {
                  console.error("[Supabase adminLogin] error:", error.message);
                }
              } catch (err) {
                console.error("[Supabase adminLogin] exception:", err);
              }
            })();
          }

          // Ensure an admin profile exists locally for the dashboard.
          const { users } = get();
          let admin = users.find((u) => u.email.toLowerCase() === emailLower);
          if (!admin) {
            admin = {
              id: isDefaultAdmin ? "admin-default" : genId(),
              namaOrangTua: "Administrator GEMAS",
              email: emailLower,
              nomorTelepon: "",
              alamat: "",
              passwordHash: simpleHash(password),
              role: "admin",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set((state) => ({ users: [...state.users, admin!] }));
          } else if (admin.role !== "admin") {
            // Promote existing user to admin locally.
            set((state) => ({
              users: state.users.map((u) =>
                u.id === admin!.id
                  ? { ...u, role: "admin", updatedAt: new Date().toISOString() }
                  : u
              ),
            }));
          }

          set({
            currentAdminId: admin.id,
            isAdmin: true,
            currentUserId: null,
            authError: null,
          });
          return { success: true, message: "Login admin berhasil." };
        }

        // ----- localStorage fallback -----
        if (isDefaultAdmin) {
          const { users } = get();
          let admin = users.find((u) => u.email.toLowerCase() === emailLower);
          if (!admin) {
            admin = {
              id: "admin-default",
              namaOrangTua: "Administrator GEMAS",
              email: emailLower,
              nomorTelepon: "",
              alamat: "",
              passwordHash: simpleHash(password),
              role: "admin",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set((state) => ({ users: [...state.users, admin!] }));
          }
          set({
            currentAdminId: admin.id,
            isAdmin: true,
            currentUserId: null,
          });
          return { success: true, message: "Login admin berhasil." };
        }

        // Also check if any user has admin role.
        const { users } = get();
        const admin = users.find(
          (u) => u.role === "admin" && u.email.toLowerCase() === emailLower
        );
        if (admin && admin.passwordHash === simpleHash(password)) {
          set({ currentAdminId: admin.id, isAdmin: true, currentUserId: null });
          return { success: true, message: "Login admin berhasil." };
        }

        return { success: false, message: "Email atau password admin salah." };
      },

      adminLogout: () => {
        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.error("[Supabase adminLogout] exception:", err);
            }
          })();
        }
        set({ currentAdminId: null, isAdmin: false, authError: null });
      },

      // ============ PROFILE ============
      updateProfile: (userId, data) => {
        const now = new Date().toISOString();
        const updatedFields: Partial<UserProfile> = { ...data, updatedAt: now };

        // Optimistic local update.
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...updatedFields } : u
          ),
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const update: Record<string, unknown> = { updated_at: now };
              if (data.namaOrangTua !== undefined) update.nama_orang_tua = data.namaOrangTua;
              if (data.nomorTelepon !== undefined) update.nomor_telepon = data.nomorTelepon;
              if (data.alamat !== undefined) update.alamat = data.alamat;
              if (data.role !== undefined) update.role = data.role;

              const { error } = await supabase
                .from("profiles")
                .update(update)
                .eq("id", userId);
              if (error) {
                console.error("[Supabase updateProfile] error:", error.message);
              }
            } catch (err) {
              console.error("[Supabase updateProfile] exception:", err);
            }
          })();
        }
      },

      getCurrentUser: () => {
        const { currentUserId, users } = get();
        if (!currentUserId) return null;
        return users.find((u) => u.id === currentUserId) || null;
      },

      // ============ CHILDREN ============
      addChild: (data) => {
        const { currentUserId } = get();
        if (!currentUserId) {
          return { success: false, message: "Anda harus login terlebih dahulu." };
        }

        // Check if currentUserId is still a placeholder (login not complete)
        if (currentUserId.startsWith("supabase-pending-")) {
          return { success: false, message: "Sedang memuat data pengguna, coba lagi dalam beberapa detik." };
        }

        // Sync validation
        if (!data.namaAnak.trim()) {
          return { success: false, message: "Nama anak wajib diisi." };
        }
        if (!data.tanggalLahir) {
          return { success: false, message: "Tanggal lahir wajib diisi." };
        }
        if (data.beratBadan <= 0 || data.beratBadan > 100) {
          return { success: false, message: "Berat badan tidak valid." };
        }
        if (data.tinggiBadan <= 0 || data.tinggiBadan > 220) {
          return { success: false, message: "Tinggi badan tidak valid." };
        }

        const now = new Date().toISOString();
        const localId = genId();
        const newChild: ChildProfile = {
          ...data,
          id: localId,
          userId: currentUserId,
          createdAt: now,
          updatedAt: now,
        };

        // Optimistic local update.
        set((state) => ({ children: [...state.children, newChild] }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              // Don't send custom ID - let Supabase auto-generate UUID
              const { data: inserted, error } = await supabase
                .from("children")
                .insert({
                  user_id: currentUserId,
                  nama_anak: newChild.namaAnak,
                  tanggal_lahir: newChild.tanggalLahir,
                  jenis_kelamin: newChild.jenisKelamin,
                  berat_badan: newChild.beratBadan,
                  tinggi_badan: newChild.tinggiBadan,
                })
                .select()
                .single();

              if (error) {
                console.error("[Supabase addChild] error:", error.message);
                // Revert optimistic insert on failure.
                set((state) => ({
                  children: state.children.filter((c) => c.id !== localId),
                }));
              } else if (inserted) {
                // Replace local ID with real Supabase UUID
                const realId = (inserted as any).id;
                set((state) => ({
                  children: state.children.map((c) =>
                    c.id === localId ? { ...c, id: realId } : c
                  ),
                }));
              }
            } catch (err) {
              console.error("[Supabase addChild] exception:", err);
            }
          })();
        }

        return { success: true, message: "Data anak berhasil disimpan." };
      },

      updateChild: (childId, data) => {
        const now = new Date().toISOString();
        const updatedFields: Partial<ChildProfile> = { ...data, updatedAt: now };

        set((state) => ({
          children: state.children.map((c) =>
            c.id === childId ? { ...c, ...updatedFields } : c
          ),
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const update: Record<string, unknown> = { updated_at: now };
              if (data.namaAnak !== undefined) update.nama_anak = data.namaAnak;
              if (data.tanggalLahir !== undefined) update.tanggal_lahir = data.tanggalLahir;
              if (data.jenisKelamin !== undefined) update.jenis_kelamin = data.jenisKelamin;
              if (data.beratBadan !== undefined) update.berat_badan = data.beratBadan;
              if (data.tinggiBadan !== undefined) update.tinggi_badan = data.tinggiBadan;

              const { error } = await supabase
                .from("children")
                .update(update)
                .eq("id", childId);
              if (error) {
                console.error("[Supabase updateChild] error:", error.message);
              }
            } catch (err) {
              console.error("[Supabase updateChild] exception:", err);
            }
          })();
        }
      },

      getChildrenByUser: (userId) => {
        return get().children.filter((c) => c.userId === userId);
      },

      getLastChild: (userId) => {
        const children = get().children.filter((c) => c.userId === userId);
        if (children.length === 0) return null;
        return children.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      },

      // ============ CONSULTATIONS ============
      createConsultation: (data) => {
        const { currentUserId, children, users } = get();
        if (!currentUserId) {
          return { success: false, message: "Anda harus login terlebih dahulu." };
        }

        const child = children.find((c) => c.id === data.childId && c.userId === currentUserId);
        if (!child) {
          return { success: false, message: "Data anak tidak ditemukan." };
        }

        const user = users.find((u) => u.id === currentUserId);
        if (!user) {
          return { success: false, message: "Data pengguna tidak ditemukan." };
        }

        if (!data.pertanyaan.trim() || data.pertanyaan.trim().length < 10) {
          return { success: false, message: "Pertanyaan minimal 10 karakter." };
        }

        const consultationId = genId();
        const now = new Date().toISOString();

        const newConsultation: Consultation = {
          id: consultationId,
          userId: currentUserId,
          childId: child.id,
          namaAnak: child.namaAnak,
          tanggalLahirAnak: child.tanggalLahir,
          jenisKelaminAnak: child.jenisKelamin,
          beratBadanAnak: child.beratBadan,
          tinggiBadanAnak: child.tinggiBadan,
          namaOrangTua: user.namaOrangTua,
          nomorTelepon: user.nomorTelepon,
          alamat: user.alamat,
          pertanyaan: data.pertanyaan.trim(),
          jawaban: "",
          status: "Menunggu Jawaban",
          adminId: null,
          adminName: null,
          createdAt: now,
          answeredAt: null,
          updatedAt: now,
        };

        const adminNotif: AppNotification = {
          id: genId(),
          userId: "admin",
          consultationId,
          title: "Konsultasi Baru",
          message: `Orang tua ${user.namaOrangTua} mengirimkan konsultasi untuk anak bernama ${child.namaAnak}.`,
          isRead: false,
          createdAt: now,
        };

        // Optimistic local updates.
        set((state) => ({
          consultations: [newConsultation, ...state.consultations],
          notifications: [adminNotif, ...state.notifications],
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              // Don't send custom ID - let Supabase auto-generate UUID
              const { data: consultInserted, error: consultError } = await supabase
                .from("consultations")
                .insert({
                  user_id: currentUserId,
                  child_id: newConsultation.childId || null,
                  nama_anak: newConsultation.namaAnak,
                  tanggal_lahir_anak: newConsultation.tanggalLahirAnak,
                  jenis_kelamin_anak: newConsultation.jenisKelaminAnak,
                  berat_badan_anak: newConsultation.beratBadanAnak,
                  tinggi_badan_anak: newConsultation.tinggiBadanAnak,
                  nama_orang_tua: newConsultation.namaOrangTua,
                  nomor_telepon: newConsultation.nomorTelepon,
                  alamat: newConsultation.alamat,
                  pertanyaan: newConsultation.pertanyaan,
                  jawaban: "",
                  status: "Menunggu Jawaban",
                  admin_id: null,
                  admin_name: null,
                  answered_at: null,
                })
                .select()
                .single();

              if (consultError || !consultInserted) {
                console.error("[Supabase createConsultation] error:", consultError?.message);
                return;
              }

              // Replace local ID with real Supabase UUID
              const realConsultId = (consultInserted as any).id;
              set((state) => ({
                consultations: state.consultations.map((c) =>
                  c.id === consultationId ? { ...c, id: realConsultId } : c
                ),
              }));

              const { error: notifError } = await supabase
                .from("notifications")
                .insert({
                  user_id: "admin",
                  consultation_id: realConsultId,
                  title: adminNotif.title,
                  message: adminNotif.message,
                  is_read: false,
                });
              if (notifError) {
                console.error("[Supabase createConsultation notif] error:", notifError.message);
              }
            } catch (err) {
              console.error("[Supabase createConsultation] exception:", err);
            }
          })();
        }

        return { success: true, message: "Konsultasi berhasil dikirim.", consultationId };
      },

      answerConsultation: (consultationId, jawaban, adminId, adminName) => {
        const { consultations } = get();
        const consultation = consultations.find((c) => c.id === consultationId);
        if (!consultation) {
          return { success: false, message: "Konsultasi tidak ditemukan." };
        }

        if (!jawaban.trim() || jawaban.trim().length < 10) {
          return { success: false, message: "Jawaban minimal 10 karakter." };
        }

        const now = new Date().toISOString();

        // Optimistic local update on the consultation.
        set((state) => ({
          consultations: state.consultations.map((c) =>
            c.id === consultationId
              ? {
                  ...c,
                  jawaban: jawaban.trim(),
                  status: "Sudah Dijawab" as ConsultationStatus,
                  adminId,
                  adminName,
                  answeredAt: now,
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Notification to the parent user.
        const userNotif: AppNotification = {
          id: genId(),
          userId: consultation.userId,
          consultationId,
          title: "Konsultasi Dijawab",
          message: `Konsultasi Anda untuk ${consultation.namaAnak} telah dijawab oleh ahli gizi.`,
          isRead: false,
          createdAt: now,
        };
        set((state) => ({
          notifications: [userNotif, ...state.notifications],
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const { error: consultError } = await supabase
                .from("consultations")
                .update({
                  jawaban: jawaban.trim(),
                  status: "Sudah Dijawab",
                  admin_id: adminId,
                  admin_name: adminName,
                  answered_at: now,
                  updated_at: now,
                })
                .eq("id", consultationId);
              if (consultError) {
                console.error("[Supabase answerConsultation] error:", consultError.message);
                return;
              }

              const { error: notifError } = await supabase
                .from("notifications")
                .insert({
                  id: userNotif.id,
                  user_id: consultation.userId,
                  consultation_id: consultationId,
                  title: userNotif.title,
                  message: userNotif.message,
                  is_read: false,
                  created_at: now,
                });
              if (notifError) {
                console.error("[Supabase answerConsultation notif] error:", notifError.message);
              }
            } catch (err) {
              console.error("[Supabase answerConsultation] exception:", err);
            }
          })();
        }

        return { success: true, message: "Jawaban berhasil dikirim." };
      },

      updateConsultationStatus: (consultationId, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          consultations: state.consultations.map((c) =>
            c.id === consultationId ? { ...c, status, updatedAt: now } : c
          ),
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const { error } = await supabase
                .from("consultations")
                .update({ status, updated_at: now })
                .eq("id", consultationId);
              if (error) {
                console.error("[Supabase updateConsultationStatus] error:", error.message);
              }
            } catch (err) {
              console.error("[Supabase updateConsultationStatus] exception:", err);
            }
          })();
        }
      },

      getConsultationsByUser: (userId) => {
        return get()
          .consultations.filter((c) => c.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getConsultationById: (id) => {
        return get().consultations.find((c) => c.id === id) || null;
      },

      getAllConsultations: () => {
        return get().consultations.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },

      // ============ NOTIFICATIONS ============
      getNotificationsByUser: (userId) => {
        return get()
          .notifications.filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getUnreadNotificationCount: (userId) => {
        return get().notifications.filter((n) => n.userId === userId && !n.isRead).length;
      },

      markNotificationRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", notificationId);
              if (error) {
                console.error("[Supabase markNotificationRead] error:", error.message);
              }
            } catch (err) {
              console.error("[Supabase markNotificationRead] exception:", err);
            }
          })();
        }
      },

      markAllNotificationsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, isRead: true } : n
          ),
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", userId)
                .eq("is_read", false);
              if (error) {
                console.error("[Supabase markAllNotificationsRead] error:", error.message);
              }
            } catch (err) {
              console.error("[Supabase markAllNotificationsRead] exception:", err);
            }
          })();
        }
      },

      // ============ STATS ============
      getStats: () => {
        const { consultations, users } = get();
        return {
          totalConsultations: consultations.length,
          menungguJawaban: consultations.filter((c) => c.status === "Menunggu Jawaban").length,
          sedangDiproses: consultations.filter((c) => c.status === "Sedang Diproses").length,
          sudahDijawab: consultations.filter((c) => c.status === "Sudah Dijawab").length,
          selesai: consultations.filter((c) => c.status === "Selesai").length,
          totalUsers: users.filter((u) => u.role === "user").length,
        };
      },

      // ============ SUPABASE-ONLY HELPERS ============

      restoreSession: async () => {
        if (!isSupabaseConfigured || !supabase) {
          return;
        }
        try {
          const { data: sessionData, error } = await supabase.auth.getSession();
          if (error) {
            console.error("[Supabase restoreSession] error:", error.message);
            return;
          }
          const user = sessionData?.session?.user;
          if (!user) {
            return;
          }

          // Fetch the matching profile.
          let profile: UserProfile | null = null;
          try {
            const { data: profileRow, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();
            if (profileError) {
              console.error("[Supabase restoreSession] profile error:", profileError.message);
            }
            if (profileRow) {
              profile = mapProfileRow(profileRow as ProfileRow, user.email);
            } else {
              profile = {
                id: user.id,
                namaOrangTua: (user.user_metadata?.nama_orang_tua as string) || "",
                email: user.email || "",
                nomorTelepon: (user.user_metadata?.nomor_telepon as string) || "",
                alamat: (user.user_metadata?.alamat as string) || "",
                passwordHash: "",
                role: "user",
                createdAt: user.created_at || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }
          } catch (err) {
            console.error("[Supabase restoreSession] profile fetch exception:", err);
          }

          const is_admin =
            profile?.role === "admin" ||
            user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL;

          set((state) => ({
            currentUserId: profile ? profile.id : state.currentUserId,
            isAdmin: is_admin,
            currentAdminId: is_admin ? (profile?.id || "admin-default") : null,
            users: profile
              ? [
                  ...state.users.filter((u) => u.id !== profile!.id),
                  profile!,
                ]
              : state.users,
            isAuthLoading: false,
            authError: null,
          }));

          // Hydrate the rest of the data from the server.
          await get().refreshData();
        } catch (err) {
          console.error("[Supabase restoreSession] exception:", err);
        }
      },

      refreshData: async () => {
        if (!isSupabaseConfigured || !supabase) {
          return;
        }
        const { currentUserId, isAdmin } = get();
        try {
          // Fetch consultations.
          let consultationRows: ConsultationRow[] = [];
          if (isAdmin) {
            // Admins see every consultation.
            const { data, error } = await supabase
              .from("consultations")
              .select("*")
              .order("created_at", { ascending: false });
            if (error) {
              console.error("[Supabase refreshData] consultations error:", error.message);
            } else if (data) {
              consultationRows = data as ConsultationRow[];
            }
          } else if (currentUserId) {
            const { data, error } = await supabase
              .from("consultations")
              .select("*")
              .eq("user_id", currentUserId)
              .order("created_at", { ascending: false });
            if (error) {
              console.error("[Supabase refreshData] consultations error:", error.message);
            } else if (data) {
              consultationRows = data as ConsultationRow[];
            }
          }
          const consultations = consultationRows.map(mapConsultationRow);

          // Fetch notifications.
          let notificationRows: NotificationRow[] = [];
          if (isAdmin) {
            // Admins see notifications addressed to "admin".
            const { data, error } = await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", "admin")
              .order("created_at", { ascending: false });
            if (error) {
              console.error("[Supabase refreshData] notifications error:", error.message);
            } else if (data) {
              notificationRows = data as NotificationRow[];
            }
          } else if (currentUserId) {
            const { data, error } = await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", currentUserId)
              .order("created_at", { ascending: false });
            if (error) {
              console.error("[Supabase refreshData] notifications error:", error.message);
            } else if (data) {
              notificationRows = data as NotificationRow[];
            }
          }
          const notifications = notificationRows.map(mapNotificationRow);

          // Fetch children (current user only).
          let children: ChildProfile[] = [];
          if (currentUserId) {
            const { data, error } = await supabase
              .from("children")
              .select("*")
              .eq("user_id", currentUserId)
              .order("created_at", { ascending: false });
            if (error) {
              console.error("[Supabase refreshData] children error:", error.message);
            } else if (data) {
              children = (data as ChildRow[]).map(mapChildRow);
            }
          }

          // For admins, also fetch a lightweight user count via profiles.
          let users: UserProfile[] = [];
          if (isAdmin) {
            const { data, error } = await supabase
              .from("profiles")
              .select("*")
              .order("created_at", { ascending: false });
            if (error) {
              console.error("[Supabase refreshData] profiles error:", error.message);
            } else if (data) {
              users = (data as ProfileRow[]).map((row) => mapProfileRow(row));
            }
          } else if (currentUserId) {
            // Make sure the current user's profile is in local state.
            const existing = get().users.find((u) => u.id === currentUserId);
            users = existing ? [existing] : [];
          }

          set((state) => ({
            consultations,
            notifications,
            children: children.length > 0 ? children : state.children,
            users: users.length > 0 ? users : state.users,
            lastRefreshedAt: new Date().toISOString(),
            isAuthLoading: false,
          }));
        } catch (err) {
          console.error("[Supabase refreshData] exception:", err);
        }
      },

      resetPassword: async (email) => {
        const emailLower = email.toLowerCase().trim();
        if (!emailLower) {
          return { success: false, message: "Email wajib diisi." };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
          return { success: false, message: "Format email tidak valid." };
        }

        if (isSupabaseConfigured && supabase) {
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(
              emailLower,
              {
                redirectTo: typeof window !== "undefined"
                  ? `${window.location.origin}/#reset-password`
                  : undefined,
              }
            );
            if (error) {
              console.error("[Supabase resetPassword] error:", error.message);
              return { success: false, message: error.message };
            }
            return {
              success: true,
              message: "Link reset password telah dikirim ke email Anda. Silakan cek inbox (dan folder spam).",
            };
          } catch (err) {
            console.error("[Supabase resetPassword] exception:", err);
            return { success: false, message: "Gagal mengirim email reset password." };
          }
        }

        // localStorage mode - no real email reset possible
        return {
          success: false,
          message: "Reset password tidak tersedia di mode offline. Hubungi admin untuk reset manual.",
        };
      },
    }),
    {
      name: "gemas-auth-storage",
      // In Supabase mode we only persist auth flags (the source of truth
      // lives on the server). In localStorage mode we persist everything
      // (the original behavior).
      partialize: (state) => {
        if (isSupabaseConfigured) {
          return {
            currentUserId: state.currentUserId,
            currentAdminId: state.currentAdminId,
            isAdmin: state.isAdmin,
          };
        }
        return {
          users: state.users,
          children: state.children,
          consultations: state.consultations,
          notifications: state.notifications,
        };
      },
    }
  )
);

// =====================================================
// HELPER HOOK: useSupabaseSession
// Restores the Supabase session on app load (no-op in localStorage mode).
// =====================================================

/**
 * Call this hook once at the app root to restore any existing Supabase
 * session and hydrate the store with server data. In localStorage mode
 * this is a no-op (the persist middleware already handled rehydration).
 */
export function useSupabaseSession() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void restoreSession();
  }, [restoreSession]);
}

// =====================================================
// HELPER EXPORTS
// =====================================================

export const AUTH_DEFAULTS = {
  adminEmail: DEFAULT_ADMIN_EMAIL,
  adminPassword: DEFAULT_ADMIN_PASSWORD,
};

export const CONSULTATION_STATUS_COLORS: Record<ConsultationStatus, { bg: string; text: string; emoji: string }> = {
  "Menunggu Jawaban": { bg: "bg-orange-100", text: "text-orange-700", emoji: "🟠" },
  "Sedang Diproses": { bg: "bg-blue-100", text: "text-blue-700", emoji: "🔵" },
  "Sudah Dijawab": { bg: "bg-green-100", text: "text-green-700", emoji: "🟢" },
  "Selesai": { bg: "bg-gray-100", text: "text-gray-700", emoji: "⚫" },
};
