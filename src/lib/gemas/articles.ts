/**
 * Data Artikel Edukasi Gizi GEMAS
 * Berisi artikel-artikel edukasi tentang gizi anak, MP-ASI, dan pertumbuhan.
 */

export interface ArticleItem {
  id: string;
  judul: string;
  kategori: string;
  ringkasan: string;
  emoji: string;
  durasiBaca: string;
  konten: { judul?: string; paragraf: string }[];
}

export const ARTICLES: ArticleItem[] = [
  {
    id: "pengantar-mpasi",
    judul: "Pengantar MP-ASI: Kapan dan Bagaimana Memulai",
    kategori: "MP-ASI",
    durasiBaca: "5 menit",
    emoji: "🍼",
    ringkasan:
      "MP-ASI (Makanan Pendamping ASI) adalah makanan yang diberikan kepada bayi selain ASI, mulai usia sekitar 6 bulan. Pelajari tanda kesiapan dan cara memulai yang tepat.",
    konten: [
      {
        paragraf:
          "MP-ASI atau Makanan Pendamping ASI adalah makanan atau minuman yang diberikan kepada bayi selain ASI, mulai dari usia 6 bulan hingga usia 24 bulan. Pemberian MP-ASI bertujuan untuk memenuhi kebutuhan gizi yang tidak lagi tercukupi oleh ASI saja, melatih kemampuan makan, dan mengenalkan berbagai rasa serta tekstur makanan. WHO dan Kemenkes RI merekomendasikan pemberian ASI eksklusif selama 6 bulan pertama, kemudian MP-ASI dimulai pada usia 6 bulan bersamaan dengan ASI yang tetap dilanjutkan hingga usia 24 bulan atau lebih.",
      },
      {
        judul: "Tanda Kesiapan Anak Menerima MP-ASI",
        paragraf:
          "Ada beberapa tanda kesiapan bayi untuk menerima MP-ASI. Pertama, kepala anak sudah tegak dan stabil saat didudukkan. Kedua, anak mampu menutup mulut ketika sendok didekatkan dan menelan makanan tanpa tersedak. Ketiga, anak menunjukkan minat terhadap makanan, misalnya meraih makanan orang dewasa atau membuka mulut saat melihat sendok makanan. Keempat, refleks menjulurkan lidah (tongue thrust) sudah mulai hilang. Kelima, berat badan bayi telah mencapai dua kali berat lahir atau minimal 6 kg. Apabila tanda-tanda ini sudah muncul, orang tua dapat mulai memberikan MP-ASI.",
      },
      {
        judul: "Prinsip Pemberian MP-ASI",
        paragraf:
          "Pemberian MP-ASI harus mengikuti beberapa prinsip penting. Pertama, MP-ASI mulai diberikan pada usia 6 bulan, tidak lebih awal dan tidak lebih lambat. Kedua, ASI tetap diberikan secara eksklusif hingga 6 bulan dan dilanjutkan hingga usia 24 bulan atau lebih. Ketiga, makanan harus beragam dan mengandung zat gizi yang dibutuhkan anak, terutama protein hewani. Keempat, tekstur makanan harus sesuai dengan usia anak: puree halus untuk 6-8 bulan, makanan lumat berbentuk potongan kecil untuk 9-11 bulan, dan makanan keluarga untuk 12-23 bulan. Kelima, pemberian makan harus responsif - orang tua menentukan menu, anak menentukan berapa banyak yang dimakan.",
      },
      {
        judul: "Kesalahan yang Sering Terjadi",
        paragraf:
          "Beberapa kesalahan yang sering dilakukan orang tua dalam pemberian MP-ASI antara lain: memberikan MP-ASI terlalu dini (sebelum 6 bulan) yang dapat menyebabkan alergi dan masalah pencernaan; memberikan MP-ASI terlalu lambat (setelah 8 bulan) yang dapat menyebabkan kekurangan gizi; menambahkan gula, garam, atau penyedap rasa pada makanan bayi; memberikan makanan dengan tekstur yang tidak sesuai usia; dan menggunakan makanan instan secara berlebihan. Hindari juga memberikan madu pada bayi di bawah 1 tahun karena berisiko botulisme.",
      },
      {
        paragraf:
          "Apabila orang tua ragu atau memiliki pertanyaan seputar pemberian MP-ASI, jangan ragu untuk berkonsultasi dengan tenaga kesehatan di Posyandu atau Puskesmas terdekat. Ahli gizi dapat memberikan saran yang sesuai dengan kondisi anak dan kondisi keluarga.",
      },
    ],
  },
  {
    id: "isi-piringku",
    judul: "Panduan Isi Piringku untuk Anak",
    kategori: "Makan Anak",
    durasiBaca: "4 menit",
    emoji: "🍽️",
    ringkasan:
      "Isi Piringku adalah panduan praktis untuk menyusun piring makan anak yang sehat dan bergizi seimbang.",
    konten: [
      {
        paragraf:
          "Isi Piringku adalah panduan gizi seimbang yang dianjurkan oleh Kementerian Kesehatan RI. Piring makan anak dibagi menjadi tiga bagian utama: setengah piring berisi sayur dan buah, sepertiga piring berisi makanan pokok sebagai sumber karbohidrat, dan seperenam piring berisi lauk pauk sebagai sumber protein. Susunan ini memastikan anak mendapat gizi yang seimbang untuk pertumbuhan optimal.",
      },
      {
        judul: "Komposisi Piring Anak",
        paragraf:
          "Setengah piring (50%) berisi sayuran dan buah-buahan. Sayuran sebaiknya bervariasi setiap hari - pilih yang beragam warna untuk memastikan beragam nutrisi. Sepertiga piring (33%) berisi makanan pokok sebagai sumber karbohidrat: nasi, kentang, ubi, jagung, atau roti. Sisanya (17%) berisi lauk pauk sebagai sumber protein, dengan prioritas protein hewani seperti telur, ikan, daging, ayam, atau hati. Tambahkan sedikit minyak atau lemak sehat untuk membantu penyerapan vitamin.",
      },
      {
        judul: "Porsi Sesuai Usia",
        paragraf:
          "Porsi makan anak berbeda-beda sesuai usia. Untuk anak usia 1-3 tahun, piring standar sekitar 200-300 ml volume. Untuk usia 4-5 tahun, porsi sedikit lebih besar. Yang penting bukan jumlah, tetapi keberagaman dan konsistensi pemberian. Pastikan anak makan 3 kali makan utama dan 2 kali camilan sehat setiap hari.",
      },
      {
        judul: "Protein Hewani Prioritas",
        paragraf:
          "Penelitian menunjukkan bahwa konsumsi protein hewani yang cukup sangat penting untuk mencegah stunting. Protein hewani mengandung asam amino esensial yang lebih lengkap dibanding protein nabati. Berikan anak minimal satu sumber protein hewani setiap hari: telur, ikan, daging, ayam, atau hati. Susu dan produk olahannya juga termasuk sumber protein hewani yang baik.",
      },
      {
        paragraf:
          "Dengan mengikuti panduan Isi Piringku, orang tua dapat memastikan anak mendapat gizi seimbang setiap hari tanpa perlu menghitung secara rumit. Kuncinya adalah variasi dan konsistensi.",
      },
    ],
  },
  {
    id: "protein-hewani",
    judul: "Pentingnya Protein Hewani untuk Pertumbuhan Anak",
    kategori: "Protein Hewani",
    durasiBaca: "4 menit",
    emoji: "🐟",
    ringkasan:
      "Protein hewani mengandung asam amino esensial yang lengkap dan mudah diserap, sangat penting untuk mencegah stunting.",
    konten: [
      {
        paragraf:
          "Protein adalah zat gizi makro yang berperan penting dalam pertumbuhan dan perkembangan anak. Protein dibutuhkan untuk pembentukan otot, jaringan, enzim, hormon, dan sistem kekebalan tubuh. Protein hewani - yang berasal dari hewan seperti telur, susu, daging, ikan, dan unggas - memiliki kualitas yang lebih tinggi dibandingkan protein nabati karena mengandung semua asam amino esensial dalam jumlah dan proporsi yang optimal untuk tubuh manusia.",
      },
      {
        judul: "Sumber Protein Hewani yang Ekonomis",
        paragraf:
          "Banyak yang mengira protein hewani selalu mahal, padahal ada banyak pilihan ekonomis. Telur adalah sumber protein hewani termurah dan paling lengkap - satu butir telur mengandung sekitar 7 gram protein dengan kualitas tinggi. Ikan lokal seperti tongkol, lele, dan bandeng juga terjangkau. Hati ayam atau sapi sangat tinggi zat besi dan ekonomis. Untuk daerah pesisir, ikan segar adalah pilihan terbaik; untuk daerah pegunungan, telur dan ayam lebih praktis.",
      },
      {
        judul: "Hubungan dengan Stunting",
        paragraf:
          "Stunting atau pendek kronik adalah masalah gizi kronis akibat kekurangan gizi dalam jangka panjang, terutama kekurangan protein dan zat besi. Penelitian menunjukkan bahwa anak yang rutin mengonsumsi protein hewani memiliki risiko stunting yang lebih rendah. Sebuah studi di Indonesia menemukan bahwa pemberian satu telur sehari pada anak usia 6-24 bulan dapat mengurangi risiko stunting hingga 47%. Inilah mengapa pemerintah Indonesia melalui program Makan Bergizi Gratis dan program lainnya memprioritaskan penyediaan protein hewani.",
      },
      {
        judul: "Tips Memberikan Protein Hewani",
        paragraf:
          "Beberapa tips untuk memberikan protein hewani kepada anak: mulai dengan telur rebus yang dihaluskan untuk MP-ASI awal; perkenalkan ikan dengan tekstur lembut (fillet ikan tanpa duri); gunakan hati ayam cincang halus untuk tambahan zat besi; kombinasikan protein hewani dengan sayur untuk meningkatkan penyerapan zat besi; hindari menggoreng dengan minyak berlebih - rebus, kukus, atau panggang lebih sehat. Jika anak alergi terhadap satu jenis protein (misal susu sapi), ganti dengan alternatif lain yang setara.",
      },
      {
        paragraf:
          "Pastikan anak mendapat minimal satu sumber protein hewani setiap hari. Kombinasikan dengan protein nabati (tempe, tahu, kacang-kacangan) untuk variasi dan ekonomi. Dengan asupan protein yang cukup, pertumbuhan anak akan optimal dan risiko stunting dapat ditekan.",
      },
    ],
  },
  {
    id: "cegah-stunting",
    judul: "Cara Mencegah Stunting Sejak Dini",
    kategori: "Cegah Stunting",
    durasiBaca: "5 menit",
    emoji: "📏",
    ringkasan:
      "Stunting dapat dicegah dengan gizi baik pada 1000 Hari Pertama Kehidupan dan dilanjutkan hingga usia 2 tahun.",
    konten: [
      {
        paragraf:
          "Stunting adalah gangguan pertumbuhan kronis pada anak yang ditandai dengan tinggi badan anak lebih pendek dibandingkan standar usianya (Z-score TB/U di bawah -2 SD). Stunting bukan hanya masalah fisik - anak yang stunting juga berisiko mengalami gangguan kognitif, rentan penyakit, dan memiliki produktivitas yang rendah saat dewasa. Indonesia masih menghadapi masalah stunting yang cukup tinggi, sehingga pencegahan sejak dini sangat penting.",
      },
      {
        judul: "Periode Emas: 1000 Hari Pertama Kehidupan",
        paragraf:
          "1000 Hari Pertama Kehidupan (HPK) adalah periode kritis yang dimulai dari awal kehamilan hingga anak berusia 2 tahun (730 hari + 365 hari = 1095 hari, dibulatkan ke 1000). Pada periode ini, pertumbuhan otak dan tubuh anak paling cepat, dan kerusakan akibat kekurangan gizi pada periode ini sulit atau bahkan tidak dapat dipulihkan. Karena itu, pencegahan stunting harus dimulai sejak ibu hamil dengan gizi yang baik, lalu dilanjutkan dengan ASI eksklusif 6 bulan dan MP-ASI yang tepat hingga usia 2 tahun.",
      },
      {
        judul: "Strategi Pencegahan",
        paragraf:
          "Beberapa strategi utama untuk mencegah stunting antara lain: pertama, pastikan gizi ibu hamil terpenuhi dengan asupan zat besi, asam folat, dan protein yang cukup. Kedua, berikan ASI eksklusif selama 6 bulan pertama tanpa makanan atau minuman lain. Ketiga, mulai MP-ASI tepat pada usia 6 bulan dengan tekstur dan komposisi yang sesuai usia. Keempat, prioritaskan protein hewani - telur, ikan, daging, hati. Kelima, jaga kebersihan dan kesehatan lingkungan untuk mencegah infeksi yang dapat mengganggu penyerapan gizi. Keenam, rutin membawa anak ke Posyandu untuk pemantauan pertumbuhan.",
      },
      {
        judul: "Deteksi Dini di Posyandu",
        paragraf:
          "Deteksi dini stunting dilakukan dengan rutin menimbang berat badan dan mengukur tinggi/panjang anak di Posyandu. Apabila hasil pengukuran menunjukkan Z-score di bawah -2 SD, anak perlu mendapat perhatian khusus. Tenaga kesehatan akan memberikan konseling gizi, dan jika perlu, anak dirujuk ke Puskesmas atau Rumah Sakit untuk pemeriksaan lebih lanjut. Pengukuran rutin setiap bulan di Posyandu sangat penting untuk memantau pola pertumbuhan anak dari waktu ke waktu.",
      },
      {
        paragraf:
          "Pencegahan stunting adalah tanggung jawab bersama - orang tua, kader Posyandu, tenaga kesehatan, dan masyarakat. Dengan gizi yang baik dan pemantauan rutin, anak-anak Indonesia dapat tumbuh optimal dan terbebas dari stunting.",
      },
    ],
  },
  {
    id: "makan-responsif",
    judul: "Makan Responsif: Cara Memberi Makan yang Tepat",
    kategori: "Makan Anak",
    durasiBaca: "4 menit",
    emoji: "🥄",
    ringkasan:
      "Makan responsif adalah pendekatan memberi makan yang menghormati rasa lapar dan kenyang anak.",
    konten: [
      {
        paragraf:
          "Makan responsif (responsive feeding) adalah pendekatan pemberian makan yang didasarkan pada prinsip: orang tua menentukan APA yang dimakan anak, dan anak menentukan BERAPA banyak yang dimakan. Pendekatan ini berbeda dengan paksaan makan yang sering dilakukan orang tua tradisional, dan ternyata lebih efektif untuk menjaga nafsu makan anak dalam jangka panjang serta membangun hubungan sehat antara anak dan makanan.",
      },
      {
        judul: "Prinsip Makan Responsif",
        paragraf:
          "Dalam makan responsif, orang tua bertanggung jawab menyediakan makanan bergizi pada waktu yang tepat, di lingkungan yang nyaman dan tenang. Anak bertanggung jawab menentukan apakah akan makan dan berapa banyak. Jangan memaksa anak makan lebih banyak dari yang dia inginkan. Jangan menggunakan makanan sebagai hadiah atau hukuman. Hindari distraksi seperti TV atau gadget saat makan. Biarkan anak belajar makan sendiri sesuai kemampuannya.",
      },
      {
        judul: "Tanda Lapar dan Kenyang",
        paragraf:
          "Anak menunjukkan tanda lapar dengan berbagai cara: meraih makanan, membuka mulut saat sendok didekatkan, menunjuk makanan, atau membuat suara tertentu. Tanda kenyang antara lain: menutup mulut, membuang makanan, memutar kepala, atau bermain dengan makanan tanpa memakannya. Hormati tanda-tanda ini dan jangan memaksa. Anak yang dipaksa makan cenderung kehilangan kemampuan mengenali rasa lapar dan kenyangnya sendiri, yang dapat menyebabkan masalah makan di kemudian hari.",
      },
      {
        judul: "Mengatasi Anak Susah Makan",
        paragraf:
          "Jika anak susah makan, beberapa strategi yang bisa dilakukan: pertama, sajikan makanan dalam porsi kecil agar tidak overwhelming. Kedua, perkenalkan makanan baru berulang kali - anak butuh 10-15 kali terpapar sebelum menerima makanan baru. Ketiga, jadikan orang tua sebagai role model - makan bersama anak dengan menu yang sama. Keempat, libatkan anak dalam persiapan makanan (memilih sayur, mencuci, dll). Kelima, jangan berikan camilan manis atau susu sebelum makan utama karena akan mengurangi nafsu makan. Jika masalah berlanjut, konsultasikan dengan tenaga kesehatan.",
      },
      {
        paragraf:
          "Makan responsif membutuhkan kesabaran dan konsistensi, tetapi hasilnya sangat berharga - anak akan tumbuh dengan hubungan yang sehat terhadap makanan, kemampuan mengenali rasa lapar dan kenyang, serta kebiasaan makan yang baik hingga dewasa.",
      },
    ],
  },
  {
    id: "pemantauan-pertumbuhan",
    judul: "Mengapa Pemantauan Pertumbuhan Anak Itu Penting?",
    kategori: "Pertumbuhan Anak",
    durasiBaca: "3 menit",
    emoji: "🌱",
    ringkasan:
      "Pemantauan rutin pertumbuhan anak di Posyandu membantu deteksi dini masalah gizi sebelum menjadi parah.",
    konten: [
      {
        paragraf:
          "Pemantauan pertumbuhan adalah proses rutin mengukur berat badan, panjang/tinggi badan, dan lingkar lengan anak untuk memantau perkembangannya dibandingkan dengan standar pertumbuhan WHO. Pemantauan ini sangat penting karena masalah gizi pada anak sering tidak menunjukkan gejala yang jelas pada awalnya - anak mungkin masih terlihat sehat meskipun pertumbuhannya mulai terhambat. Hanya dengan pengukuran rutin dan pembandingan dengan standar WHO, masalah dapat dideteksi dini sebelum menjadi parah.",
      },
      {
        judul: "Apa yang Dilakukan di Posyandu?",
        paragraf:
          "Di Posyandu, anak akan ditimbang berat badannya, diukur panjang (untuk <24 bulan) atau tinggi badannya (untuk >=24 bulan), dan kadang diukur lingkar lengan atasnya. Hasil pengukuran dicatat di KMS (Kartu Menuju Sehat) atau buku digital, lalu dipetakan ke kurva pertumbuhan WHO. Kader Posyandu akan menjelaskan hasil pengukuran dan memberikan konseling gizi jika diperlukan. Anak juga mendapat imunisasi sesuai jadwal dan vitamin A dosis tinggi setiap Februari dan Agustus.",
      },
      {
        judul: "Frekuensi Pemantauan",
        paragraf:
          "Frekuensi pemantauan yang ideal adalah: untuk anak 0-6 bulan, setiap bulan; untuk anak 6-24 bulan, setiap bulan; untuk anak 24-60 bulan, setiap 3 bulan minimal. Semakin rutin pemantauan, semakin cepat masalah dapat dideteksi. Jika pertumbuhan anak menunjukkan pola yang perlu perhatian (misalnya berat badan tidak naik dalam 2 bulan berturut-turut), orang tua akan dirujuk ke Puskesmas untuk evaluasi lebih lanjut.",
      },
      {
        judul: "Menggunakan Kalkulator GEMAS",
        paragraf:
          "Selain pemantauan rutin di Posyandu, orang tua juga dapat menggunakan kalkulator status gizi di website GEMAS untuk pemantauan tambahan di rumah. Kalkulator ini menggunakan standar WHO yang sama dengan di Posyandu (LMS method), sehingga hasilnya konsisten. Namun, kalkulator GEMAS tidak menggantikan kunjungan ke Posyandu - tetap rutinlah membawa anak ke Posyandu sesuai jadwal, dan gunakan GEMAS sebagai alat bantu pemantauan mandiri.",
      },
      {
        paragraf:
          "Dengan pemantauan rutin dan deteksi dini, masalah gizi pada anak dapat diatasi sebelum berdampak jangka panjang. Jadilah orang tua proaktif yang rutin memantau pertumbuhan anak!",
      },
    ],
  },
];
