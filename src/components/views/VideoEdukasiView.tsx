"use client";

import { useState, useMemo } from "react";
import { PlayCircle, Clock, X, AlertCircle, Film } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VIDEOS, VIDEO_CATEGORIES, type VideoItem, type VideoCategory } from "@/lib/gemas/videos";
import { cn } from "@/lib/utils";

export function VideoEdukasiView() {
  const [activeCategory, setActiveCategory] = useState<VideoCategory | "all">("all");
  const [selected, setSelected] = useState<VideoItem | null>(null);

  const filtered = useMemo(() => {
    return VIDEOS.filter((v) => activeCategory === "all" || v.kategori === activeCategory);
  }, [activeCategory]);

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-rose-50 text-rose-700 border-rose-200 rounded-full px-3 py-1">
            <PlayCircle className="h-3 w-3 mr-1" />
            Video Edukasi
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Video Edukasi Gizi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Tonton video edukasi singkat dan mudah dipahami mengenai gizi anak, MP-ASI, protein hewani, dan lainnya. Video lokal dari UPTD Puskesmas Neglasari juga tersedia.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeCategory === "all"
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            )}
          >
            Semua ({VIDEOS.length})
          </button>
          {VIDEO_CATEGORIES.map((cat) => {
            const count = VIDEOS.filter((v) => v.kategori === cat.key).length;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1",
                  activeCategory === cat.key
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                )}
              >
                <span>{cat.emoji}</span>
                {cat.key} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid Video */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((video, i) => {
            const cat = VIDEO_CATEGORIES.find((c) => c.key === video.kategori);
            return (
              <Card
                key={video.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setSelected(video)}
              >
                {/* Thumbnail */}
                <div className={cn("aspect-video flex items-center justify-center relative overflow-hidden", cat?.color)}>
                  <span className="text-6xl group-hover:scale-110 transition-transform">{video.emoji}</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <PlayCircle className="h-7 w-7 text-green-700" fill="currentColor" />
                    </div>
                  </div>
                  {video.isLocal && (
                    <Badge className="absolute top-2 left-2 bg-rose-600 text-white text-[10px]">
                      Lokal
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2 bg-black/60 text-white text-[10px] backdrop-blur-sm">
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    {video.durasi}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <Badge variant="outline" className={cn("text-[10px] mb-1", cat?.color)}>
                    {video.kategori}
                  </Badge>
                  <h3 className="font-heading font-bold text-sm text-gray-900 mb-1 line-clamp-2">{video.judul}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{video.deskripsi}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Video Player Dialog */}
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <Badge variant="outline" className="w-fit text-xs mb-1">
                {VIDEO_CATEGORIES.find((c) => c.key === selected?.kategori)?.emoji} {selected?.kategori}
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
                      Admin UPTD Puskesmas Neglasari perlu menambahkan URL YouTube yang valid pada data video di <code className="bg-gray-200 px-1 rounded">src/lib/gemas/videos.ts</code>.
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
