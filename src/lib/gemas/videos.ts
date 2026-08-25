/**
 * Data Video Edukasi Gizi GEMAS
 *
 * Kategori:
 *  - MP-ASI
 *  - Makan Anak
 *  - Protein Hewani
 *  - Isi Piringku
 *  - Cegah Stunting
 *  - Posyandu
 *  - Pertumbuhan Anak
 *
 * Catatan: Video pertama ("Video Edukasi MP-ASI dan Resep MP-ASI") adalah
 * file lokal yang diunggah oleh tim UPTD Puskesmas Neglasari.
 * Untuk video lainnya, admin dapat menambahkan URL YouTube yang valid.
 *
 * Penting: TIDAK ada URL YouTube yang dikarang - semua non-lokal menggunakan
 * placeholder kosong ("") dan flag isLocal = false. Admin perlu mengisi URL
 * YouTube yang valid pada field youtubeId.
 */

export type VideoCategory =
  | "MP-ASI"
  | "Makan Anak"
  | "Protein Hewani"
  | "Isi Piringku"
  | "Cegah Stunting"
  | "Posyandu"
  | "Pertumbuhan Anak";

export interface VideoItem {
  id: string;
  judul: string;
  kategori: VideoCategory;
  durasi: string;
  deskripsi: string;
  /** ID YouTube - kosong jika belum ada. Admin dapat mengisi dengan ID YouTube yang valid */
  youtubeId: string;
  /** Untuk video lokal yang sudah diunggah, gunakan path /videos/... */
  localPath?: string;
  /** Thumbnail placeholder - admin dapat ganti dengan URL gambar */
  emoji: string;
  isLocal?: boolean;
}

export const VIDEO_CATEGORIES: { key: VideoCategory; emoji: string; color: string }[] = [
  { key: "MP-ASI", emoji: "🍼", color: "bg-pink-100 text-pink-800" },
  { key: "Makan Anak", emoji: "🍽️", color: "bg-green-100 text-green-800" },
  { key: "Protein Hewani", emoji: "🐟", color: "bg-rose-100 text-rose-800" },
  { key: "Isi Piringku", emoji: "🥗", color: "bg-emerald-100 text-emerald-800" },
  { key: "Cegah Stunting", emoji: "📏", color: "bg-amber-100 text-amber-800" },
  { key: "Posyandu", emoji: "🩺", color: "bg-blue-100 text-blue-800" },
  { key: "Pertumbuhan Anak", emoji: "🌱", color: "bg-teal-100 text-teal-800" },
];

export const VIDEOS: VideoItem[] = [
  {
    id: "mpasi-resep-local",
    judul: "Video Edukasi MP-ASI dan Resep MP-ASI",
    kategori: "MP-ASI",
    durasi: "Lokal",
    deskripsi:
      "Video edukasi resmi dari UPTD Puskesmas Neglasari Kota Bandung. Pelajari cara memberikan MP-ASI yang tepat sesuai usia anak beserta contoh resep MP-ASI bergizi yang mudah dibuat di rumah.",
    youtubeId: "",
    localPath: "/videos/video-mp-asi-resep.mp4",
    emoji: "🎬",
    isLocal: true,
  },
  {
    id: "mpasi-pengenalan",
    judul: "Pengenalan MP-ASI: Kapan & Bagaimana Memulai",
    kategori: "MP-ASI",
    durasi: "5-10 menit",
    deskripsi:
      "Tanda kesiapan anak untuk MP-ASI dan panduan memulai pemberian makanan pendamping ASI yang tepat.",
    youtubeId: "",
    emoji: "🍼",
  },
  {
    id: "mpasi-6-8-bulan",
    judul: "Tekstur dan Menu MP-ASI Usia 6-8 Bulan",
    kategori: "MP-ASI",
    durasi: "5-10 menit",
    deskripsi:
      "Panduan tekstur makanan, frekuensi, dan contoh menu MP-ASI untuk anak usia 6-8 bulan.",
    youtubeId: "",
    emoji: "🥣",
  },
  {
    id: "mpasi-9-11-bulan",
    judul: "Variasi MP-ASI Usia 9-11 Bulan",
    kategori: "MP-ASI",
    durasi: "5-10 menit",
    deskripsi:
      "Variasi makanan dan tekstur yang sesuai untuk anak usia 9-11 bulan.",
    youtubeId: "",
    emoji: "🍽️",
  },
  {
    id: "mpasi-12-23-bulan",
    judul: "Transisi ke Makanan Keluarga Usia 12-23 Bulan",
    kategori: "MP-ASI",
    durasi: "5-10 menit",
    deskripsi:
      "Bagaimana membiasakan anak makan makanan keluarga yang sehat dan bergizi.",
    youtubeId: "",
    emoji: "👨‍👩‍👧",
  },
  {
    id: "isi-piringku",
    judul: "Panduan Isi Piringku untuk Anak",
    kategori: "Isi Piringku",
    durasi: "5-10 menit",
    deskripsi:
      "Komposisi piring makan anak yang sehat sesuai panduan Kemenkes: karbohidrat, protein hewani, sayur, buah.",
    youtubeId: "",
    emoji: "🍽️",
  },
  {
    id: "protein-hewani",
    judul: "Pentingnya Protein Hewani untuk Pertumbuhan Anak",
    kategori: "Protein Hewani",
    durasi: "5-10 menit",
    deskripsi:
      "Mengapa protein hewani (telur, ikan, daging, hati) sangat penting untuk mencegah stunting.",
    youtubeId: "",
    emoji: "🐟",
  },
  {
    id: "telur-sehari",
    judul: "Satu Telur Sehari untuk Cegah Stunting",
    kategori: "Protein Hewani",
    durasi: "3-5 menit",
    deskripsi:
      "Telur adalah sumber protein hewani ekonomis. Pelajari cara memberikannya dengan benar.",
    youtubeId: "",
    emoji: "🥚",
  },
  {
    id: "cegah-stunting",
    judul: "Cara Mencegah Stunting Sejak Dini",
    kategori: "Cegah Stunting",
    durasi: "5-10 menit",
    deskripsi:
      "Pencegahan stunting dimulai dari 1000 Hari Pertama Kehidupan dan dilanjutkan hingga usia 2 tahun.",
    youtubeId: "",
    emoji: "📏",
  },
  {
    id: "tumbuh-kembang",
    judul: "Memantau Tumbuh Kembang Anak di Posyandu",
    kategori: "Pertumbuhan Anak",
    durasi: "5-10 menit",
    deskripsi:
      "Pentingnya rutin menimbang dan mengukur tinggi anak di Posyandu.",
    youtubeId: "",
    emoji: "🌱",
  },
  {
    id: "posyandu-peran",
    judul: "Peran Posyandu dalam Kesehatan Anak",
    kategori: "Posyandu",
    durasi: "5-10 menit",
    deskripsi:
      "Mengapa Posyandu penting dan apa saja pelayanan yang tersedia.",
    youtubeId: "",
    emoji: "🩺",
  },
  {
    id: "makan responsif",
    judul: "Makan Responsif: Cara Memberi Makan yang Tepat",
    kategori: "Makan Anak",
    durasi: "5-10 menit",
    deskripsi:
      "Prinsip makan responsif: orang tua tentukan menu, anak tentukan porsi sendiri.",
    youtubeId: "",
    emoji: "🥄",
  },
  {
    id: "frekuensi-makan",
    judul: "Frekuensi dan Porsi Makan Anak Sesuai Usia",
    kategori: "Makan Anak",
    durasi: "5-10 menit",
    deskripsi:
      "Berapa kali sehari anak harus makan dan berapa porsi yang tepat?",
    youtubeId: "",
    emoji: "🍱",
  },
];
