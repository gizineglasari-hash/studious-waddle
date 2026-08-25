"use client";

import { useState } from "react";
import { PlayCircle, Clock, AlertCircle, Film, FileText, BookOpen, Download, ExternalLink } from "lucide-react";
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
import { VIDEOS, type VideoItem } from "@/lib/gemas/videos";

interface MediaItem {
  id: string;
  type: "video" | "pdf";
  judul: string;
  deskripsi: string;
  emoji: string;
  // For video
  isLocal?: boolean;
  localPath?: string;
  youtubeId?: string;
  durasi?: string;
  kategori?: string;
  // For PDF
  pdfPath?: string;
  fileSize?: string;
}

const MEDIA_ITEMS: MediaItem[] = [
  // Video lokal yang sudah diupload
  {
    id: "mpasi-resep-local",
    type: "video",
    judul: "Video Edukasi MP-ASI dan Resep MP-ASI",
    deskripsi:
      "Video edukasi resmi dari UPTD Puskesmas Neglasari Kota Bandung. Pelajari cara memberikan MP-ASI yang tepat sesuai usia anak beserta contoh resep MP-ASI bergizi yang mudah dibuat di rumah.",
    emoji: "🎬",
    isLocal: true,
    localPath: "/videos/video-mp-asi-resep.mp4",
    durasi: "Lokal",
    kategori: "MP-ASI",
  },
  // PDF Buku Foto Makanan
  {
    id: "buku-foto-makanan",
    type: "pdf",
    judul: "Buku Foto Makanan GEMAS (Indeks Search)",
    deskripsi:
      "Buku foto makanan digital berisi daftar bahan makanan beserta ukuran rumah tangga (URT), berat, dan kandungan gizi. Cocok untuk panduan praktis dalam menyusun menu makan anak sehari-hari.",
    emoji: "📖",
    pdfPath: "/pdfs/buku-foto-makanan.pdf",
    fileSize: "44 MB",
  },
];

export function VideoEdukasiView() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const videoItems = MEDIA_ITEMS.filter((m) => m.type === "video");
  const pdfItems = MEDIA_ITEMS.filter((m) => m.type === "pdf");

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
                  <span className="text-7xl group-hover:scale-110 transition-transform">{video.emoji}</span>
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

        {/* Section: Buku & Media Cetak */}
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

        {/* Catatan */}
        <div className="mt-6 max-w-2xl mx-auto text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span>
            Admin UPTD Puskesmas Neglasari dapat menambahkan video YouTube dan dokumen PDF lainnya pada file <code className="bg-blue-100 px-1 rounded">src/components/views/VideoEdukasiView.tsx</code>. Media akan otomatis tampil di halaman ini setelah diisi.
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
                      poster=""
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
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center p-6">
                    <Film className="h-12 w-12 text-gray-400 mb-2" />
                    <h4 className="font-semibold text-gray-700 mb-1">Video belum tersedia</h4>
                    <p className="text-xs text-gray-500 max-w-sm">
                      Admin perlu menambahkan URL YouTube yang valid pada data video.
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
      </div>
    </div>
  );
}
