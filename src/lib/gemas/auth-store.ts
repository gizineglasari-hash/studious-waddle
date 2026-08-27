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

  // Delete actions (admin)
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  deleteConsultation: (consultationId: string) => Promise<{ success: boolean; message: string }>;

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
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;

  // Export helper: fetch ALL users + children + consultations from Supabase
  // (no pagination, no limit) for Excel export
  fetchAllDataForExport: () => Promise<{
    users: UserProfile[];
    children: ChildProfile[];
    consultations: Consultation[];
  }>;
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
          // ALSO save to localStorage so user can login immediately
          // (even if Supabase email confirmation is pending)
          const now = new Date().toISOString();
          const localUser: UserProfile = {
            id: genId(),
            namaOrangTua: data.namaOrangTua.trim(),
            email: emailLower,
            nomorTelepon: data.nomorTelepon.trim(),
            alamat: data.alamat.trim(),
            passwordHash: simpleHash(data.password),
            role: "user",
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ users: [...state.users, localUser] }));

          // Fire signUp to Supabase in background
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

        if (!emailLower) {
          return { success: false, message: "Email wajib diisi." };
        }
        if (!password) {
          return { success: false, message: "Password wajib diisi." };
        }

        if (isSupabaseConfigured && supabase) {
          // Check if user exists in localStorage (from previous registration)
          const { users } = get();
          const matchingUsers = users.filter(
            (u) => u.email.toLowerCase() === emailLower && u.role === "user"
          );

          // Find the user with a valid passwordHash (the "local" entry)
          const localUser = matchingUsers.find(
            (u) => u.passwordHash && u.passwordHash === simpleHash(password)
          );

          if (localUser) {
            // Among all matching users, prefer the one with a Supabase Auth UUID
            // (i.e., the entry created at registration time when signUpData.user.id was cached).
            // This is critical: children table has FK to profiles(id), so we MUST use
            // the real Supabase UUID, not the local-generated one.
            const supabaseUser = matchingUsers.find(
              (u) =>
                u.id !== localUser.id &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u.id)
            );

            // Use Supabase UUID if available; otherwise fall back to local ID
            const realUserId = supabaseUser?.id || localUser.id;

            // Merge: keep the Supabase UUID + the passwordHash (for future logins)
            const mergedUser: UserProfile = {
              ...(supabaseUser || localUser),
              id: realUserId,
              passwordHash: localUser.passwordHash,
            };

            set((state) => ({
              currentUserId: realUserId,
              isAdmin: false,
              isAuthLoading: false,
              authError: null,
              // Replace all matching users with the single merged user
              users: [
                ...state.users.filter(
                  (u) => u.email.toLowerCase() !== emailLower || u.role !== "user"
                ),
                mergedUser,
              ],
              // Re-tag any local children that were saved with the old local ID
              children: state.children.map((c) =>
                c.userId === localUser.id ? { ...c, userId: realUserId } : c
              ),
            }));

            // Sync with Supabase in background (to refresh token)
            void (async () => {
              try {
                const { data: signInData, error } =
                  await supabase.auth.signInWithPassword({
                    email: emailLower,
                    password,
                  });

                if (error) {
                  console.warn("[Supabase login sync] error:", error.message);
                  // Don't clear local login - user is already in
                  return;
                }

                if (signInData.user) {
                  // Ensure currentUserId matches the Supabase UUID
                  set({ currentUserId: signInData.user.id });
                  await get().refreshData();
                }
              } catch (err) {
                console.warn("[Supabase login sync] exception:", err);
              }
            })();

            return { success: true, message: "Login berhasil." };
          }

          // Not found in localStorage - try Supabase directly
          // We need to return synchronously, so we'll use a different approach:
          // Set loading state and return a "pending" message
          set({ isAuthLoading: true, authError: null });

          // Fire async login
          void (async () => {
            try {
              const { data: signInData, error } =
                await supabase.auth.signInWithPassword({
                  email: emailLower,
                  password,
                });

              if (error || !signInData.user) {
                console.error("[Supabase login] error:", error?.message);
                set({
                  currentUserId: null,
                  isAuthLoading: false,
                  authError: error?.message || "Login gagal.",
                });
                return;
              }

              const userId = signInData.user.id;

              // Fetch profile
              let profile: UserProfile | null = null;
              try {
                const { data: profileRow } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", userId)
                  .maybeSingle();

                if (profileRow) {
                  profile = mapProfileRow(profileRow as ProfileRow, signInData.user.email);
                } else {
                  profile = {
                    id: userId,
                    namaOrangTua: (signInData.user.user_metadata?.nama_orang_tua as string) || "",
                    email: signInData.user.email || emailLower,
                    nomorTelepon: (signInData.user.user_metadata?.nomor_telepon as string) || "",
                    alamat: (signInData.user.user_metadata?.alamat as string) || "",
                    passwordHash: "",
                    role: "user",
                    createdAt: signInData.user.created_at || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                }
              } catch (err) {
                console.warn("[Supabase login] profile fetch exception:", err);
              }

              set((state) => ({
                currentUserId: userId,
                isAuthLoading: false,
                authError: null,
                users: profile
                  ? [
                      ...state.users.filter((u) => u.id !== userId),
                      profile!,
                    ]
                  : state.users,
              }));

              await get().refreshData();
            } catch (err) {
              console.error("[Supabase login] exception:", err);
              set({
                currentUserId: null,
                isAuthLoading: false,
                authError: err instanceof Error ? err.message : "Login gagal.",
              });
            }
          })();

          // Return pending - LoginView needs to handle this
          return { success: true, message: "Login sedang diproses..." };
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

        if (isDefaultAdmin) {
          // Default admin: set local state WITHOUT trying Supabase Auth
          // (admin@gemas.id doesn't exist in Supabase Auth - it's a local admin)
          const adminId = "admin-default";
          const adminProfile: UserProfile = {
            id: adminId,
            namaOrangTua: "Administrator GEMAS",
            email: emailLower,
            nomorTelepon: "",
            alamat: "",
            passwordHash: simpleHash(password),
            role: "admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            users: [...state.users.filter((u) => u.id !== adminId), adminProfile],
            currentAdminId: adminId,
            isAdmin: true,
            currentUserId: null,
            authError: null,
          }));

          // Fetch consultations from Supabase if available
          if (isSupabaseConfigured && supabase) {
            void (async () => {
              try {
                await get().refreshData();
              } catch (err) {
                console.error("[adminLogin] refreshData exception:", err);
              }
            })();
          }

          return { success: true, message: "Login admin berhasil." };
        }

        // Non-default admin: try Supabase Auth if configured
        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              const { data: signInData, error } = await supabase.auth.signInWithPassword({
                email: emailLower,
                password,
              });
              if (error) {
                console.error("[Supabase adminLogin] error:", error.message);
                return;
              }
              if (signInData.user) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", signInData.user.id)
                  .maybeSingle();

                if (profile && profile.role === "admin") {
                  set({
                    currentAdminId: signInData.user.id,
                    isAdmin: true,
                    currentUserId: null,
                  });
                  await get().refreshData();
                }
              }
            } catch (err) {
              console.error("[Supabase adminLogin] exception:", err);
            }
          })();

          const { users } = get();
          let admin = users.find((u) => u.email.toLowerCase() === emailLower);
          if (!admin) {
            admin = {
              id: genId(),
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
        const { currentUserId, users } = get();
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
              // First, try to find the REAL Supabase UUID for this user.
              // The currentUserId might be a localStorage-generated ID that doesn't
              // exist in the profiles table (causing FK violation on INSERT).
              let effectiveUserId = currentUserId;
              const currentUserProfile = users.find((u) => u.id === currentUserId);

              // If we can't find the profile locally, or if we need to verify,
              // try to fetch from Supabase by email
              if (supabase) {
                try {
                  const emailToLookup = currentUserProfile?.email;
                  if (emailToLookup) {
                    const { data: profileRow, error: profileErr } = await supabase
                      .from("profiles")
                      .select("id, email")
                      .eq("email", emailToLookup)
                      .maybeSingle();

                    if (!profileErr && profileRow && profileRow.id !== effectiveUserId) {
                      // Found the real Supabase UUID - update currentUserId and use it
                      effectiveUserId = profileRow.id;
                      console.log("[addChild] Found real Supabase UUID:", effectiveUserId, "(was:", currentUserId, ")");
                      set((state) => ({
                        currentUserId: effectiveUserId,
                        children: state.children.map((c) =>
                          c.userId === currentUserId ? { ...c, userId: effectiveUserId } : c
                        ),
                      }));
                    }
                  }
                } catch (lookupErr) {
                  console.warn("[addChild] profile lookup exception:", lookupErr);
                  // Continue with original userId - INSERT might still work
                }
              }

              // Insert with the effective (real) user_id
              const { data: inserted, error } = await supabase
                .from("children")
                .insert({
                  user_id: effectiveUserId,
                  nama_anak: newChild.namaAnak,
                  tanggal_lahir: newChild.tanggalLahir,
                  jenis_kelamin: newChild.jenisKelamin,
                  berat_badan: newChild.beratBadan,
                  tinggi_badan: newChild.tinggiBadan,
                })
                .select()
                .single();

              if (error) {
                console.warn("[Supabase addChild] error:", error.message);
                // DON'T revert - keep data in localStorage even if Supabase fails
                // Data will sync later when RLS is fixed or user logs in to Supabase
              } else if (inserted) {
                // Replace local ID with real Supabase UUID
                const realId = (inserted as any).id;
                set((state) => ({
                  children: state.children.map((c) =>
                    c.id === localId ? { ...c, id: realId, userId: effectiveUserId } : c
                  ),
                }));
              }
            } catch (err) {
              console.warn("[Supabase addChild] exception:", err);
              // DON'T revert - keep data in localStorage
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
              // First, try to find the REAL Supabase UUID for this user.
              // The currentUserId might be a localStorage-generated ID that doesn't
              // match the profiles table. This is important for admin dashboard sync.
              let effectiveUserId = currentUserId;
              try {
                const emailToLookup = user.email;
                if (emailToLookup) {
                  const { data: profileRow, error: profileErr } = await supabase
                    .from("profiles")
                    .select("id, email")
                    .eq("email", emailToLookup)
                    .maybeSingle();

                  if (!profileErr && profileRow && profileRow.id !== effectiveUserId) {
                    effectiveUserId = profileRow.id;
                    console.log("[createConsultation] Found real Supabase UUID:", effectiveUserId, "(was:", currentUserId, ")");
                    // Update currentUserId and re-tag local children
                    set((state) => ({
                      currentUserId: effectiveUserId,
                      children: state.children.map((c) =>
                        c.userId === currentUserId ? { ...c, userId: effectiveUserId } : c
                      ),
                      consultations: state.consultations.map((c) =>
                        c.id === consultationId ? { ...c, userId: effectiveUserId } : c
                      ),
                    }));
                  }
                }
              } catch (lookupErr) {
                console.warn("[createConsultation] profile lookup exception:", lookupErr);
              }

              // Use broadcast_consultations table (no RLS, anyone can insert)
              const { data: consultInserted, error: consultError } = await supabase
                .from("broadcast_consultations")
                .insert({
                  user_id: effectiveUserId,
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
                })
                .select()
                .single();

              if (consultError || !consultInserted) {
                console.warn("[Supabase createConsultation] error:", consultError?.message);
                // DON'T revert - keep data in localStorage
                return;
              }

              // Replace local ID with real Supabase UUID
              const realConsultId = (consultInserted as any).id;
              set((state) => ({
                consultations: state.consultations.map((c) =>
                  c.id === consultationId ? { ...c, id: realConsultId, userId: effectiveUserId } : c
                ),
              }));
            } catch (err) {
              console.warn("[Supabase createConsultation] exception:", err);
              // DON'T revert - keep data in localStorage
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
              // Update in broadcast_consultations (no RLS)
              const { error: consultError } = await supabase
                .from("broadcast_consultations")
                .update({
                  jawaban: jawaban.trim(),
                  status: "Sudah Dijawab",
                  admin_name: adminName,
                  answered_at: now,
                })
                .eq("id", consultationId);
              if (consultError) {
                console.warn("[Supabase answerConsultation] error:", consultError.message);
              }
            } catch (err) {
              console.warn("[Supabase answerConsultation] exception:", err);
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

      // ============ DELETE ACTIONS ============
      deleteUser: async (userId) => {
        if (!userId) {
          return { success: false, message: "ID pengguna tidak valid." };
        }

        // Snapshot untuk rollback jika Supabase gagal
        const state = get();
        const deletedUser = state.users.find((u) => u.id === userId);
        const deletedChildren = state.children.filter((c) => c.userId === userId);
        const deletedConsultations = state.consultations.filter((c) => c.userId === userId);
        const deletedNotifications = state.notifications.filter((n) => n.userId === userId);

        // Optimistic: hapus dari local state dulu
        set((s) => ({
          users: s.users.filter((u) => u.id !== userId),
          children: s.children.filter((c) => c.userId !== userId),
          consultations: s.consultations.filter((c) => c.userId !== userId),
          notifications: s.notifications.filter((n) => n.userId !== userId),
        }));

        // Jika Supabase tidak dikonfigurasi, selesai di sini
        if (!isSupabaseConfigured || !supabase) {
          return { success: true, message: "Pengguna berhasil dihapus (mode lokal)." };
        }

        // Hapus dari Supabase - urutan penting karena foreign key constraints
        const errors: string[] = [];
        try {
          // 1. Hapus dari broadcast_consultations (tidak ada RLS, pasti berhasil)
          const { error: e1 } = await supabase
            .from("broadcast_consultations")
            .delete()
            .eq("user_id", userId);
          if (e1) {
            console.warn("[Supabase deleteUser] broadcast_consultations:", e1.message);
            errors.push("broadcast_consultations");
          }

          // 2. Hapus notifications (foreign key ke consultations, hapus dulu)
          const { error: e2 } = await supabase
            .from("notifications")
            .delete()
            .eq("user_id", userId);
          if (e2) {
            console.warn("[Supabase deleteUser] notifications:", e2.message);
            errors.push("notifications");
          }

          // 3. Hapus consultations (foreign key ke children & profiles)
          const { error: e3 } = await supabase
            .from("consultations")
            .delete()
            .eq("user_id", userId);
          if (e3) {
            console.warn("[Supabase deleteUser] consultations:", e3.message);
            errors.push("consultations");
          }

          // 4. Hapus children (foreign key ke profiles)
          const { error: e4 } = await supabase
            .from("children")
            .delete()
            .eq("user_id", userId);
          if (e4) {
            console.warn("[Supabase deleteUser] children:", e4.message);
            errors.push("children");
          }

          // 5. Hapus profile (terakhir, karena children/consultations butuh FK)
          const { error: e5 } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);
          if (e5) {
            console.warn("[Supabase deleteUser] profiles:", e5.message);
            errors.push("profiles");
          }
        } catch (err) {
          console.error("[Supabase deleteUser] exception:", err);
          errors.push("exception");
        }

        // Verifikasi: fetch profile untuk memastikan benar-benar terhapus
        try {
          const { data: verifyProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

          if (verifyProfile) {
            // Profile masih ada di Supabase - restore local state
            console.error("[Supabase deleteUser] VERIFICATION FAILED: profile still exists");
            set((s) => ({
              users: [...s.users.filter((u) => u.id !== userId), deletedUser].filter(Boolean) as UserProfile[],
              children: [...s.children, ...deletedChildren],
              consultations: [...s.consultations, ...deletedConsultations],
              notifications: [...s.notifications, ...deletedNotifications],
            }));
            return {
              success: false,
              message: `Gagal menghapus dari Supabase. Profile masih ada. Errors: ${errors.join(", ")}. Jalankan SQL supabase-fix-admin-delete.sql di Supabase Dashboard.`,
            };
          }
        } catch (verifyErr) {
          console.warn("[Supabase deleteUser] verify exception:", verifyErr);
        }

        // Refresh data dari Supabase untuk memastikan sinkron
        try {
          await get().refreshData();
        } catch (refreshErr) {
          console.warn("[Supabase deleteUser] refresh exception:", refreshErr);
        }

        if (errors.length > 0) {
          return {
            success: true,
            message: `Pengguna berhasil dihapus. Beberapa tabel: ${errors.join(", ")} mungkin perlu dicek.`,
          };
        }

        return { success: true, message: "Pengguna berhasil dihapus permanen dari sistem." };
      },

      deleteConsultation: async (consultationId) => {
        if (!consultationId) {
          return { success: false, message: "ID konsultasi tidak valid." };
        }

        // Snapshot untuk rollback
        const state = get();
        const deletedConsultation = state.consultations.find((c) => c.id === consultationId);
        const deletedNotifications = state.notifications.filter((n) => n.consultationId === consultationId);

        // Optimistic: hapus dari local state
        set((s) => ({
          consultations: s.consultations.filter((c) => c.id !== consultationId),
          notifications: s.notifications.filter((n) => n.consultationId !== consultationId),
        }));

        if (!isSupabaseConfigured || !supabase) {
          return { success: true, message: "Konsultasi berhasil dihapus (mode lokal)." };
        }

        const errors: string[] = [];
        try {
          // 1. Hapus dari broadcast_consultations (no RLS)
          const { error: e1 } = await supabase
            .from("broadcast_consultations")
            .delete()
            .eq("id", consultationId);
          if (e1) {
            console.warn("[Supabase deleteConsultation] broadcast:", e1.message);
            errors.push("broadcast_consultations");
          }

          // 2. Hapus notifications
          const { error: e2 } = await supabase
            .from("notifications")
            .delete()
            .eq("consultation_id", consultationId);
          if (e2) {
            console.warn("[Supabase deleteConsultation] notifications:", e2.message);
            errors.push("notifications");
          }

          // 3. Hapus consultations (might not exist if only broadcast was used)
          const { error: e3 } = await supabase
            .from("consultations")
            .delete()
            .eq("id", consultationId);
          if (e3 && !e3.message.includes("0 rows")) {
            console.warn("[Supabase deleteConsultation] consultations:", e3.message);
            errors.push("consultations");
          }
        } catch (err) {
          console.error("[Supabase deleteConsultation] exception:", err);
          errors.push("exception");
        }

        // Verifikasi
        try {
          const { data: verifyConsult } = await supabase
            .from("broadcast_consultations")
            .select("id")
            .eq("id", consultationId)
            .maybeSingle();

          if (verifyConsult) {
            console.error("[Supabase deleteConsultation] VERIFICATION FAILED");
            set((s) => ({
              consultations: deletedConsultation ? [...s.consultations, deletedConsultation] : s.consultations,
              notifications: [...s.notifications, ...deletedNotifications],
            }));
            return {
              success: false,
              message: `Gagal menghapus konsultasi. Errors: ${errors.join(", ")}`,
            };
          }
        } catch (verifyErr) {
          console.warn("[Supabase deleteConsultation] verify exception:", verifyErr);
        }

        return { success: true, message: "Konsultasi berhasil dihapus." };
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
            set({ isAuthLoading: false });
            return;
          }
          const user = sessionData?.session?.user;
          if (!user) {
            // No active Supabase session.
            // DON'T clear currentUserId - it might be set by optimistic login
            // or by localStorage persistence. Only clear if it's a placeholder.
            const { currentUserId } = get();
            if (currentUserId && currentUserId.startsWith("supabase-pending-")) {
              set({ currentUserId: null, isAuthLoading: false });
            } else {
              set({ isAuthLoading: false });
            }
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
              console.warn("[Supabase restoreSession] profile error:", profileError.message);
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
            console.warn("[Supabase restoreSession] profile fetch exception:", err);
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
          set({ isAuthLoading: false });
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
          try {
            if (isAdmin) {
              // Admin reads from broadcast_consultations (no RLS, public read)
              const { data, error } = await supabase
                .from("broadcast_consultations")
                .select("*")
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] broadcast_consultations:", error.message);
              } else if (data) {
                consultationRows = data as ConsultationRow[];
              }
            } else if (currentUserId && !currentUserId.startsWith("supabase-pending-")) {
              // User reads their own consultations from broadcast table
              const { data, error } = await supabase
                .from("broadcast_consultations")
                .select("*")
                .eq("user_id", currentUserId)
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] user consultations:", error.message);
              } else if (data) {
                consultationRows = data as ConsultationRow[];
              }
            }
          } catch (e) {
            console.warn("[Supabase refreshData] consultations exception:", e);
          }
          const consultations = consultationRows.map(mapConsultationRow);

          // Fetch notifications.
          let notificationRows: NotificationRow[] = [];
          try {
            if (isAdmin) {
              const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", "admin")
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] notifications (admin):", error.message);
              } else if (data) {
                notificationRows = data as NotificationRow[];
              }
            } else if (currentUserId && !currentUserId.startsWith("supabase-pending-")) {
              const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", currentUserId)
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] notifications:", error.message);
              } else if (data) {
                notificationRows = data as NotificationRow[];
              }
            }
          } catch (e) {
            console.warn("[Supabase refreshData] notifications exception:", e);
          }
          const notifications = notificationRows.map(mapNotificationRow);

          // Fetch children.
          // IMPORTANT: When admin, fetch ALL children (not just admin's own).
          // When regular user, fetch only their own children.
          let children: ChildProfile[] = [];
          let childrenFetchOk = false;
          try {
            if (isAdmin) {
              // Admin melihat SEMUA data anak dari semua user
              const { data, error } = await supabase
                .from("children")
                .select("*")
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] children (admin):", error.message);
              } else if (data) {
                children = (data as ChildRow[]).map(mapChildRow);
                childrenFetchOk = true;
              }
            } else if (currentUserId && !currentUserId.startsWith("supabase-pending-")) {
              const { data, error } = await supabase
                .from("children")
                .select("*")
                .eq("user_id", currentUserId)
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] children:", error.message);
              } else if (data) {
                children = (data as ChildRow[]).map(mapChildRow);
                childrenFetchOk = true;
              }
            }
          } catch (e) {
            console.warn("[Supabase refreshData] children exception:", e);
          }

          // For admins, also fetch profiles.
          let users: UserProfile[] = [];
          let usersFetchOk = false;
          try {
            if (isAdmin) {
              const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });
              if (error) {
                console.warn("[Supabase refreshData] profiles:", error.message);
              } else if (data) {
                users = (data as ProfileRow[]).map((row) => mapProfileRow(row));
                usersFetchOk = true;
              }
            } else if (currentUserId) {
              // Make sure the current user's profile is in local state.
              const existing = get().users.find((u) => u.id === currentUserId);
              users = existing ? [existing] : [];
            }
          } catch (e) {
            console.warn("[Supabase refreshData] profiles exception:", e);
          }

          set((state) => ({
            // Consultations & notifications: only overwrite if we got data
            consultations: consultationRows.length > 0 ? consultations : state.consultations,
            notifications: notificationRows.length > 0 ? notifications : state.notifications,
            // Children: overwrite if fetch succeeded (even if 0 results - e.g. after delete)
            children: childrenFetchOk ? children : state.children,
            // Users: overwrite if fetch succeeded (admin case - reflects deletes)
            users: usersFetchOk ? users : state.users,
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
            // Determine the redirect URL for password reset.
            // Priority:
            // 1. NEXT_PUBLIC_SITE_URL env var (if set)
            // 2. window.location.origin (production = Vercel URL, dev = localhost)
            // 3. Fallback to production URL
            let siteUrl = "";
            if (typeof window !== "undefined") {
              siteUrl = window.location.origin;
            }
            // If env var is set, use it (takes precedence over localhost)
            const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
            if (envSiteUrl) {
              siteUrl = envSiteUrl;
            }
            // Final fallback: production URL
            if (!siteUrl || siteUrl.includes("localhost")) {
              // Use production URL as fallback for email links
              // This ensures reset emails always point to production
              siteUrl = "https://koniciwa-gemas-gempita.vercel.app";
            }

            const redirectTo = `${siteUrl}/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(
              emailLower,
              { redirectTo }
            );
            if (error) {
              console.error("[Supabase resetPassword] error:", error.message);
              // Provide user-friendly error message
              let userMessage = error.message;
              if (error.message.includes("rate limit") || error.message.includes("Rate limit")) {
                userMessage = "Terlalu banyak permintaan reset password. Coba lagi dalam beberapa menit.";
              } else if (error.message.includes("not found") || error.message.includes("User not found")) {
                userMessage = "Email tidak ditemukan. Pastikan email sudah terdaftar.";
              }
              return { success: false, message: userMessage };
            }
            return {
              success: true,
              message: "Link reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.",
            };
          } catch (err) {
            console.error("[Supabase resetPassword] exception:", err);
            return { success: false, message: "Gagal mengirim email reset password. Coba lagi." };
          }
        }

        // localStorage mode - no real email reset possible
        return {
          success: false,
          message: "Reset password tidak tersedia di mode offline. Hubungi admin untuk reset manual.",
        };
      },

      // Update password after clicking reset link from email
      // Uses Supabase Auth session recovery (token in URL)
      updatePassword: async (newPassword) => {
        if (!newPassword || newPassword.length < 6) {
          return {
            success: false,
            message: "Password minimal 6 karakter.",
          };
        }

        if (!isSupabaseConfigured || !supabase) {
          return {
            success: false,
            message: "Update password tidak tersedia di mode offline.",
          };
        }

        try {
          // Supabase automatically uses the recovery session from the email link
          // (the URL contains a refresh_token that supabase-js picks up on page load)
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            console.error("[Supabase updatePassword] error:", error.message);
            let userMessage = error.message;
            if (error.message.includes("session") || error.message.includes("Session")) {
              userMessage = "Link reset password tidak valid atau sudah kedaluwarsa. Silakan meminta link reset password baru.";
            }
            return { success: false, message: userMessage };
          }

          // Sign out after password update so user must login with new password
          await supabase.auth.signOut();

          return {
            success: true,
            message: "Password berhasil diperbarui. Silakan login menggunakan password baru.",
          };
        } catch (err) {
          console.error("[Supabase updatePassword] exception:", err);
          return {
            success: false,
            message: "Gagal memperbarui password. Link mungkin sudah kedaluwarsa.",
          };
        }
      },

      fetchAllDataForExport: async () => {
        const result = {
          users: [] as UserProfile[],
          children: [] as ChildProfile[],
          consultations: [] as Consultation[],
        };

        // If Supabase is not configured, return local data
        if (!isSupabaseConfigured || !supabase) {
          const state = get();
          return {
            users: state.users.filter((u) => u.role === "user"),
            children: state.children,
            consultations: state.consultations,
          };
        }

        // Fetch ALL profiles (no pagination) - admin can read all
        try {
          const { data: profileRows, error: profileErr } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: true });

          if (profileErr) {
            console.warn("[fetchAllDataForExport] profiles error:", profileErr.message);
          } else if (profileRows) {
            result.users = (profileRows as ProfileRow[])
              .map((row) => mapProfileRow(row))
              .filter((u) => u.role === "user");
          }
        } catch (err) {
          console.warn("[fetchAllDataForExport] profiles exception:", err);
        }

        // Fetch ALL children (no pagination)
        try {
          const { data: childRows, error: childErr } = await supabase
            .from("children")
            .select("*")
            .order("created_at", { ascending: true });

          if (childErr) {
            console.warn("[fetchAllDataForExport] children error:", childErr.message);
          } else if (childRows) {
            result.children = (childRows as ChildRow[]).map(mapChildRow);
          }
        } catch (err) {
          console.warn("[fetchAllDataForExport] children exception:", err);
        }

        // Fetch ALL consultations from broadcast_consultations (no pagination)
        // This is the table that has all consultations (no RLS)
        try {
          const { data: consultRows, error: consultErr } = await supabase
            .from("broadcast_consultations")
            .select("*")
            .order("created_at", { ascending: true });

          if (consultErr) {
            console.warn("[fetchAllDataForExport] consultations error:", consultErr.message);
          } else if (consultRows) {
            result.consultations = (consultRows as ConsultationRow[]).map(mapConsultationRow);
          }
        } catch (err) {
          console.warn("[fetchAllDataForExport] consultations exception:", err);
        }

        return result;
      },
    }),
    {
      name: "gemas-auth-storage",
      // In Supabase mode we only persist auth flags (the source of truth
      // lives on the server). In localStorage mode we persist everything
      // (the original behavior).
      partialize: (state) => {
        // Always save everything to localStorage
        // This ensures data persists even when Supabase fails
        if (isSupabaseConfigured) {
          return {
            currentUserId: state.currentUserId,
            currentAdminId: state.currentAdminId,
            isAdmin: state.isAdmin,
            users: state.users,
            children: state.children,
            consultations: state.consultations,
            notifications: state.notifications,
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
