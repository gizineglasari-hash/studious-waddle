"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// =====================================================
// TYPES
// =====================================================

export type ContentType = "video" | "image" | "pdf" | "article" | "banner";
export type ContentCategory =
  | "MP-ASI"
  | "PMBA"
  | "Gizi Anak"
  | "Pertumbuhan Anak"
  | "Gizi Seimbang"
  | "Tips Makan Anak"
  | "Kesehatan Anak"
  | "Lainnya";

export type VideoSource = "upload" | "youtube" | "vimeo" | "url";

export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  category: ContentCategory;
  // Media fields
  mediaUrl?: string; // For uploaded files (data URL or path)
  externalUrl?: string; // For YouTube/Vimeo/external links
  videoSource?: VideoSource; // For videos only
  thumbnailUrl?: string;
  // Article fields
  articleContent?: string;
  // Status & ordering
  isActive: boolean;
  displayOrder: number;
  // Metadata
  duration?: string; // For videos (e.g., "5:30")
  fileSize?: string; // For uploads
  createdBy: string; // admin email
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// DEFAULT CONTENT (seed data from existing website)
// =====================================================

const DEFAULT_CONTENT: EducationalContent[] = [
  {
    id: "default-video-mpasi",
    title: "Video Edukasi MP-ASI dan Resep MP-ASI",
    description:
      "Video edukasi resmi dari UPTD Puskesmas Neglasari Kota Bandung. Pelajari cara memberikan MP-ASI yang tepat sesuai usia anak beserta contoh resep MP-ASI bergizi yang mudah dibuat di rumah.",
    contentType: "video",
    category: "MP-ASI",
    videoSource: "upload",
    mediaUrl: "/videos/video-mp-asi-resep.mp4",
    duration: "Lokal",
    isActive: true,
    displayOrder: 1,
    createdBy: "admin@gemas.id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-pdf-buku-foto",
    title: "Buku Foto Makanan GEMAS (Indeks Search)",
    description:
      "Buku foto makanan digital berisi daftar bahan makanan beserta ukuran rumah tangga (URT), berat, dan kandungan gizi. Cocok untuk panduan praktis dalam menyusun menu makan anak sehari-hari.",
    contentType: "pdf",
    category: "Gizi Seimbang",
    mediaUrl: "/pdfs/buku-foto-makanan.pdf",
    fileSize: "44 MB",
    isActive: true,
    displayOrder: 2,
    createdBy: "admin@gemas.id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// =====================================================
// STORE
// =====================================================

function generateId(): string {
  return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ContentState {
  contents: EducationalContent[];

  // CRUD actions
  addContent: (data: Omit<EducationalContent, "id" | "createdAt" | "updatedAt">) => { success: boolean; message: string; id?: string };
  updateContent: (id: string, data: Partial<EducationalContent>) => { success: boolean; message: string };
  deleteContent: (id: string) => { success: boolean; message: string };
  toggleActive: (id: string) => void;
  updateOrder: (id: string, newOrder: number) => void;

  // Query actions
  getAllContents: () => EducationalContent[];
  getActiveContents: () => EducationalContent[];
  getContentsByType: (type: ContentType) => EducationalContent[];
  getActiveByType: (type: ContentType) => EducationalContent[];
  getContentsByCategory: (category: ContentCategory) => EducationalContent[];
  getContentById: (id: string) => EducationalContent | null;
  reorderContents: (ids: string[]) => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      contents: DEFAULT_CONTENT,

      addContent: (data) => {
        if (!data.title.trim()) {
          return { success: false, message: "Judul wajib diisi." };
        }
        if (!data.contentType) {
          return { success: false, message: "Jenis konten wajib dipilih." };
        }

        const newContent: EducationalContent = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          contents: [...state.contents, newContent],
        }));

        return { success: true, message: "Konten berhasil ditambahkan.", id: newContent.id };
      },

      updateContent: (id, data) => {
        const { contents } = get();
        const content = contents.find((c) => c.id === id);
        if (!content) {
          return { success: false, message: "Konten tidak ditemukan." };
        }

        set((state) => ({
          contents: state.contents.map((c) =>
            c.id === id
              ? { ...c, ...data, updatedAt: new Date().toISOString() }
              : c
          ),
        }));

        return { success: true, message: "Konten berhasil diperbarui." };
      },

      deleteContent: (id) => {
        const { contents } = get();
        const content = contents.find((c) => c.id === id);
        if (!content) {
          return { success: false, message: "Konten tidak ditemukan." };
        }

        set((state) => ({
          contents: state.contents.filter((c) => c.id !== id),
        }));

        return { success: true, message: "Konten berhasil dihapus." };
      },

      toggleActive: (id) => {
        set((state) => ({
          contents: state.contents.map((c) =>
            c.id === id
              ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      updateOrder: (id, newOrder) => {
        set((state) => ({
          contents: state.contents.map((c) =>
            c.id === id
              ? { ...c, displayOrder: newOrder, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      getAllContents: () => {
        return get()
          .contents.slice()
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      getActiveContents: () => {
        return get()
          .contents.filter((c) => c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      getContentsByType: (type) => {
        return get()
          .contents.filter((c) => c.contentType === type)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      getActiveByType: (type) => {
        return get()
          .contents.filter((c) => c.contentType === type && c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      getContentsByCategory: (category) => {
        return get()
          .contents.filter((c) => c.category === category)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      getContentById: (id) => {
        return get().contents.find((c) => c.id === id) || null;
      },

      reorderContents: (ids) => {
        set((state) => ({
          contents: state.contents.map((c) => {
            const newOrder = ids.indexOf(c.id);
            return newOrder >= 0
              ? { ...c, displayOrder: newOrder + 1, updatedAt: new Date().toISOString() }
              : c;
          }),
        }));
      },
    }),
    {
      name: "gemas-content-storage",
    }
  )
);

// =====================================================
// CONSTANTS
// =====================================================

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: "Video Edukasi",
  image: "Media/Gambar",
  pdf: "Materi PDF",
  article: "Artikel",
  banner: "Banner/Informasi",
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  video: "🎬",
  image: "🖼️",
  pdf: "📄",
  article: "📝",
  banner: "📢",
};

export const CONTENT_CATEGORIES: ContentCategory[] = [
  "MP-ASI",
  "PMBA",
  "Gizi Anak",
  "Pertumbuhan Anak",
  "Gizi Seimbang",
  "Tips Makan Anak",
  "Kesehatan Anak",
  "Lainnya",
];

export const VIDEO_CATEGORIES: ContentCategory[] = [
  "MP-ASI",
  "PMBA",
  "Gizi Anak",
  "Pertumbuhan Anak",
  "Gizi Seimbang",
  "Lainnya",
];
