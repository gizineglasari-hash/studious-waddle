"use client";

import { useState } from "react";
import { PlayCircle, Clock, AlertCircle, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VIDEOS, type VideoItem } from "@/lib/gemas/videos";

export function VideoEdukasiView() {
  const [selected, setSelected] = useState<VideoItem | null>(null);

  // Hanya tampilkan video yang sudah tersedia kontennya:
  // 1. Video lokal (isLocal = true) - yang sudah diunggah
  // 2. Video YouTube yang sudah ada youtubeId
  // Saat ini hanya 1 video lokal yang tersedia.
  const availableVideos = VIDEOS.filter(
    (v) => (v.isLocal && v.localPath) || (v.youtubeId && v.youtubeId.length > 0)
  );

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-rose-50 text-rose-700 border-rose-200 rounded-full px-3 py-1">
            <PlayCircle className="h-3 w-3 mr-1" />
            Video Edukasi
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Video Edukasi Gizi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Tonton video edukasi gizi anak dari UPTD Puskesmas Neglasari Kota Bandung. Video lain akan ditambahkan seiring perkembangan program.
          </p>
        </div>

        {/* Grid Video */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 max-w-2xl mx-auto">
          {availableVideos.map((video) => (
            <Card
              key={video.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl"
              onClick={() => setSelected(video)}
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
                <Badge className="absolute top-3 right-3 bg-black/60 text-white text-xs backdrop-blur-sm">
                  <Clock className="h-3 w-3 mr-0.5" />
                  {video.durasi}
                </Badge>
              </div>
              <CardContent className="p-4">
                <Badge variant="outline" className="text-[10px] mb-2 bg-pink-50 text-pink-700 border-pink-200">
                  {video.kategori}
                </Badge>
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

        {/* Catatan */}
        <div className="mt-6 max-w-2xl mx-auto text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span>
            Admin UPTD Puskesmas Neglasari dapat menambahkan video edukasi lainnya (URL YouTube) pada file <code className="bg-blue-100 px-1 rounded">src/lib/gemas/videos.ts</code>. Video akan otomatis tampil di halaman ini setelah diisi.
          </span>
        </div>

        {/* Video Player Dialog */}
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <Badge variant="outline" className="w-fit text-xs mb-1 bg-pink-50 text-pink-700 border-pink-200">
                {selected?.kategori}
              </Badge>
              <DialogTitle className="text-lg sm:text-xl pr-8">{selected?.judul}</DialogTitle>
              <DialogDescription className="text-sm">
                {selected?.deskripsi}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-3">
                {selected.isLocal && selected.localPath ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      src={selected.localPath}
                      poster=""
                      preload="metadata"
                    >
                      Browser Anda tidak mendukung pemutaran video.
                    </video>
                  </div>
                ) : selected.youtubeId ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${selected.youtubeId}`}
                      title={selected.judul}
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
                {selected.isLocal && (
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
