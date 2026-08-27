"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  FileVideo,
  FileImage,
  FileText,
  Newspaper,
  LayoutGrid,
  Search,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  Upload,
  Youtube,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useContentStore,
  type EducationalContent,
  type ContentType,
  type ContentCategory,
  type VideoSource,
  CONTENT_TYPE_LABELS,
  CONTENT_CATEGORIES,
  VIDEO_CATEGORIES,
} from "@/lib/gemas/content-store";
import { useAuthStore } from "@/lib/gemas/auth-store";
import { useGemasStore } from "@/lib/gemas/store";

// =====================================================
// TYPES & CONSTANTS
// =====================================================

type FilterTabKey = "all" | ContentType;

interface FilterTab {
  key: FilterTabKey;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "Semua" },
  { key: "video", label: "Video Edukasi" },
  { key: "image", label: "Media/Gambar" },
  { key: "pdf", label: "Materi PDF" },
  { key: "article", label: "Artikel" },
  { key: "banner", label: "Banner" },
];

interface ContentFormData {
  title: string;
  description: string;
  contentType: ContentType;
  category: ContentCategory;
  videoSource: VideoSource;
  externalUrl: string;
  mediaUrl: string;
  thumbnailUrl: string;
  articleContent: string;
  duration: string;
  isActive: boolean;
  displayOrder: number;
  fileSize: string;
  mediaFileName: string;
  thumbnailFileName: string;
}

const DEFAULT_FORM: ContentFormData = {
  title: "",
  description: "",
  contentType: "video",
  category: "MP-ASI",
  videoSource: "upload",
  externalUrl: "",
  mediaUrl: "",
  thumbnailUrl: "",
  articleContent: "",
  duration: "",
  isActive: true,
  displayOrder: 1,
  fileSize: "",
  mediaFileName: "",
  thumbnailFileName: "",
};

const VIDEO_SOURCE_OPTIONS: {
  value: VideoSource;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "upload", label: "Upload", icon: Upload },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "vimeo", label: "Vimeo", icon: ExternalLink },
  { value: "url", label: "URL Langsung", icon: LinkIcon },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB warning threshold

// =====================================================
// HELPERS
// =====================================================

function getContentTypeIcon(
  type: ContentType
): React.ComponentType<{ className?: string }> {
  switch (type) {
    case "video":
      return FileVideo;
    case "image":
      return FileImage;
    case "pdf":
      return FileText;
    case "article":
      return Newspaper;
    case "banner":
      return LayoutGrid;
    default:
      return FileText;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

function getMediaAccept(type: ContentType): string {
  switch (type) {
    case "video":
      return "video/*";
    case "image":
      return "image/*";
    case "pdf":
      return ".pdf,application/pdf";
    default:
      return "";
  }
}

function getMediaAcceptLabel(type: ContentType): string {
  switch (type) {
    case "video":
      return "video (MP4, WebM, MOV)";
    case "image":
      return "gambar (JPG, PNG, WebP)";
    case "pdf":
      return "PDF";
    default:
      return "file";
  }
}

// =====================================================
// COMPONENT
// =====================================================

export function EditWebsiteView() {
  const { toast } = useToast();
  const { setView } = useGemasStore();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const getCurrentUser = useAuthStore((s) => s.getCurrentUser);

  const contents = useContentStore((s) => s.contents);
  const addContent = useContentStore((s) => s.addContent);
  const updateContent = useContentStore((s) => s.updateContent);
  const deleteContent = useContentStore((s) => s.deleteContent);
  const toggleActive = useContentStore((s) => s.toggleActive);
  const updateOrder = useContentStore((s) => s.updateOrder);
  const refreshContents = useContentStore((s) => s.refreshContents);

  // Hydration-safe mount flag
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh contents from Supabase on mount
  useEffect(() => {
    if (mounted && isAdmin) {
      refreshContents();
    }
  }, [mounted, isAdmin, refreshContents]);

  // Redirect non-admins (safe effect — no derived state sync)
  useEffect(() => {
    if (mounted && !isAdmin) {
      toast({
        title: "Akses ditolak",
        description: "Silakan login sebagai admin terlebih dahulu.",
        variant: "destructive",
      });
      setView("admin-login");
    }
  }, [mounted, isAdmin, setView, toast]);

  // UI state
  const [activeFilter, setActiveFilter] = useState<FilterTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [form, setForm] = useState<ContentFormData>(DEFAULT_FORM);

  // Sorted (by displayOrder) — reactive to store changes
  const sortedContents = useMemo(() => {
    return [...contents].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [contents]);

  // Filtered by tab + search
  const filteredContents = useMemo(() => {
    let list = sortedContents;
    if (activeFilter !== "all") {
      list = list.filter((c) => c.contentType === activeFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }
    return list;
  }, [sortedContents, activeFilter, searchQuery]);

  // Counts per tab
  const tabCounts = useMemo(() => {
    const map: Record<FilterTabKey, number> = {
      all: sortedContents.length,
      video: 0,
      image: 0,
      pdf: 0,
      article: 0,
      banner: 0,
    };
    sortedContents.forEach((c) => {
      map[c.contentType] = (map[c.contentType] ?? 0) + 1;
    });
    return map;
  }, [sortedContents]);

  // Available categories based on content type
  const availableCategories = useMemo<ContentCategory[]>(() => {
    return form.contentType === "video" ? VIDEO_CATEGORIES : CONTENT_CATEGORIES;
  }, [form.contentType]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleOpenAdd = () => {
    const maxOrder =
      sortedContents.length > 0
        ? Math.max(...sortedContents.map((c) => c.displayOrder))
        : 0;
    setForm({ ...DEFAULT_FORM, displayOrder: maxOrder + 1 });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (content: EducationalContent) => {
    setForm({
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      category: content.category,
      videoSource: content.videoSource ?? "upload",
      externalUrl: content.externalUrl ?? "",
      mediaUrl: content.mediaUrl ?? "",
      thumbnailUrl: content.thumbnailUrl ?? "",
      articleContent: content.articleContent ?? "",
      duration: content.duration ?? "",
      isActive: content.isActive,
      displayOrder: content.displayOrder,
      fileSize: content.fileSize ?? "",
      mediaFileName: content.mediaUrl ? content.mediaUrl.split("/").pop() ?? "" : "",
      thumbnailFileName: content.thumbnailUrl
        ? content.thumbnailUrl.split("/").pop() ?? ""
        : "",
    });
    setEditingId(content.id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleContentTypeChange = (type: ContentType) => {
    setForm((prev) => {
      const validCategories =
        type === "video" ? VIDEO_CATEGORIES : CONTENT_CATEGORIES;
      const categoryValid = validCategories.includes(prev.category);
      return {
        ...prev,
        contentType: type,
        category: categoryValid ? prev.category : validCategories[0],
        // Reset media fields when changing type to avoid stale data
        mediaUrl: "",
        externalUrl: "",
        mediaFileName: "",
        fileSize: "",
        videoSource: type === "video" ? prev.videoSource : "upload",
      };
    });
  };

  const handleVideoSourceChange = (source: VideoSource) => {
    setForm((prev) => ({
      ...prev,
      videoSource: source,
      // Clear media fields when switching source type
      mediaUrl: "",
      externalUrl: "",
      mediaFileName: "",
      fileSize: "",
    }));
  };

  const handleMediaFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "Peringatan ukuran file",
        description:
          "File lebih besar dari 5MB dapat melebihi batas penyimpanan browser (localStorage). Pertimbangkan untuk menggunakan URL eksternal sebagai gantinya.",
        variant: "destructive",
      });
    }

    setProcessingFile(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({
        ...prev,
        mediaUrl: dataUrl,
        fileSize: formatFileSize(file.size),
        mediaFileName: file.name,
        externalUrl: "",
      }));
    } catch {
      toast({
        title: "Gagal memproses file",
        description: "Terjadi kesalahan saat membaca file. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setProcessingFile(false);
      // Reset input value so the same file can be re-selected
      e.target.value = "";
    }
  };

  const handleThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingFile(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({
        ...prev,
        thumbnailUrl: dataUrl,
        thumbnailFileName: file.name,
      }));
    } catch {
      toast({
        title: "Gagal memproses thumbnail",
        description: "Terjadi kesalahan saat membaca file thumbnail.",
        variant: "destructive",
      });
    } finally {
      setProcessingFile(false);
      e.target.value = "";
    }
  };

  const handleClearMedia = () => {
    setForm((prev) => ({
      ...prev,
      mediaUrl: "",
      fileSize: "",
      mediaFileName: "",
    }));
  };

  const handleClearThumbnail = () => {
    setForm((prev) => ({
      ...prev,
      thumbnailUrl: "",
      thumbnailFileName: "",
    }));
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return "Judul wajib diisi.";
    if (!form.description.trim()) return "Deskripsi wajib diisi.";

    if (form.contentType === "video") {
      if (form.videoSource === "upload" && !form.mediaUrl) {
        return "File video wajib diunggah.";
      }
      if (form.videoSource !== "upload" && !form.externalUrl.trim()) {
        return `URL video wajib diisi untuk sumber ${form.videoSource}.`;
      }
    }
    if (form.contentType === "image" && !form.mediaUrl) {
      return "Gambar wajib diunggah.";
    }
    if (form.contentType === "pdf" && !form.mediaUrl) {
      return "File PDF wajib diunggah.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({ title: "Validasi gagal", description: error, variant: "destructive" });
      return;
    }

    const adminEmail = getCurrentUser()?.email ?? "admin@gemas.id";

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      contentType: form.contentType,
      category: form.category,
      mediaUrl: form.mediaUrl || undefined,
      externalUrl: form.externalUrl.trim() || undefined,
      videoSource: form.contentType === "video" ? form.videoSource : undefined,
      thumbnailUrl: form.thumbnailUrl || undefined,
      articleContent:
        form.contentType === "article" ? form.articleContent.trim() || undefined : undefined,
      isActive: form.isActive,
      displayOrder: form.displayOrder,
      duration:
        form.contentType === "video" ? form.duration.trim() || undefined : undefined,
      fileSize: form.fileSize || undefined,
      createdBy: adminEmail,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const result = await updateContent(editingId, payload);
        if (result.success) {
          toast({
            title: "Konten diperbarui",
            description: result.message,
          });
          handleCloseDialog();
          // Refresh from Supabase to ensure sync
          await refreshContents();
        } else {
          toast({
            title: "Gagal memperbarui",
            description: result.message,
            variant: "destructive",
          });
        }
      } else {
        const result = await addContent(payload);
        if (result.success) {
          toast({
            title: "Konten ditambahkan",
            description: result.message,
          });
          handleCloseDialog();
          // Refresh from Supabase to ensure sync
          await refreshContents();
        } else {
          toast({
            title: "Gagal menambahkan",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const result = await deleteContent(deleteTargetId);
    if (result.success) {
      toast({ title: "Konten dihapus", description: result.message });
      // Refresh from Supabase to ensure sync
      await refreshContents();
    } else {
      toast({
        title: "Gagal menghapus",
        description: result.message,
        variant: "destructive",
      });
    }
    setDeleteTargetId(null);
  };

  const handleToggleActive = (id: string) => {
    toggleActive(id);
    toast({
      title: "Status diperbarui",
      description: "Status aktif konten telah diubah.",
    });
  };

  const handleMoveUp = (content: EducationalContent) => {
    const idx = filteredContents.findIndex((c) => c.id === content.id);
    if (idx <= 0) return;
    const prev = filteredContents[idx - 1];
    updateOrder(content.id, prev.displayOrder);
    updateOrder(prev.id, content.displayOrder);
  };

  const handleMoveDown = (content: EducationalContent) => {
    const idx = filteredContents.findIndex((c) => c.id === content.id);
    if (idx < 0 || idx >= filteredContents.length - 1) return;
    const next = filteredContents[idx + 1];
    updateOrder(content.id, next.displayOrder);
    updateOrder(next.id, content.displayOrder);
  };

  // =====================================================
  // RENDER GUARDS
  // =====================================================

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="h-8 w-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="text-center px-6">
          <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
            <LayoutGrid className="h-7 w-7 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Akses terbatas
          </p>
          <p className="text-xs text-gray-500">
            Mengalihkan ke halaman login admin...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Badge
              variant="secondary"
              className="mb-1.5 bg-green-50 text-green-700 border-green-200 rounded-full"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Admin Panel
            </Badge>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
              Edit Website
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola konten edukasi website
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Konten
          </Button>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari konten berdasarkan judul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 rounded-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filter tabs */}
        <div className="mb-4 overflow-x-auto -mx-1 px-1 pb-1">
          <div className="flex gap-2 min-w-max">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = tabCounts[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content list */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-white pb-3 hidden sm:block">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Judul</div>
              <div className="col-span-2">Jenis</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-center">Urutan</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <LayoutGrid className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {searchQuery || activeFilter !== "all"
                    ? "Tidak ada konten yang cocok dengan filter."
                    : "Belum ada konten. Klik \"Tambah Konten\" untuk mulai."}
                </p>
                {(searchQuery || activeFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-full"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="hidden sm:block divide-y divide-gray-100">
                  {filteredContents.map((content, idx) => {
                    const TypeIcon = getContentTypeIcon(content.contentType);
                    const isFirst = idx === 0;
                    const isLast = idx === filteredContents.length - 1;
                    return (
                      <div
                        key={content.id}
                        className="grid grid-cols-12 gap-3 py-3.5 px-1 hover:bg-green-50/40 rounded-lg transition-colors items-center"
                      >
                        <div className="col-span-4">
                          <div className="flex items-start gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {content.title}
                              </p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">
                                {content.description}
                              </p>
                              {content.videoSource &&
                                content.videoSource !== "upload" &&
                                content.externalUrl && (
                                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    <span className="truncate max-w-[180px]">
                                      {content.externalUrl}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-gray-700">
                            {CONTENT_TYPE_LABELS[content.contentType]}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 border-0 rounded-full text-[10px]"
                          >
                            {content.category}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          <Badge
                            className={`border-0 rounded-full text-[10px] ${
                              content.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {content.isActive ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                            {content.displayOrder}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleMoveUp(content)}
                            disabled={isFirst}
                            className="h-8 w-8 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
                            aria-label="Pindah ke atas"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(content)}
                            disabled={isLast}
                            className="h-8 w-8 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
                            aria-label="Pindah ke bawah"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(content)}
                            className="h-8 w-8 rounded-full hover:bg-green-100 flex items-center justify-center text-green-700"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(content.id)}
                            className={`h-8 w-8 rounded-full hover:bg-green-100 flex items-center justify-center ${
                              content.isActive ? "text-green-700" : "text-gray-400"
                            }`}
                            aria-label={
                              content.isActive
                                ? "Nonaktifkan konten"
                                : "Aktifkan konten"
                            }
                          >
                            {content.isActive ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(content.id)}
                            className="h-8 w-8 rounded-full hover:bg-red-100 flex items-center justify-center text-red-600"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: stacked cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {filteredContents.map((content, idx) => {
                    const TypeIcon = getContentTypeIcon(content.contentType);
                    const isFirst = idx === 0;
                    const isLast = idx === filteredContents.length - 1;
                    return (
                      <div key={content.id} className="py-4 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {content.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {content.description}
                            </p>
                          </div>
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold flex-shrink-0">
                            {content.displayOrder}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pl-12">
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 border-0 rounded-full text-[10px]"
                          >
                            {CONTENT_TYPE_LABELS[content.contentType]}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-green-50 text-green-700 border-0 rounded-full text-[10px]"
                          >
                            {content.category}
                          </Badge>
                          <Badge
                            className={`border-0 rounded-full text-[10px] ${
                              content.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {content.isActive ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 pl-12">
                          <Button
                            onClick={() => handleMoveUp(content)}
                            disabled={isFirst}
                            variant="outline"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 disabled:opacity-30"
                            aria-label="Pindah ke atas"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleMoveDown(content)}
                            disabled={isLast}
                            variant="outline"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 disabled:opacity-30"
                            aria-label="Pindah ke bawah"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleOpenEdit(content)}
                            variant="outline"
                            size="sm"
                            className="rounded-full h-8 px-3 text-green-700 border-green-200"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleToggleActive(content.id)}
                            variant="outline"
                            size="sm"
                            className={`rounded-full h-8 px-3 ${
                              content.isActive
                                ? "text-green-700 border-green-200"
                                : "text-gray-500"
                            }`}
                          >
                            {content.isActive ? (
                              <Eye className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 mr-1" />
                            )}
                            {content.isActive ? "Aktif" : "Nonaktif"}
                          </Button>
                          <Button
                            onClick={() => setDeleteTargetId(content.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-full h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            Menampilkan{" "}
            <strong className="text-gray-700">{filteredContents.length}</strong>{" "}
            dari <strong className="text-gray-700">{sortedContents.length}</strong>{" "}
            konten
          </span>
          <button
            onClick={() => setView("admin-dashboard")}
            className="text-green-700 hover:text-green-800 font-medium"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* ADD / EDIT DIALOG */}
      {/* ===================================================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Konten" : "Tambah Konten Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi konten edukasi."
                : "Lengkapi formulir di bawah untuk menambahkan konten baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Judul */}
            <div className="space-y-1.5">
              <Label htmlFor="content-title">
                Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                id="content-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Masukkan judul konten"
                className="rounded-xl"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <Label htmlFor="content-desc">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Deskripsi singkat konten"
                className="rounded-xl min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Jenis Konten + Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Jenis Konten</Label>
                <Select
                  value={form.contentType}
                  onValueChange={(v) => handleContentTypeChange(v as ContentType)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih jenis konten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Edukasi</SelectItem>
                    <SelectItem value="image">Media/Gambar</SelectItem>
                    <SelectItem value="pdf">Materi PDF</SelectItem>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="banner">Banner/Informasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      category: v as ContentCategory,
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sumber Video (only for video) */}
            {form.contentType === "video" && (
              <div className="space-y-1.5">
                <Label>Sumber Video</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VIDEO_SOURCE_OPTIONS.map((opt) => {
                    const isSelected = form.videoSource === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleVideoSourceChange(opt.value)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                          isSelected
                            ? "bg-green-600 text-white border-green-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* URL Video (youtube/vimeo/url) */}
            {form.contentType === "video" && form.videoSource !== "upload" && (
              <div className="space-y-1.5">
                <Label htmlFor="external-url">
                  URL Video{" "}
                  <span className="text-gray-400 text-xs">
                    ({form.videoSource === "youtube" ? "YouTube" : form.videoSource === "vimeo" ? "Vimeo" : "URL langsung"})
                  </span>{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="external-url"
                    type="url"
                    value={form.externalUrl}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        externalUrl: e.target.value,
                      }))
                    }
                    placeholder={
                      form.videoSource === "youtube"
                        ? "https://www.youtube.com/watch?v=..."
                        : form.videoSource === "vimeo"
                        ? "https://vimeo.com/..."
                        : "https://..."
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Tempelkan tautan {form.videoSource} lengkap.
                </p>
              </div>
            )}

            {/* Upload File (video upload / image / pdf) */}
            {((form.contentType === "video" && form.videoSource === "upload") ||
              form.contentType === "image" ||
              form.contentType === "pdf") && (
              <div className="space-y-1.5">
                <Label>
                  Upload File ({getMediaAcceptLabel(form.contentType)}){" "}
                  {(form.contentType === "video" || form.contentType === "image" || form.contentType === "pdf") && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                {form.mediaUrl ? (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        {form.contentType === "image" && form.mediaUrl.startsWith("data:") ? (
                          <img
                            src={form.mediaUrl}
                            alt="Pratinjau gambar"
                            className="h-9 w-9 object-cover rounded-lg"
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {form.mediaFileName || "File terunggah"}
                        </p>
                        {form.fileSize && (
                          <p className="text-[11px] text-gray-500">
                            {form.fileSize}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearMedia}
                      className="h-7 w-7 rounded-full hover:bg-white flex items-center justify-center text-gray-500 flex-shrink-0"
                      aria-label="Hapus file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="content-media"
                    className="flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/40 cursor-pointer transition-colors"
                  >
                    {processingFile ? (
                      <>
                        <div className="h-6 w-6 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                        <p className="text-xs text-gray-600">Memproses...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-gray-400" />
                        <p className="text-xs text-gray-600">
                          Klik untuk memilih file {getMediaAcceptLabel(form.contentType)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          File &gt; 5MB dapat melebihi batas penyimpanan browser
                        </p>
                      </>
                    )}
                    <input
                      id="content-media"
                      type="file"
                      accept={getMediaAccept(form.contentType)}
                      onChange={handleMediaFileChange}
                      disabled={processingFile}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Thumbnail (optional) */}
            <div className="space-y-1.5">
              <Label>Thumbnail (opsional)</Label>
              {form.thumbnailUrl ? (
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={form.thumbnailUrl}
                      alt="Pratinjau thumbnail"
                      className="h-9 w-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {form.thumbnailFileName || "Thumbnail"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearThumbnail}
                    className="h-7 w-7 rounded-full hover:bg-white flex items-center justify-center text-gray-500 flex-shrink-0"
                    aria-label="Hapus thumbnail"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="content-thumbnail"
                  className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/40 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {processingFile ? "Memproses..." : "Pilih gambar thumbnail"}
                  </span>
                  <input
                    id="content-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    disabled={processingFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Artikel Content (for article type) */}
            {form.contentType === "article" && (
              <div className="space-y-1.5">
                <Label htmlFor="article-content">Konten Artikel</Label>
                <Textarea
                  id="article-content"
                  value={form.articleContent}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      articleContent: e.target.value,
                    }))
                  }
                  placeholder="Tulis isi artikel di sini..."
                  className="rounded-xl min-h-[180px] font-mono text-sm"
                  rows={8}
                />
                <p className="text-[11px] text-gray-500">
                  Mendukung teks panjang. Gunakan paragraf untuk pemisah.
                </p>
              </div>
            )}

            {/* Durasi (for video) */}
            {form.contentType === "video" && (
              <div className="space-y-1.5">
                <Label htmlFor="content-duration">Durasi</Label>
                <Input
                  id="content-duration"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, duration: e.target.value }))
                  }
                  placeholder="contoh: 5:30"
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Status + Urutan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, isActive: true }))}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      form.isActive
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, isActive: false }))}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      !form.isActive
                        ? "bg-gray-700 text-white border-gray-700"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Tidak Aktif
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content-order">Urutan Tampil</Label>
                <Input
                  id="content-order"
                  type="number"
                  min={1}
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      displayOrder: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="rounded-full"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || processingFile}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ===================================================== */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus konten?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus media ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
