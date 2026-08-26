"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
// SIMPLE PASSWORD HASH (DEMO ONLY - replace with Supabase Auth for production)
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

// =====================================================
// DEFAULT ADMIN
// =====================================================

const DEFAULT_ADMIN_EMAIL = "admin@gemas.id";
const DEFAULT_ADMIN_PASSWORD = "admin2026";

// =====================================================
// AUTH STORE
// =====================================================

interface AuthState {
  // Current session
  currentUserId: string | null;
  currentAdminId: string | null;
  isAdmin: boolean;

  // Data (persisted)
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      currentAdminId: null,
      isAdmin: false,
      users: [],
      children: [],
      consultations: [],
      notifications: [],

      // ============ AUTH ============
      register: (data) => {
        const { users } = get();
        const emailLower = data.email.toLowerCase().trim();

        // Check if email already exists
        if (users.some((u) => u.email.toLowerCase() === emailLower)) {
          return { success: false, message: "Email sudah terdaftar. Silakan login." };
        }

        // Validate
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

        const newUser: UserProfile = {
          id: generateId(),
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
        const { users } = get();
        const emailLower = email.toLowerCase().trim();
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
        set({ currentUserId: null });
      },

      adminLogin: (email, password) => {
        const emailLower = email.toLowerCase().trim();

        // Check default admin credentials
        if (emailLower === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
          // Create or find admin user
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

        // Also check if any user has admin role
        const { users } = get();
        const admin = users.find((u) => u.role === "admin" && u.email.toLowerCase() === emailLower);
        if (admin && admin.passwordHash === simpleHash(password)) {
          set({ currentAdminId: admin.id, isAdmin: true, currentUserId: null });
          return { success: true, message: "Login admin berhasil." };
        }

        return { success: false, message: "Email atau password admin salah." };
      },

      adminLogout: () => {
        set({ currentAdminId: null, isAdmin: false });
      },

      // ============ PROFILE ============
      updateProfile: (userId, data) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, ...data, updatedAt: new Date().toISOString() }
              : u
          ),
        }));
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

        const newChild: ChildProfile = {
          ...data,
          id: generateId(),
          userId: currentUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ children: [...state.children, newChild] }));
        return { success: true, message: "Data anak berhasil disimpan." };
      },

      updateChild: (childId, data) => {
        set((state) => ({
          children: state.children.map((c) =>
            c.id === childId
              ? { ...c, ...data, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
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

        const consultationId = generateId();
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

        // Create notification for admin
        const adminNotif: AppNotification = {
          id: generateId(),
          userId: "admin",
          consultationId,
          title: "Konsultasi Baru",
          message: `Orang tua ${user.namaOrangTua} mengirimkan konsultasi untuk anak bernama ${child.namaAnak}.`,
          isRead: false,
          createdAt: now,
        };

        set((state) => ({
          consultations: [newConsultation, ...state.consultations],
          notifications: [adminNotif, ...state.notifications],
        }));

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

        // Create notification for user
        const userNotif: AppNotification = {
          id: generateId(),
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

        return { success: true, message: "Jawaban berhasil dikirim." };
      },

      updateConsultationStatus: (consultationId, status) => {
        set((state) => ({
          consultations: state.consultations.map((c) =>
            c.id === consultationId
              ? { ...c, status, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
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
      },

      markAllNotificationsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, isRead: true } : n
          ),
        }));
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
    }),
    {
      name: "gemas-auth-storage",
      partialize: (state) => ({
        users: state.users,
        children: state.children,
        consultations: state.consultations,
        notifications: state.notifications,
      }),
    }
  )
);

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
