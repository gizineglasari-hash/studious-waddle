"use client";

import { useState } from "react";
import { BookOpen, Clock, ArrowLeft, BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARTICLES, type ArticleItem } from "@/lib/gemas/articles";

export function EdukasiGiziView() {
  const [selected, setSelected] = useState<ArticleItem | null>(null);

  if (selected) {
    return (
      <div className="animate-fade-in min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Button
            variant="ghost"
            onClick={() => setSelected(null)}
            className="mb-4 rounded-full text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke daftar artikel
          </Button>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                  {selected.emoji}
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-1 bg-white/80 text-green-700">
                    {selected.kategori}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl">{selected.judul}</CardTitle>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Estimasi baca: {selected.durasiBaca}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-sm text-gray-700 mb-5 italic leading-relaxed bg-amber-50/50 border-l-4 border-amber-300 p-3 rounded-r-lg">
                {selected.ringkasan}
              </p>
              <div className="prose prose-sm max-w-none">
                {selected.konten.map((section, i) => (
                  <div key={i} className="mb-4">
                    {section.judul && (
                      <h3 className="font-heading font-bold text-gray-900 mt-4 mb-2">{section.judul}</h3>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{section.paragraf}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 py-1">
            <BookOpen className="h-3 w-3 mr-1" />
            Edukasi Gizi
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Artikel Edukasi Gizi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Kumpulan artikel edukasi gizi anak untuk membantu orang tua memahami MP-ASI, pemberian makan, dan pemantauan pertumbuhan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ARTICLES.map((article, i) => (
            <Card
              key={article.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => setSelected(article)}
            >
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {article.emoji}
                </div>
                <Badge variant="outline" className="w-fit text-xs border-green-300 text-green-700 bg-white">
                  {article.kategori}
                </Badge>
                <h3 className="font-heading text-base font-bold text-gray-900 mt-2 group-hover:text-green-700 transition-colors">
                  {article.judul}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{article.ringkasan}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.durasiBaca}
                  </span>
                  <span className="text-xs font-semibold text-green-700 group-hover:gap-1.5 gap-1 flex items-center transition-all">
                    Baca
                    <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips section */}
        <Card className="border-2 border-amber-200 bg-amber-50/50 mt-8 rounded-2xl">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <BookMarked className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-amber-900 mb-1">Tips Membaca Artikel Edukasi</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Bacalah artikel secara perlahan dan pahami setiap bagian. Jika ada istilah yang kurang jelas, jangan ragu bertanya kepada tenaga kesehatan atau ahli gizi. Penerapan ilmu yang dipelajari akan lebih efektif jika dilakukan bertahap dan konsisten.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
