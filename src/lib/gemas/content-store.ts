"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
// SUPABASE ROW MAPPERS
// =====================================================

interface ContentRow {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  category: string | null;
  media_url: string | null;
  external_url: string | null;
  video_source: string | null;
  thumbnail_url: string | null;
  article_content: string | null;
  is_active: boolean;
  display_order: number;
  duration: string | null;
  file_size: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

function mapContentRow(row: ContentRow): EducationalContent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    contentType: (row.content_type as ContentType) ?? "video",
    category: (row.category as ContentCategory) ?? "Lainnya",
    mediaUrl: row.media_url ?? undefined,
    externalUrl: row.external_url ?? undefined,
    videoSource: (row.video_source as VideoSource) ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    articleContent: row.article_content ?? undefined,
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 0,
    duration: row.duration ?? undefined,
    fileSize: row.file_size ?? undefined,
    createdBy: row.created_by ?? "admin@gemas.id",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInsertRow(content: EducationalContent): Record<string, unknown> {
  return {
    title: content.title,
    description: content.description,
    content_type: content.contentType,
    category: content.category,
    media_url: content.mediaUrl ?? null,
    external_url: content.externalUrl ?? null,
    video_source: content.videoSource ?? null,
    thumbnail_url: content.thumbnailUrl ?? null,
    article_content: content.articleContent ?? null,
    is_active: content.isActive,
    display_order: content.displayOrder,
    duration: content.duration ?? null,
    file_size: content.fileSize ?? null,
    created_by: content.createdBy,
  };
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
  isLoading: boolean;
  lastRefreshedAt: string | null;

  // CRUD actions
  addContent: (data: Omit<EducationalContent, "id" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; message: string; id?: string }>;
  updateContent: (id: string, data: Partial<EducationalContent>) => Promise<{ success: boolean; message: string }>;
  deleteContent: (id: string) => Promise<{ success: boolean; message: string }>;
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

  // Supabase sync
  refreshContents: () => Promise<void>;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      contents: DEFAULT_CONTENT,
      isLoading: false,
      lastRefreshedAt: null,

      addContent: async (data) => {
        if (!data.title.trim()) {
          return { success: false, message: "Judul wajib diisi." };
        }
        if (!data.contentType) {
          return { success: false, message: "Jenis konten wajib dipilih." };
        }

        const now = new Date().toISOString();
        const localId = generateId();
        const newContent: EducationalContent = {
          ...data,
          id: localId,
          createdAt: now,
          updatedAt: now,
        };

        // Optimistic local update
        set((state) => ({
          contents: [...state.contents, newContent],
        }));

        // Sync to Supabase
        if (isSupabaseConfigured && supabase) {
          try {
            const insertRow = toInsertRow(newContent);
            // Try with return=representation first (returns the inserted row with real UUID)
            const { data: inserted, error } = await supabase
              .from("educational_contents")
              .insert(insertRow)
              .select()
              .single();

            if (error) {
              // Check if this is an RLS error (likely due to is_active=false Draft)
              if (error.message.includes("row-level security") || error.code === "42501") {
                // Fallback: insert without return=representation
                // The row IS still inserted, we just can't SELECT it back
                const { error: insertError2 } = await supabase
                  .from("educational_contents")
                  .insert(insertRow);

                if (insertError2) {
                  console.warn("[Supabase addContent] fallback insert error:", insertError2.message);
                  return {
                    success: true,
                    message: "Konten ditambahkan lokal. Sinkronisasi Supabase gagal - jalankan SQL supabase-fix-content-rls-v2.sql.",
                    id: localId,
                  };
                }

                // Insert succeeded but we don't have the real UUID.
                // Trigger a refresh to fetch it from Supabase.
                console.log("[Supabase addContent] Draft insert succeeded (no return value). Refreshing...");
                setTimeout(() => {
                  void get().refreshContents();
                }, 500);
                return {
                  success: true,
                  message: data.isActive
                    ? "Konten berhasil dipublikasikan dan sekarang tersedia di halaman Video dan Media Edukasi."
                    : "Konten berhasil disimpan sebagai Draft.",
                  id: localId,
                };
              }

              // Other errors
              console.warn("[Supabase addContent] error:", error.message);
              return {
                success: true,
                message: "Konten ditambahkan lokal. Sinkronisasi Supabase gagal: " + error.message,
                id: localId,
              };
            }

            if (inserted) {
              const realId = (inserted as ContentRow).id;
              // Replace local ID with Supabase UUID
              set((state) => ({
                contents: state.contents.map((c) =>
                  c.id === localId ? { ...c, id: realId } : c
                ),
              }));
              return {
                success: true,
                message: data.isActive
                  ? "Konten berhasil dipublikasikan dan sekarang tersedia di halaman Video dan Media Edukasi."
                  : "Konten berhasil disimpan sebagai Draft.",
                id: realId,
              };
            }
          } catch (err) {
            console.warn("[Supabase addContent] exception:", err);
            return {
              success: true,
              message: "Konten ditambahkan lokal. Error sinkronisasi Supabase.",
              id: localId,
            };
          }
        }

        return { success: true, message: "Konten berhasil ditambahkan.", id: localId };
      },

      updateContent: async (id, data) => {
        const { contents } = get();
        const content = contents.find((c) => c.id === id);
        if (!content) {
          return { success: false, message: "Konten tidak ditemukan." };
        }

        const now = new Date().toISOString();
        const updatedContent = { ...content, ...data, updatedAt: now };

        // Optimistic local update
        set((state) => ({
          contents: state.contents.map((c) =>
            c.id === id ? updatedContent : c
          ),
        }));

        // Sync to Supabase
        if (isSupabaseConfigured && supabase) {
          try {
            const updateRow: Record<string, unknown> = { updated_at: now };
            if (data.title !== undefined) updateRow.title = data.title;
            if (data.description !== undefined) updateRow.description = data.description;
            if (data.contentType !== undefined) updateRow.content_type = data.contentType;
            if (data.category !== undefined) updateRow.category = data.category;
            if (data.mediaUrl !== undefined) updateRow.media_url = data.mediaUrl;
            if (data.externalUrl !== undefined) updateRow.external_url = data.externalUrl;
            if (data.videoSource !== undefined) updateRow.video_source = data.videoSource;
            if (data.thumbnailUrl !== undefined) updateRow.thumbnail_url = data.thumbnailUrl;
            if (data.articleContent !== undefined) updateRow.article_content = data.articleContent;
            if (data.isActive !== undefined) updateRow.is_active = data.isActive;
            if (data.displayOrder !== undefined) updateRow.display_order = data.displayOrder;
            if (data.duration !== undefined) updateRow.duration = data.duration;
            if (data.fileSize !== undefined) updateRow.file_size = data.fileSize;
            if (data.createdBy !== undefined) updateRow.created_by = data.createdBy;

            const { error } = await supabase
              .from("educational_contents")
              .update(updateRow)
              .eq("id", id);

            if (error) {
              console.warn("[Supabase updateContent] error:", error.message);
              return { success: true, message: "Konten diperbarui lokal. Sinkronisasi Supabase gagal: " + error.message };
            }

            // Build appropriate success message
            let message = "Konten berhasil diperbarui dan tersinkronisasi.";
            if (data.isActive === true) {
              message = "Konten berhasil dipublikasikan dan sekarang tersedia di halaman Video dan Media Edukasi.";
            } else if (data.isActive === false) {
              message = "Konten berhasil diubah menjadi Draft dan tidak lagi ditampilkan di halaman publik.";
            }
            return { success: true, message };
          } catch (err) {
            console.warn("[Supabase updateContent] exception:", err);
            return { success: true, message: "Konten diperbarui lokal. Error sinkronisasi." };
          }
        }

        return { success: true, message: "Konten berhasil diperbarui." };
      },

      deleteContent: async (id) => {
        const { contents } = get();
        const content = contents.find((c) => c.id === id);
        if (!content) {
          return { success: false, message: "Konten tidak ditemukan." };
        }

        // Optimistic local delete
        set((state) => ({
          contents: state.contents.filter((c) => c.id !== id),
        }));

        // Sync to Supabase
        if (isSupabaseConfigured && supabase) {
          try {
            const { error } = await supabase
              .from("educational_contents")
              .delete()
              .eq("id", id);

            if (error) {
              console.warn("[Supabase deleteContent] error:", error.message);
              // Restore local copy since Supabase delete failed
              set((state) => ({
                contents: [...state.contents, content],
              }));
              return { success: false, message: `Gagal menghapus dari Supabase: ${error.message}` };
            }

            return { success: true, message: "Konten berhasil dihapus." };
          } catch (err) {
            console.warn("[Supabase deleteContent] exception:", err);
            // Restore local copy
            set((state) => ({
              contents: [...state.contents, content],
            }));
            return { success: false, message: "Error sinkronisasi Supabase." };
          }
        }

        return { success: true, message: "Konten berhasil dihapus." };
      },

      toggleActive: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          contents: state.contents.map((c) =>
            c.id === id
              ? { ...c, isActive: !c.isActive, updatedAt: now }
              : c
          ),
        }));

        // Sync to Supabase
        if (isSupabaseConfigured && supabase) {
          const content = get().contents.find((c) => c.id === id);
          if (content) {
            void (async () => {
              try {
                await supabase
                  .from("educational_contents")
                  .update({ is_active: content.isActive, updated_at: now })
                  .eq("id", id);
              } catch (err) {
                console.warn("[Supabase toggleActive] exception:", err);
              }
            })();
          }
        }
      },

      updateOrder: (id, newOrder) => {
        const now = new Date().toISOString();
        set((state) => ({
          contents: state.contents.map((c) =>
            c.id === id
              ? { ...c, displayOrder: newOrder, updatedAt: now }
              : c
          ),
        }));

        if (isSupabaseConfigured && supabase) {
          void (async () => {
            try {
              await supabase
                .from("educational_contents")
                .update({ display_order: newOrder, updated_at: now })
                .eq("id", id);
            } catch (err) {
              console.warn("[Supabase updateOrder] exception:", err);
            }
          })();
        }
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
        const now = new Date().toISOString();
        set((state) => ({
          contents: state.contents.map((c) => {
            const newOrder = ids.indexOf(c.id);
            return newOrder >= 0
              ? { ...c, displayOrder: newOrder + 1, updatedAt: now }
              : c;
          }),
        }));

        // Bulk sync to Supabase
        if (isSupabaseConfigured && supabase) {
          const supa = supabase;
          void (async () => {
            try {
              const updates = ids.map((id, i) =>
                supa
                  .from("educational_contents")
                  .update({ display_order: i + 1, updated_at: now })
                  .eq("id", id)
              );
              await Promise.all(updates);
            } catch (err) {
              console.warn("[Supabase reorderContents] exception:", err);
            }
          })();
        }
      },

      refreshContents: async () => {
        if (!isSupabaseConfigured || !supabase) {
          return;
        }
        set({ isLoading: true });
        try {
          // Fetch ALL content from Supabase.
          // After v2 RLS: anon can see all (active + inactive).
          // Before v2 RLS (current state): anon only sees is_active=true.
          // In that case, we preserve local drafts that aren't in Supabase yet.
          const { data, error } = await supabase
            .from("educational_contents")
            .select("*")
            .order("display_order", { ascending: true });

          if (error) {
            console.warn("[Supabase refreshContents] error:", error.message);
            set({ isLoading: false });
            return;
          }

          if (data && data.length > 0) {
            const contents = (data as ContentRow[]).map(mapContentRow);
            const supabaseIds = new Set(contents.map((c) => c.id));

            // Preserve local-only content:
            // - Default seed content (id starts with "default-")
            // - Local drafts that failed to sync to Supabase (have non-UUID id)
            const localOnly = get().contents.filter((c) => {
              if (supabaseIds.has(c.id)) return false;
              // Keep default seed content for backward compat
              if (c.id.startsWith("default-")) return true;
              // Keep local drafts (non-UUID ids = not yet synced)
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.id);
              if (!isUuid) return true;
              return false;
            });

            set({
              contents: [...contents, ...localOnly],
              isLoading: false,
              lastRefreshedAt: new Date().toISOString(),
            });
          } else {
            // Supabase is empty - keep defaults
            set({ isLoading: false, lastRefreshedAt: new Date().toISOString() });
          }
        } catch (err) {
          console.warn("[Supabase refreshContents] exception:", err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "gemas-content-storage",
      partialize: (state) => ({
        contents: state.contents,
        lastRefreshedAt: state.lastRefreshedAt,
      }),
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
