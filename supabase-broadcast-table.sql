-- =====================================================
-- BROADCAST TABLE: Untuk sync konsultasi antar device
-- =====================================================
-- Tabel ini TIDAK punya RLS, jadi siapa saja bisa
-- INSERT dan SELECT tanpa login Supabase Auth.
-- Ini memungkinkan user (yang login via localStorage)
-- untuk mengirim konsultasi yang bisa dibaca admin.
-- =====================================================

-- Buat tabel broadcast_consultations
CREATE TABLE IF NOT EXISTS public.broadcast_consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  nama_orang_tua TEXT NOT NULL,
  nomor_telepon TEXT,
  alamat TEXT,
  nama_anak TEXT NOT NULL,
  tanggal_lahir_anak DATE,
  jenis_kelamin_anak TEXT,
  berat_badan_anak NUMERIC,
  tinggi_badan_anak NUMERIC,
  pertanyaan TEXT NOT NULL,
  jawaban TEXT DEFAULT '',
  status TEXT DEFAULT 'Menunggu Jawaban',
  admin_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

-- DISABLE RLS agar siapa saja bisa baca/tulis
ALTER TABLE public.broadcast_consultations DISABLE ROW LEVEL SECURITY;

-- Buat policy kosong (just in case RLS di-enable nanti)
CREATE POLICY "Anyone can do everything" ON public.broadcast_consultations
  FOR ALL USING (true) WITH CHECK (true);

-- DONE!
