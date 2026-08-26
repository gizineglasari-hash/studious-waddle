"use client";

import {
  Calculator,
  Baby,
  Utensils,
  PlayCircle,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  TrendingUp,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGemasStore, type ViewKey } from "@/lib/gemas/store";

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  view: ViewKey;
  badge?: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: Calculator,
    title: "Cek Status Gizi",
    description:
      "Hitung status gizi anak berdasarkan standar pertumbuhan WHO menggunakan metode LMS yang akurat. Dapatkan Z-score dan klasifikasi untuk BB/U, TB/U, BB/TB, dan IMT/U.",
    color: "text-green-700",
    bgColor: "bg-gradient-to-br from-green-100 to-emerald-100",
    view: "cek-status-gizi",
    badge: "Fitur Utama",
  },
  {
    icon: Baby,
    title: "Edukasi MP-ASI",
    description:
      "Pelajari pemberian MP-ASI sesuai usia anak: 6-8 bulan, 9-11 bulan, dan 12-23 bulan, lengkap dengan tekstur, frekuensi, porsi, dan contoh menu.",
    color: "text-pink-700",
    bgColor: "bg-gradient-to-br from-pink-100 to-rose-100",
    view: "mp-asi",
  },
  {
    icon: Utensils,
    title: "Edukasi Makan Anak",
    description:
      "Informasi mengenai Isi Piringku, protein hewani, karbohidrat, sayur, buah, frekuensi makan, porsi, camilan sehat, dan makan responsif.",
    color: "text-emerald-700",
    bgColor: "bg-gradient-to-br from-emerald-100 to-teal-100",
    view: "makan-anak",
  },
  {
    icon: PlayCircle,
    title: "Video Edukasi",
    description:
      "Tonton video singkat dan mudah dipahami mengenai gizi anak, MP-ASI, protein hewani, Isi Piringku, cegah stunting, dan Posyandu.",
    color: "text-rose-700",
    bgColor: "bg-gradient-to-br from-rose-100 to-pink-100",
    view: "video-edukasi",
  },
  {
    icon: PhoneCall,
    title: "Hubungi Ahli Gizi",
    description:
      "Konsultasikan pertanyaan gizi anak Anda dengan ahli gizi UPTD Puskesmas Neglasari Kota Bandung melalui WhatsApp.",
    color: "text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-100 to-sky-100",
    view: "hubungi-ahli",
  },
];

export function HomeView() {
  const { setView } = useGemasStore();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-pattern-soft">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" aria-hidden="true" />
        <div className="absolute top-32 -left-32 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text */}
            <div className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="mb-4 bg-white/80 backdrop-blur-sm border-green-200 text-green-800 shadow-sm rounded-full px-3 py-1"
              >
                <ShieldCheck className="h-3 w-3 mr-1" />
                UPTD Puskesmas Neglasari Kota Bandung
              </Badge>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                Tumbuh Sehat Dimulai dari{" "}
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Makanan yang Tepat
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                Koniciwa Gemas Gempita membantu Ayah dan Bunda memahami gizi anak, memantau pertumbuhan, dan memberikan makanan yang sesuai agar Si Kecil tumbuh optimal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => setView("cek-status-gizi")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all rounded-full px-6"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Cek Status Gizi Anak
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("makan-anak")}
                  className="bg-white/80 backdrop-blur-sm border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-full px-6"
                >
                  Pelajari Gizi Anak
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Slogan */}
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  &ldquo;Cukupi Gizinya, Pantau Tumbuhnya, Sehat Anak Kita!&rdquo;
                </span>
              </div>
            </div>

            {/* Foto Beranda - foto yang diupload */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Soft background circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 via-emerald-50 to-amber-50" />
                <div className="absolute inset-4 rounded-full bg-white/80 backdrop-blur-sm shadow-inner overflow-hidden">
                  <img
                    src="/images/foto-beranda-baru.png"
                    alt="Foto Beranda - Koniciwa Gemas Gempita"
                    title="Foto Beranda"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Floating badges */}
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white rounded-2xl shadow-lg p-3 animate-float-soft" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                      <Baby className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-500">Usia</div>
                      <div className="text-sm font-bold text-gray-900">0-19 th</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-8 bg-white rounded-2xl shadow-lg p-3 animate-float-soft" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-500">Sesuai</div>
                      <div className="text-sm font-bold text-gray-900">WHO</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-2 sm:-left-4 bg-white rounded-2xl shadow-lg p-3 animate-float-soft" style={{ animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center">
                      <HeartHandshake className="h-5 w-5 text-pink-700" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-500">Untuk</div>
                      <div className="text-sm font-bold text-gray-900">Ayah &amp; Bunda</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2 font-medium">Foto Beranda</p>
            </div>
          </div>

          {/* Stats bar dihilangkan sesuai permintaan */}
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 bg-green-50 text-green-700 border-green-200 rounded-full px-3 py-1">
              Fitur Lengkap
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
              Apa yang Bisa Dilakukan di Koniciwa Gemas Gempita?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Beragam fitur edukasi gizi anak untuk membantu orang tua memantau pertumbuhan dan memberikan makan yang tepat bagi Si Kecil.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature, idx) => (
              <Card
                key={feature.title}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => setView(feature.view)}
              >
                <CardHeader className="pb-2">
                  <div className={`h-14 w-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="w-fit bg-amber-100 text-amber-800 text-[10px] mb-1">
                      {feature.badge}
                    </Badge>
                  )}
                  <h3 className="font-heading text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-3 flex items-center text-sm font-semibold text-green-700 group-hover:gap-2 gap-1 transition-all">
                    Buka
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-amber-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold mb-3">
            Mulai Pantau Pertumbuhan Anak Anda Hari Ini
          </h2>
          <p className="text-green-50 mb-6 max-w-xl mx-auto leading-relaxed">
            Cek status gizi anak menggunakan standar WHO yang akurat. Sederhana, cepat, dan mudah digunakan oleh orang tua.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setView("cek-status-gizi")}
              className="bg-white text-green-700 hover:bg-green-50 rounded-full px-6 shadow-lg"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Cek Status Gizi Anak
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("video-edukasi")}
              className="bg-transparent border-white text-white hover:bg-white/10 rounded-full px-6"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Tonton Video Edukasi
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
