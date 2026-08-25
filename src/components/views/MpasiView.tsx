"use client";

import { Baby, Apple, Milk, Clock, Utensils, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgeGroup {
  ageRange: string;
  title: string;
  emoji: string;
  color: string;
  headerColor: string;
  isiPiringkuImage?: string; // path ke Poster Isi Piringku
  isiPiringkuAlt?: string;
  texture: string;
  frequency: string;
  portion: string;
  sampleMenu: { time?: string; menu: string }[];
  proteinHewani?: string; // optional - hanya tampil jika diisi
  tips: string[];
}

const AGE_GROUPS: AgeGroup[] = [
  {
    ageRange: "6-8 bulan",
    title: "MP-ASI Awal",
    emoji: "🍼",
    color: "bg-pink-50 border-pink-200",
    headerColor: "bg-gradient-to-r from-pink-50 to-rose-50",
    isiPiringkuImage: "/images/isi-piringku-6-8-bulan.jpg",
    isiPiringkuAlt: "Poster Isi Piringku Bayi Balita Usia 6-8 Bulan",
    texture: "Puree halus, makanan lumat, tekstur sangat lembut. Bisa dimasak lalu dihaluskan dengan blender atau diayak.",
    frequency: "Mulai 1-2 kali sehari, dengan porsi kecil (2-3 sendok makan).",
    portion: "2-3 sendok makan per kali makan, lalu tingkatkan bertahap sesuai nafsu makan anak.",
    sampleMenu: [
      { menu: "Bubur sup ayam kacang merah" },
      { menu: "Bubur kentang hati ayam wortel" },
      { menu: "Bubur kari ayam dan bayam" },
    ],
    // proteinHewani dihilangkan untuk usia 6-8 bulan sesuai permintaan
    tips: [
      "ASI tetap menjadi makanan utama, MP-ASI sebagai pelengkap.",
      "Perkenalkan satu jenis makanan baru setiap 3 hari untuk mendeteksi alergi.",
      "Jangan tambahkan gula, garam, atau penyedap rasa.",
      "Sajikan dalam suhu ruang atau hangat, bukan panas.",
      "Posisi makan tegak dengan dukungan.",
    ],
  },
  {
    ageRange: "9-11 bulan",
    title: "MP-ASI Transisi",
    emoji: "🥣",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
    isiPiringkuImage: "/images/isi-piringku-9-11-bulan.jpg",
    isiPiringkuAlt: "Poster Isi Piringku Bayi Balita Usia 9-11 Bulan",
    texture: "Makanan lumat dengan potongan kecil, tekstur agak kasar. Tidak perlu dihaluskan sempurna, agar anak terlatih mengunyah.",
    frequency: "3-4 kali sehari, dengan 1 camilan sehat di antara waktu makan.",
    portion: "Setengah mangkok kecil (100-150 ml) per kali makan.",
    sampleMenu: [
      { time: "Sarapan", menu: "Bubur nasi dengan ikan tongkol suwir, wortel, dan bayam" },
      { time: "Camilan Pagi", menu: "Pisang lumat atau puree buah" },
      { time: "Makan Siang", menu: "Nasi tim dengan hati ayam, brokoli, dan tomat" },
      { time: "Camilan Sore", menu: "Biskuit bayi atau alpukat lumat" },
      { time: "Makan Malam", menu: "Nasi tim dengan hati ayam, brokoli, dan tomat" },
    ],
    proteinHewani: "1 butir telur atau 30-40 gram daging/ikan/hati per hari.",
    tips: [
      "Perkenalkan tekstur yang lebih kasar untuk melatih mengunyah.",
      "Variasi sayur dan buah dengan beragam warna.",
      "Anak mulai belajar memegang makanan sendiri (finger food).",
      "Sajikan minum menggunakan gelas/cangkir, bukan botol dot.",
      "Hindari makanan yang berisiko tersedak (kacang utuh, anggur utuh).",
    ],
  },
  {
    ageRange: "12-23 bulan",
    title: "Makanan Keluarga",
    emoji: "👨‍👩‍👧",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-gradient-to-r from-emerald-50 to-teal-50",
    isiPiringkuImage: "/images/isi-piringku-12-23-bulan.jpg",
    isiPiringkuAlt: "Poster Isi Piringku Bayi Balita Usia 12-23 Bulan",
    texture: "Makanan keluarga dengan potongan sedang. Anak sudah bisa makan nasi keluarga dengan lauk yang dipotong kecil-kecil.",
    frequency: "3 kali makan utama + 2 camilan sehat.",
    portion: "Mangkok kecil anak (200-250 ml) per kali makan utama.",
    sampleMenu: [
      { time: "Sarapan", menu: "Nasi, telur dadar, sayur bayam, buah pepaya" },
      { time: "Camilan Pagi", menu: "Pudding susu atau pisang" },
      { time: "Makan Siang", menu: "Nasi, ikan bakar/tumis, sayur buncis, tomat" },
      { time: "Camilan Sore", menu: "Bubur kacang hijau atau roti gandum" },
      { time: "Makan Malam", menu: "Nasi, ayam goreng/kukus, sayur asem, buah" },
    ],
    // proteinHewani dihilangkan untuk usia 12-23 bulan sesuai permintaan
    tips: [
      "Makan bersama keluarga untuk menumbuhkan kebiasaan makan sehat.",
      "Variasi menu harian dengan 4 bintang: karbohidrat, protein hewani, sayur, buah.",
      "Hindari jajan tinggi gula/garam, minuman manis, dan gorengan berlebih.",
      "Libatkan anak dalam persiapan makanan sederhana (mencuci sayur, memilih buah).",
      "ASI tetap dapat diberikan hingga 24 bulan atau lebih.",
      "Terapkan makan responsif: orang tua tentukan menu, anak tentukan porsi.",
    ],
  },
];

const GENERAL_PRINCIPLES = [
  { icon: Clock, title: "Mulai Usia 6 Bulan", desc: "MP-ASI mulai diberikan tepat pada usia 6 bulan, tidak lebih awal atau lebih lambat." },
  { icon: Milk, title: "ASI Tetap Diberikan", desc: "ASI tetap menjadi sumber gizi utama dan dilanjutkan hingga usia 24 bulan atau lebih." },
  { icon: Apple, title: "Makanan Beragam", desc: "Berikan makanan beragam dari kelompok karbohidrat, protein, sayur, dan buah." },
  { icon: Utensils, title: "Prioritaskan Protein Hewani", desc: "Telur, ikan, daging, ayam, dan hati wajib ada setiap hari untuk mencegah stunting." },
  { icon: Baby, title: "Tekstur Sesuai Usia", desc: "Sesuaikan tekstur makanan dengan usia anak agar siap makan makanan keluarga." },
  { icon: CheckCircle2, title: "Makan Responsif", desc: "Perhatikan tanda lapar dan kenyang anak. Jangan paksa makan." },
];

export function MpasiView() {
  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 bg-pink-50 text-pink-700 border-pink-200 rounded-full px-3 py-1">
            <Baby className="h-3 w-3 mr-1" />
            Makanan Pendamping ASI
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            MP-ASI Tepat, Anak Sehat
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Pelajari pemberian MP-ASI sesuai usia anak, mulai dari tekstur makanan, frekuensi, porsi, hingga contoh menu harian yang bergizi.
          </p>
        </div>

        {/* Prinsip Umum */}
        <Card className="border-0 shadow-lg rounded-2xl mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Prinsip Pemberian MP-ASI
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GENERAL_PRINCIPLES.map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <p.icon className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-0.5">{p.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Per Kelompok Usia */}
        <div className="space-y-6">
          {AGE_GROUPS.map((group) => (
            <Card key={group.ageRange} className={`border-2 ${group.color} shadow-md rounded-2xl overflow-hidden`}>
              <CardHeader className={`${group.headerColor} pb-3`}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl">
                    {group.emoji}
                  </div>
                  <div>
                    <Badge variant="secondary" className="bg-white/80 text-gray-700 mb-1">
                      Usia {group.ageRange}
                    </Badge>
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {/* Poster Isi Piringku sesuai usia */}
                {group.isiPiringkuImage && (
                  <div className="mb-5 flex flex-col items-center bg-white rounded-2xl p-3 sm:p-4 border-2 border-green-200 shadow-sm">
                    <h4 className="font-heading text-base font-bold text-green-800 mb-2 text-center flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Foto Isi Piringku - Usia {group.ageRange}
                    </h4>
                    <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-gray-50">
                      <img
                        src={group.isiPiringkuImage}
                        alt={group.isiPiringkuAlt || `Poster Isi Piringku ${group.ageRange}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Poster panduan porsi makan anak sesuai usia {group.ageRange} - sumber: Kementerian Kesehatan RI
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Kiri */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                        <Utensils className="h-4 w-4 text-green-600" />
                        Tekstur Makanan
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{group.texture}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-green-600" />
                        Frekuensi Makan
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{group.frequency}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                        <Apple className="h-4 w-4 text-green-600" />
                        Porsi
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{group.portion}</p>
                    </div>
                    {group.proteinHewani && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-rose-900 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                          Protein Hewani
                        </h4>
                        <p className="text-xs text-rose-800 leading-relaxed">{group.proteinHewani}</p>
                      </div>
                    )}
                  </div>

                  {/* Kanan */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Contoh Menu Harian</h4>
                      <div className="space-y-2">
                        {group.sampleMenu.map((m, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
                            {m.time && (
                              <Badge variant="outline" className="text-xs bg-white border-green-300 text-green-700 flex-shrink-0">
                                {m.time}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-700">{m.menu}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Tips Penting</h4>
                      <ul className="space-y-1.5">
                        {group.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Catatan keamanan */}
        <Card className="border-2 border-amber-200 bg-amber-50/50 mt-6 rounded-2xl">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-amber-900 mb-1">Kebersihan dan Keamanan Pangan</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Cuci tangan sebelum menyiapkan dan memberi makan. Gunakan bahan makanan segar, masak hingga matang, dan simpan sisa makanan di lemari es. Jangan berikan madu pada bayi &lt;1 tahun (risiko botulisme). Hindari makanan mentah atau setengah matang, serta makanan tinggi gula, garam, dan pengawet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
