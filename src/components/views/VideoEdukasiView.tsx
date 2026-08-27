"use client";

import { useState, useEffect, useMemo } from "react";
import { PlayCircle, Clock, AlertCircle, Film, FileText, BookOpen, Download, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useContentStore, type EducationalContent, type ContentType } from "@/lib/gemas/content-store";

// =====================================================
// TYPES
// =====================================================

interface MediaItem {
  id: string;
  type: "video" | "pdf" | "image" | "article";
  judul: string;
  deskripsi: string;
  emoji: string;
  // For video
  isLocal?: boolean;
  localPath?: string;
  youtubeId?: string;
  externalUrl?: string;
  videoSource?: string;
  thumbnailUrl?: string;
  durasi?: string;
  kategori?: string;
  // For PDF
  pdfPath?: string;
  fileSize?: string;
  // For article
  articleContent?: string;
}

// =====================================================
// HELPERS
// =====================================================

function getEmojiForContent(content: EducationalContent): string {
  switch (content.contentType) {
    case "video":
      return "🎬";
    case "image":
      return "🖼️";
    case "pdf":
      return "📖";
    case "article":
      return "📝";
    case "banner":
      return "📢";
    default:
      return "📄";
  }
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function convertToMediaItem(content: EducationalContent): MediaItem {
  const isLocalFile =
    content.mediaUrl &&
    (content.mediaUrl.startsWith("/") ||
      content.mediaUrl.startsWith("data:") ||
      content.videoSource === "upload");

  // For videos: check if externalUrl is a YouTube link
  const youtubeId =
    content.contentType === "video"
      ? extractYouTubeId(content.externalUrl || "")
      : null;

  return {
    id: content.id,
    type: content.contentType as MediaItem["type"],
    judul: content.title,
    deskripsi: content.description,
    emoji: getEmojiForContent(content),
    isLocal: !!(isLocalFile && content.contentType === "video"),
    localPath: content.mediaUrl,
    youtubeId: youtubeId || undefined,
    externalUrl: content.externalUrl,
    videoSource: content.videoSource,
    thumbnailUrl: content.thumbnailUrl,
    durasi: content.duration,
    kategori: content.category,
    pdfPath: content.mediaUrl,
    fileSize: content.fileSize,
    articleContent: content.articleContent,
  };
}

// =====================================================
// COMPONENT
// =====================================================

export function VideoEdukasiView() {
  const contents = useContentStore((s) => s.contents);
  const refreshContents = useContentStore((s) => s.refreshContents);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Fetch contents from Supabase on mount
  useEffect(() => {
    refreshContents();
  }, [refreshContents]);

  // Convert contents to media items, filtered by type and active status
  const { videoItems, pdfItems, imageItems, articleItems } = useMemo(() => {
    const activeContents = contents.filter((c) => c.isActive);
    const mediaItems = activeContents.map(convertToMediaItem);
    return {
      videoItems: mediaItems.filter((m) => m.type === "video"),
      pdfItems: mediaItems.filter((m) => m.type === "pdf"),
      imageItems: mediaItems.filter((m) => m.type === "image"),
      articleItems: mediaItems.filter((m) => m.type === "article"),
    };
  }, [contents]);

  const hasAnyContent =
    videoItems.length > 0 ||
    pdfItems.length > 0 ||
    imageItems.length > 0 ||
    articleItems.length > 0;

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-rose-50 text-rose-700 border-rose-200 rounded-full px-3 py-1">
            <PlayCircle className="h-3 w-3 mr-1" />
            Video dan Media Edukasi
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Video dan Media Edukasi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Tonton video edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung dan unduh buku foto makanan digital sebagai panduan praktis.
          </p>
        </div>

        {/* Section: Video Edukasi */}
        {videoItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center">
                <Film className="h-5 w-5 text-rose-700" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900">Video Edukasi</h2>
                <p className="text-xs text-gray-500">Video pembelajaran gizi anak</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 max-w-2xl mx-auto">
              {videoItems.map((video) => (
                <Card
                  key={video.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => setSelectedMedia(video)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                    {video.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnailUrl}
                        alt={video.judul}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-7xl group-hover:scale-110 transition-transform">{video.emoji}</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <PlayCircle className="h-8 w-8 text-green-700" fill="currentColor" />
                      </div>
                    </div>
                    {video.isLocal && (
                      <Badge className="absolute top-3 left-3 bg-rose-600 text-white text-xs">
                        Video UPTD Puskesmas Neglasari
                      </Badge>
                    )}
                    {video.durasi && (
                      <Badge className="absolute top-3 right-3 bg-black/60 text-white text-xs backdrop-blur-sm">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        {video.durasi}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    {video.kategori && (
                      <Badge variant="outline" className="text-[10px] mb-2 bg-pink-50 text-pink-700 border-pink-200">
                        {video.kategori}
                      </Badge>
                    )}
                    <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 mb-2">{video.judul}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{video.deskripsi}</p>
                    <div className="mt-3 flex items-center text-sm font-semibold text-green-700 group-hover:gap-2 gap-1 transition-all">
                      <PlayCircle className="h-4 w-4" />
                      Tonton Video
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section: Buku & Media Cetak (PDF) */}
        {pdfItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900">Buku & Media Cetak</h2>
                <p className="text-xs text-gray-500">Dokumen PDF yang dapat diunduh</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 max-w-2xl mx-auto">
              {pdfItems.map((pdf) => (
                <Card
                  key={pdf.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 overflow-hidden rounded-2xl"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center text-3xl flex-shrink-0">
                        {pdf.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="text-[10px] mb-2 bg-blue-50 text-blue-700 border-blue-200">
                          <FileText className="h-2.5 w-2.5 mr-0.5" />
                          Dokumen PDF
                        </Badge>
                        <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 mb-1">{pdf.judul}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{pdf.deskripsi}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {pdf.pdfPath && (
                            <>
                              <Button
                                size="sm"
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                              >
                                <a href={pdf.pdfPath} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1.5" />
                                  Lihat PDF
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <a href={pdf.pdfPath} download>
                                  <Download className="h-4 w-4 mr-1.5" />
                                  Unduh
                                </a>
                              </Button>
                            </>
                          )}
                          {pdf.fileSize && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {pdf.fileSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section: Media/Gambar */}
        {imageItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <Film className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900">Media/Gambar</h2>
                <p className="text-xs text-gray-500">Infografis dan gambar edukasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
              {imageItems.map((img) => (
                <Card
                  key={img.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 overflow-hidden rounded-2xl"
                >
                  <CardContent className="p-4">
                    {img.thumbnailUrl || img.localPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.thumbnailUrl || img.localPath}
                        alt={img.judul}
                        className="w-full rounded-lg mb-3 max-h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-purple-50 flex items-center justify-center text-5xl mb-3">
                        {img.emoji}
                      </div>
                    )}
                    {img.kategori && (
                      <Badge variant="outline" className="text-[10px] mb-2 bg-purple-50 text-purple-700 border-purple-200">
                        {img.kategori}
                      </Badge>
                    )}
                    <h3 className="font-heading font-bold text-base text-gray-900 mb-1">{img.judul}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{img.deskripsi}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section: Artikel */}
        {articleItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900">Artikel Edukasi</h2>
                <p className="text-xs text-gray-500">Artikel gizi anak</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 max-w-2xl mx-auto">
              {articleItems.map((article) => (
                <Card
                  key={article.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => setSelectedMedia(article)}
                >
                  <CardContent className="p-4">
                    {article.kategori && (
                      <Badge variant="outline" className="text-[10px] mb-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        {article.kategori}
                      </Badge>
                    )}
                    <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 mb-1">{article.judul}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{article.deskripsi}</p>
                    <div className="mt-3 flex items-center text-sm font-semibold text-green-700 group-hover:gap-2 gap-1 transition-all">
                      <FileText className="h-4 w-4" />
                      Baca Selengkapnya
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasAnyContent && (
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 text-rose-400 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-gray-600">Memuat konten edukasi...</p>
          </div>
        )}

        {/* Catatan */}
        <div className="mt-6 max-w-2xl mx-auto text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span>
            Konten di halaman ini dikelola langsung oleh admin UPTD Puskesmas Neglasari melalui panel{" "}
            <strong>Edit Website</strong>. Admin dapat menambahkan video (YouTube atau upload), PDF, gambar, dan artikel edukasi yang akan otomatis tampil di sini.
          </span>
        </div>

        {/* Video Player Dialog */}
        <Dialog open={!!selectedMedia && selectedMedia.type === "video"} onOpenChange={(open) => !open && setSelectedMedia(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              {selectedMedia?.kategori && (
                <Badge variant="outline" className="w-fit text-xs mb-1 bg-pink-50 text-pink-700 border-pink-200">
                  {selectedMedia.kategori}
                </Badge>
              )}
              <DialogTitle className="text-lg sm:text-xl pr-8">{selectedMedia?.judul}</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedMedia?.deskripsi}
              </DialogDescription>
            </DialogHeader>
            {selectedMedia && (
              <div className="space-y-3">
                {selectedMedia.isLocal && selectedMedia.localPath ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={selectedMedia.localPath}
                      poster={selectedMedia.thumbnailUrl || ""}
                      preload="metadata"
                    >
                      Browser Anda tidak mendukung pemutaran video.
                    </video>
                  </div>
                ) : selectedMedia.youtubeId ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${selectedMedia.youtubeId}`}
                      title={selectedMedia.judul}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : selectedMedia.externalUrl ? (
                  <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center p-6">
                    <Film className="h-12 w-12 text-gray-400 mb-2" />
                    <h4 className="font-semibold text-gray-700 mb-1">Video Eksternal</h4>
                    <p className="text-xs text-gray-500 max-w-sm mb-3">
                      Klik tombol di bawah untuk membuka video di tab baru.
                    </p>
                    <Button asChild size="sm" className="rounded-full">
                      <a href={selectedMedia.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        Buka Video
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center p-6">
                    <Film className="h-12 w-12 text-gray-400 mb-2" />
                    <h4 className="font-semibold text-gray-700 mb-1">Video belum tersedia</h4>
                    <p className="text-xs text-gray-500 max-w-sm">
                      Admin perlu menambahkan URL YouTube atau file video yang valid.
                    </p>
                  </div>
                )}
                {selectedMedia.isLocal && (
                  <div className="text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-2 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Video ini adalah file lokal yang diunggah langsung oleh UPTD Puskesmas Neglasari Kota Bandung.
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Article Reader Dialog */}
        <Dialog open={!!selectedMedia && selectedMedia.type === "article"} onOpenChange={(open) => !open && setSelectedMedia(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              {selectedMedia?.kategori && (
                <Badge variant="outline" className="w-fit text-xs mb-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                  {selectedMedia.kategori}
                </Badge>
              )}
              <DialogTitle className="text-lg sm:text-xl pr-8">{selectedMedia?.judul}</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedMedia?.deskripsi}
              </DialogDescription>
            </DialogHeader>
            {selectedMedia?.articleContent && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMedia.articleContent}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
