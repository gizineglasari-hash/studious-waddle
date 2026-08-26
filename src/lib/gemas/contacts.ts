/**
 * Data Kontak Ahli Gizi & Informasi Puskesmas
 *
 * Catatan: Nomor WhatsApp dan kontak lainnya menggunakan placeholder
 * "PLACEHOLDER" agar mudah diganti oleh developer UPTD Puskesmas Neglasari.
 * Jangan mengarang nomor telepon atau WhatsApp fiktif.
 */

export interface NutritionistInfo {
  nama: string;
  gelar: string;
  peran: string;
  foto: string; // placeholder - admin ganti dengan URL foto asli
  deskripsi: string;
  /** Nomor WhatsApp dalam format internasional tanpa "+" atau "0" di awal. Kosong jika belum tersedia */
  whatsappNumber: string;
  /** Email kontak */
  email: string;
}

export interface PuskesmasInfo {
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  /** Jam layanan (string pendek untuk tampilan ringkas) */
  jamLayanan: string;
  /** Jam layanan dalam bentuk array agar tampil dalam beberapa baris rata kiri */
  jamLayananLines: { hari: string; jam: string }[];
  logo: string; // placeholder - admin ganti dengan URL logo Puskesmas
}

export const NUTRITIONIST: NutritionistInfo = {
  nama: "Surya Dewi Darajati, S.Gz.",
  gelar: "Ahli Gizi",
  peran: "Ahli Gizi UPTD Puskesmas Neglasari",
  foto: "/images/ahli-gizi-surya-dewi.png",
  deskripsi:
    "Dapatkan informasi dan edukasi mengenai gizi anak, pemberian makan, MP-ASI, dan pemantauan pertumbuhan. Konsultasi tersedia pada hari kerja sesuai jam layanan Puskesmas.",
  whatsappNumber: "", // PLACEHOLDER - isi dengan nomor WhatsApp format 62xxx
  email: "", // PLACEHOLDER - isi dengan email resmi Puskesmas
};

export const PUSKESMAS: PuskesmasInfo = {
  nama: "UPTD Puskesmas Neglasari",
  alamat:
    "Jl. Cikutra No.276 C, Neglasari, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 40124, Indonesia",
  telepon: "", // PLACEHOLDER
  email: "", // PLACEHOLDER
  website: "", // PLACEHOLDER
  instagram: "", // PLACEHOLDER - isi @username
  facebook: "", // PLACEHOLDER - isi URL halaman Facebook
  jamLayanan: "Senin - Jumat, 08.00 - 14.00 WIB | Sabtu, 08.00 - 11.00 WIB",
  jamLayananLines: [
    { hari: "Senin - Jumat", jam: "08.00 - 14.00 WIB" },
    { hari: "Sabtu", jam: "08.00 - 11.00 WIB" },
  ],
  logo: "", // PLACEHOLDER - ganti dengan URL logo Puskesmas
};

/**
 * Catatan untuk developer/admin:
 * 1. Ganti semua field PLACEHOLDER (string kosong) dengan data resmi Puskesmas
 * 2. Nomor WhatsApp harus format internasional tanpa "+" atau "0" di awal
 *    Contoh: 6281234567890 (untuk nomor 081234567890)
 * 3. Foto ahli gizi sebaiknya menggunakan foto profesional formal
 * 4. Logo Puskesmas - gunakan format PNG transparan ukuran 200x200px atau lebih
 */
