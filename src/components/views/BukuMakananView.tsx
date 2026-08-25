"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Scale, Flame, Beef, Droplet, Wheat, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FOODS, FOOD_CATEGORIES, type FoodItem, type FoodCategory } from "@/lib/gemas/foods";
import { cn } from "@/lib/utils";

export function BukuMakananView() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "all">("all");
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const filtered = useMemo(() => {
    return FOODS.filter((f) => {
      const matchCategory = activeCategory === "all" || f.kategori === activeCategory;
      const matchSearch =
        !search ||
        f.nama.toLowerCase().includes(search.toLowerCase()) ||
        f.deskripsi.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 bg-amber-50 text-amber-700 border-amber-200 rounded-full px-3 py-1">
            <BookOpen className="h-3 w-3 mr-1" />
            Buku Foto Makanan
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Buku Foto Makanan GEMAS
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Lihat contoh makanan beserta ukuran rumah tangga (URT) dan kandungan gizinya. Pencarian dan filter tersedia untuk memudahkan Anda menemukan makanan yang sesuai.
          </p>
        </div>

        {/* Search & Filter */}
        <Card className="border-0 shadow-lg rounded-2xl mb-6 overflow-hidden">
          <CardContent className="pt-5">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari makanan... (mis. nasi, telur, ikan)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-9 rounded-full"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
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
                  Semua ({FOODS.length})
                </button>
                {FOOD_CATEGORIES.map((cat) => {
                  const count = FOODS.filter((f) => f.kategori === cat.key).length;
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
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result count */}
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan <strong className="text-gray-900">{filtered.length}</strong> makanan
          {search && <span> untuk &ldquo;{search}&rdquo;</span>}
        </div>

        {/* Grid Makanan */}
        {filtered.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="py-12 text-center text-gray-500">
              <Search className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              Tidak ada makanan yang ditemukan. Coba kata kunci lain.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((food, i) => {
              const cat = FOOD_CATEGORIES.find((c) => c.key === food.kategori);
              return (
                <Card
                  key={food.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl animate-fade-in-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => setSelected(food)}
                >
                  <div className={cn("aspect-square flex items-center justify-center text-5xl sm:text-6xl group-hover:scale-110 transition-transform", cat?.color)}>
                    {food.emoji}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-heading font-bold text-sm text-gray-900 mb-1 line-clamp-1">{food.nama}</h3>
                    <div className="text-xs text-gray-500 mb-1">{food.urt}</div>
                    <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                      <Flame className="h-3 w-3" />
                      {food.energiKkal} kkal
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className={cn("aspect-video rounded-xl flex items-center justify-center text-7xl mb-3", FOOD_CATEGORIES.find((c) => c.key === selected?.kategori)?.color)}>
                {selected?.emoji}
              </div>
              <DialogTitle className="text-xl">{selected?.nama}</DialogTitle>
              <DialogDescription>
                {selected?.deskripsi}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-green-50">
                    <div className="text-xs text-gray-500">Ukuran Rumah Tangga</div>
                    <div className="text-sm font-semibold text-gray-900">{selected.urt}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <div className="text-xs text-gray-500">Berat</div>
                    <div className="text-sm font-semibold text-gray-900">±{selected.beratGram} gram</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Kandungan Gizi per Porsi</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50">
                      <Flame className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500">Energi</div>
                        <div className="text-sm font-bold text-gray-900">{selected.energiKkal} kkal</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50">
                      <Beef className="h-5 w-5 text-rose-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500">Protein</div>
                        <div className="text-sm font-bold text-gray-900">{selected.proteinG} g</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50">
                      <Droplet className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500">Lemak</div>
                        <div className="text-sm font-bold text-gray-900">{selected.lemakG} g</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50">
                      <Wheat className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500">Karbohidrat</div>
                        <div className="text-sm font-bold text-gray-900">{selected.karbohidratG} g</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-2">
                  <strong>Catatan:</strong> Nilai kandungan gizi adalah perkiraan per porsi (URT) berdasarkan DKBM Kemenkes RI dan PERSAGI. Untuk perhitungan gizi yang lebih akurat, konsultasikan dengan ahli gizi.
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
