"use client";

import { useState } from "react";
import {
  Utensils,
  Fish,
  Wheat,
  Carrot,
  Droplet,
  Clock,
  Apple,
  Coffee,
  Baby,
  X,
  CheckCircle2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Material {
  id: string;
  icon: React.ElementType;
  title: string;
  shortDesc: string;
  color: string;
  bgIcon: string;
  /** Path ke Poster Isi Piringku (untuk material Isi Piringku) */
  posterImage?: string;
  posterAlt?: string;
  detail: {
    description: string;
    keyPoints: { title: string; desc: string }[];
    examples: string[];
    tips: string[];
  };
}

const MATERIALS: Material[] = [
  {
    id: "isi-piringku",
    icon: Utensils,
    title: "Isi Piringku",
    shortDesc: "Panduan komposisi piring makan anak yang sehat dan bergizi seimbang.",
    color: "text-green-700",
    bgIcon: "bg-gradient-to-br from-green-100 to-emerald-100",
    posterImage: "/images/isi-piringku-2-5-tahun.jpg",
    posterAlt: "Poster Isi Piringku Bayi Balita Usia 2-5 Tahun",
    detail: {
      description:
        "Isi Piringku adalah panduan gizi seimbang dari Kementerian Kesehatan RI. Piring anak dibagi menjadi tiga bagian: setengah piring sayur dan buah, sepertiga piring karbohidrat, dan seperenam piring protein (prioritas protein hewani).",
      keyPoints: [
        { title: "50% Sayur & Buah", desc: "Setengah piring berisi sayuran dan buah yang beragam warna untuk memastikan beragam nutrisi." },
        { title: "33% Karbohidrat", desc: "Sepertiga piring berisi makanan pokok: nasi, kentang, ubi, jagung, atau roti." },
        { title: "17% Protein", desc: "Sisanya berisi lauk pauk dengan prioritas protein hewani (telur, ikan, daging, ayam, hati)." },
      ],
      examples: [
        "Nasi + ikan tongkol + sayur bayam + buah pisang",
        "Kentang rebus + telur dadar + brokoli + tomat",
        "Nasi + ayam suwir + sayur sop + pepaya",
      ],
      tips: [
        "Sajikan variasi warna sayur dan buah setiap hari.",
        "Tambahkan 1 sendok teh minyak untuk kalori tambahan.",
        "Sajikan dalam piring ukuran anak, bukan piring dewasa.",
      ],
    },
  },
  {
    id: "protein-hewani",
    icon: Fish,
    title: "Protein Hewani",
    shortDesc: "Sumber protein berkualitas tinggi yang penting untuk mencegah stunting.",
    color: "text-rose-700",
    bgIcon: "bg-gradient-to-br from-rose-100 to-pink-100",
    detail: {
      description:
        "Protein hewani berasal dari hewan: telur, ikan, daging, ayam, hati, susu. Protein hewani mengandung semua asam amino esensial dalam jumlah dan proporsi optimal untuk tubuh manusia, sehingga lebih lengkap dibanding protein nabati.",
      keyPoints: [
        { title: "Telur", desc: "Termurah dan paling lengkap. 1 butir = 7 gram protein berkualitas tinggi. Berikan 1 telur sehari." },
        { title: "Ikan", desc: "Tinggi protein, rendah lemak, mengandung omega-3. Ikan lokal seperti tongkol, lele, bandeng ekonomis." },
        { title: "Daging & Hati", desc: "Tinggi zat besi dan protein. Hati ayam/sapi sangat tinggi zat besi untuk cegah anemia." },
        { title: "Susu", desc: "Sumber kalsium dan protein. Untuk anak <1 tahun, gunakan susu formula khusus, bukan susu sapi murni." },
      ],
      examples: [
        "Telur rebus untuk sarapan",
        "Ikan kukus/tumis untuk makan siang",
        "Hati ayam tumis untuk makan malam",
        "Susu 2 gelas sehari",
      ],
      tips: [
        "Berikan minimal 1 sumber protein hewani setiap hari.",
        "Variasi jenis protein hewani agar nutrisi beragam.",
        "Untuk MP-ASI awal, haluskan protein hewani sampai lembut.",
        "Cek alergi sebelum memberikan jenis protein baru.",
      ],
    },
  },
  {
    id: "karbohidrat",
    icon: Wheat,
    title: "Karbohidrat",
    shortDesc: "Sumber energi utama untuk aktivitas dan pertumbuhan anak.",
    color: "text-amber-700",
    bgIcon: "bg-gradient-to-br from-amber-100 to-yellow-100",
    detail: {
      description:
        "Karbohidrat adalah sumber energi utama untuk anak. Pilih karbohidrat kompleks yang mengandung serat dan nutrisi tambahan, bukan karbohidrat sederhana seperti gula atau tepung putih olahan.",
      keyPoints: [
        { title: "Nasi", desc: "Sumber karbohidrat utama di Indonesia. Pilih beras merah untuk serat lebih tinggi." },
        { title: "Kentang & Ubi", desc: "Sumber karbohidrat alternatif, kaya vitamin dan serat. Baik untuk variasi." },
        { title: "Jagung", desc: "Sumber karbohidrat dan serat. Bisa dibuat bubur, rebus, atau tim." },
        { title: "Roti & Sereal", desc: "Pilih roti gandum utuh untuk serat lebih tinggi." },
      ],
      examples: [
        "Nasi putih/merah sebagai makanan pokok",
        "Kentang rebus untuk variasi",
        "Ubi jalar rebus untuk camilan",
        "Bubur oat dengan pisang",
      ],
      tips: [
        "Variasi jenis karbohidrat dalam seminggu.",
        "Untuk MP-ASI awal, gunakan bubur beras halus.",
        "Hindari karbohidrat olahan tinggi gula (donat, cake, biskuit manis).",
        "Tambahkan sayur ke nasi untuk variasi rasa dan nutrisi (nasi kuning, nasi sayur).",
      ],
    },
  },
  {
    id: "sayur-buah",
    icon: Carrot,
    title: "Sayur dan Buah",
    shortDesc: "Sumber vitamin, mineral, dan serat untuk pencernaan sehat.",
    color: "text-emerald-700",
    bgIcon: "bg-gradient-to-br from-emerald-100 to-teal-100",
    detail: {
      description:
        "Sayur dan buah adalah sumber vitamin, mineral, antioksidan, dan serat. Setengah piring anak sebaiknya berisi sayur dan buah. Variasi warna penting karena setiap warna mengandung nutrisi berbeda.",
      keyPoints: [
        { title: "Sayur Hijau", desc: "Bayam, sawi, kangkung, brokoli - kaya zat besi dan vitamin K." },
        { title: "Sayur Oranye/Kuning", desc: "Wortel, labu, jagung - tinggi beta-karoten untuk mata." },
        { title: "Sayur Merah/Ungu", desc: "Tomat, bit, terong - kaya antioksidan." },
        { title: "Buah", desc: "Pisang, pepaya, jeruk, apel, mangga - variasi untuk vitamin dan mineral beragam." },
      ],
      examples: [
        "Sayur bening bayam dan jagung",
        "Tumis brokoli dan wortel",
        "Pisang dan pepaya untuk camilan",
        "Jeruk dan apel untuk variasi",
      ],
      tips: [
        "Variasi warna sayur setiap hari.",
        "Perkenalkan sayur baru berulang kali (anak butuh 10-15 kali terpapar).",
        "Jangan memaksa anak makan sayur yang tidak disukai, ganti dengan alternatif.",
        "Sajikan buah segar, bukan jus yang sudah diberi gula.",
      ],
    },
  },
  {
    id: "lemak-sehat",
    icon: Droplet,
    title: "Lemak Sehat",
    shortDesc: "Penting untuk perkembangan otak dan penyerapan vitamin.",
    color: "text-blue-700",
    bgIcon: "bg-gradient-to-br from-blue-100 to-sky-100",
    detail: {
      description:
        "Lemak sehat penting untuk perkembangan otak anak (60% otak terdiri dari lemak), penyerapan vitamin A, D, E, K, dan sumber energi terkonsentrasi. Pilih lemak tak jenuh dan hindari lemak trans.",
      keyPoints: [
        { title: "Alpukat", desc: "Lemak tak jenuh tunggal, baik untuk otak. Mudah diberikan sebagai MP-ASI awal." },
        { title: "Minyak Zaitun", desc: "Extra virgin olive oil untuk tumisan atau salad." },
        { title: "Minyak Kelapa Sawit", desc: "Minyak goreng utama di Indonesia, gunakan secukupnya." },
        { title: "Kacang-kacangan", desc: "Selai kacang, kacang tanah, almond - sumber lemak dan protein." },
      ],
      examples: [
        "Alpukat lumat untuk MP-ASI awal",
        "1 sendok teh minyak sayur dalam MP-ASI",
        "Selai kacang pada roti gandum",
        "Parutan kelapa pada makanan",
      ],
      tips: [
        "Tambahkan 1 sendok teh minyak pada MP-ASI untuk kalori tambahan.",
        "Hindari makanan yang digoreng dengan minyak berkali-kali.",
        "Hindari lemak trans (margarin pada jajan olahan).",
        "Untuk anak kurang gizi, tambahkan lemak untuk menambah kalori.",
      ],
    },
  },
  {
    id: "frekuensi-makan",
    icon: Clock,
    title: "Frekuensi Makan",
    shortDesc: "Berapa kali anak harus makan sesuai usia.",
    color: "text-purple-700",
    bgIcon: "bg-gradient-to-br from-purple-100 to-violet-100",
    detail: {
      description:
        "Frekuensi makan anak berbeda-beda sesuai usia. Perut anak lebih kecil dari dewasa, jadi porsi kecil tapi sering lebih efektif daripada porsi besar tapi jarang.",
      keyPoints: [
        { title: "6-8 bulan", desc: "1-2 kali makan sehari dengan porsi kecil (2-3 sdm). ASI tetap utama." },
        { title: "9-11 bulan", desc: "3-4 kali makan sehari + 1 camilan." },
        { title: "12-23 bulan", desc: "3 kali makan utama + 2 camilan sehat." },
        { title: "2-5 tahun", desc: "3 kali makan utama + 2 camilan sehat." },
      ],
      examples: [
        "Sarapan: 07.00 - 08.00",
        "Camilan Pagi: 10.00",
        "Makan Siang: 12.00 - 13.00",
        "Camilan Sore: 16.00",
        "Makan Malam: 18.30 - 19.00",
      ],
      tips: [
        "Jadwal makan teratur membantu nafsu makan anak.",
        "Hindari camilan manis/susu sebelum makan utama.",
        "Berikan camilan sehat: buah, kacang, puding susu.",
        "Sajikan makan dalam suasana tenang, tanpa TV/gadget.",
      ],
    },
  },
  {
    id: "porsi",
    icon: Utensils,
    title: "Porsi Makan Anak",
    shortDesc: "Ukuran porsi yang sesuai dengan kapasitas perut anak.",
    color: "text-teal-700",
    bgIcon: "bg-gradient-to-br from-teal-100 to-cyan-100",
    detail: {
      description:
        "Porsi makan anak harus disesuaikan dengan kapasitas perutnya. Perut anak usia 1-3 tahun hanya dapat menampung sekitar 200-300 ml, jadi gunakan mangkok/piring ukuran anak, bukan ukuran dewasa.",
      keyPoints: [
        { title: "Usia 6-8 bulan", desc: "2-3 sendok makan per kali makan, tingkatkan bertahap." },
        { title: "Usia 9-11 bulan", desc: "Setengah mangkok kecil (100-150 ml) per makan." },
        { title: "Usia 12-23 bulan", desc: "Mangkok kecil anak (200-250 ml) per makan." },
        { title: "Usia 2-5 tahun", desc: "Sedikit lebih besar, sesuaikan dengan nafsu makan." },
      ],
      examples: [
        "Nasi: setengah mangkok kecil",
        "Lauk: 1 potong sedang atau 2-3 sendok makan",
        "Sayur: 2-3 sendok makan",
        "Buah: 1 potong sedang",
      ],
      tips: [
        "Gunakan piring/mangkok khusus anak.",
        "Sajikan porsi kecil agar tidak overwhelming.",
        "Biarkan anak minta tambah jika masih lapar.",
        "Jangan paksa habiskan porsi yang terlalu besar.",
      ],
    },
  },
  {
    id: "camilan-sehat",
    icon: Apple,
    title: "Camilan Sehat",
    shortDesc: "Camilan yang bergizi untuk mengisi antara waktu makan utama.",
    color: "text-orange-700",
    bgIcon: "bg-gradient-to-br from-orange-100 to-amber-100",
    detail: {
      description:
        "Camilan sehat membantu memenuhi kebutuhan gizi harian anak. Pilih camilan yang bergizi, bukan jajan tinggi gula, garam, dan pengawet. Camilan sebaiknya diberikan 2 jam sebelum makan utama agar tidak mengganggu nafsu makan.",
      keyPoints: [
        { title: "Buah Segar", desc: "Pisang, pepaya, apel, jeruk, mangga - tinggi vitamin dan serat." },
        { title: "Kacang Rebus", desc: "Kacang tanah, edamame, kacang hijau - sumber protein dan serat." },
        { title: "Produk Susu", desc: "Susu, yogurt, keju, puding susu - sumber kalsium." },
        { title: "Roti Gandum", desc: "Dengan selai kacang atau keju - sumber karbohidrat dan protein." },
      ],
      examples: [
        "Pisang atau pepaya potong",
        "Yogurt dengan buah",
        "Roti gandum dengan selai kacang",
        "Pudding susu",
        "Edamame rebus",
      ],
      tips: [
        "Hindari camilan tinggi gula (coklat, permen, biskuit manis).",
        "Hindari minuman manis dan soda.",
        "Buat camilan sendiri di rumah, lebih sehat dan ekonomis.",
        "Sajikan camilan dalam porsi kecil, 2 jam sebelum makan utama.",
      ],
    },
  },
  {
    id: "minuman",
    icon: Coffee,
    title: "Minuman Anak",
    shortDesc: "Apa yang sebaiknya dan tidak boleh diminum anak.",
    color: "text-sky-700",
    bgIcon: "bg-gradient-to-br from-sky-100 to-blue-100",
    detail: {
      description:
        "Pilihan minuman anak memengaruhi asupan gizi dan kesehatan. Air putih dan susu adalah pilihan terbaik. Hindari minuman manis, soda, dan jus buah kemasan yang tinggi gula.",
      keyPoints: [
        { title: "Air Putih", desc: "Minuman utama. Berikan setelah ASI eksklusif 6 bulan." },
        { title: "Susu", desc: "Susu sapi setelah 1 tahun, 2 gelas (400 ml) sehari." },
        { title: "Jus Buah Segar", desc: "Hanya buah segar yang diblender tanpa gula tambahan, maksimal 1 gelas sehari." },
        { title: "Hindari", desc: "Soda, minuman energi, kopi, teh berkafein, jus kemasan tinggi gula." },
      ],
      examples: [
        "Air putih: utamakan saat anak haus",
        "Susu 2 gelas sehari",
        "Jus buah segar tanpa gula",
        "Smoothie buah-susu",
      ],
      tips: [
        "Gunakan gelas/cangkir, bukan botol dot setelah 12 bulan.",
        "Hindari tidur dengan botol susu (risiko gigi berlubang).",
        "Air kelapa muda sebagai elektrolit alami.",
        "Jangan tambahkan gula pada minuman anak.",
      ],
    },
  },
  {
    id: "makan-responsif",
    icon: Baby,
    title: "Makan Responsif",
    shortDesc: "Pendekatan memberi makan yang menghormati rasa lapar dan kenyang anak.",
    color: "text-pink-700",
    bgIcon: "bg-gradient-to-br from-pink-100 to-rose-100",
    detail: {
      description:
        "Makan responsif (responsive feeding) adalah pendekatan pemberian makan yang berdasarkan prinsip: orang tua menentukan APA yang dimakan, dan anak menentukan BERAPA banyak. Pendekatan ini lebih efektif menjaga nafsu makan anak dalam jangka panjang.",
      keyPoints: [
        { title: "Orang Tua Tentukan", desc: "Menu apa yang disajikan, kapan makan, di mana makan." },
        { title: "Anak Tentukan", desc: "Apakah akan makan dan berapa banyak." },
        { title: "Jangan Paksa", desc: "Jangan memaksa anak makan lebih banyak dari yang dia mau." },
        { title: "Tanpa Distraksi", desc: "Matikan TV, gadget, mainan saat makan." },
      ],
      examples: [
        "Sajikan makan dalam suasana tenang dan menyenangkan",
        "Makan bersama keluarga sebagai role model",
        "Hormati tanda kenyang anak (menutup mulut, membuang makanan)",
        "Jangan paksa habiskan porsi jika anak sudah kenyang",
      ],
      tips: [
        "Anak butuh 10-15 kali terpapar untuk menerima makanan baru.",
        "Sajikan porsi kecil agar tidak overwhelming.",
        "Libatkan anak dalam persiapan makanan.",
        "Jangan gunakan makanan sebagai hadiah atau hukuman.",
        "Jika anak menolak makan, tetap sajikan makanan utama di waktu makan berikutnya.",
      ],
    },
  },
];

export function MakanAnakView() {
  const [selected, setSelected] = useState<Material | null>(null);

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full px-3 py-1">
            <Utensils className="h-3 w-3 mr-1" />
            Edukasi Makan Anak
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Makan Anak
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Pelajari berbagai aspek pemberian makan anak: dari komposisi piring, protein hewani, hingga pendekatan makan responsif yang tepat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {MATERIALS.map((m, i) => (
            <Card
              key={m.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setSelected(m)}
            >
              <CardHeader className="pb-2">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", m.bgIcon)}>
                  <m.icon className={cn("h-6 w-6", m.color)} />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  {m.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">{m.shortDesc}</p>
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-green-700 hover:bg-transparent hover:text-green-800 font-semibold">
                  Pelajari lebih lanjut &rarr;
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selected && (
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", selected.bgIcon)}>
                  <selected.icon className={cn("h-6 w-6", selected.color)} />
                </div>
              )}
              <DialogTitle className="text-xl">{selected?.title}</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              {selected?.detail.description}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 mt-2">
              {/* Poster Isi Piringku - khusus untuk material Isi Piringku */}
              {selected.posterImage && (
                <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 sm:p-4 border-2 border-green-200">
                  <h4 className="font-heading text-base font-bold text-green-800 mb-2 text-center flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Foto Isi Piringku - Usia 2-5 Tahun
                  </h4>
                  <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-white">
                    <img
                      src={selected.posterImage}
                      alt={selected.posterAlt || "Poster Isi Piringku"}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Poster panduan porsi makan anak usia 2-5 tahun - sumber: Kementerian Kesehatan RI
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Poin Penting</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selected.detail.keyPoints.map((p, i) => (
                    <div key={i} className="p-3 rounded-lg bg-green-50/50 border border-green-100">
                      <div className="text-sm font-semibold text-gray-900 mb-0.5">{p.title}</div>
                      <div className="text-xs text-gray-600 leading-relaxed">{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contoh</h4>
                <ul className="space-y-1">
                  {selected.detail.examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Tips Praktis</h4>
                <ul className="space-y-1">
                  {selected.detail.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
