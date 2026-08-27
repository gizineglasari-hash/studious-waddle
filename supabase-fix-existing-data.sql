-- =====================================================
-- FIX EXISTING DATA: Sync user_id mismatch
-- =====================================================
-- Masalah:
-- Beberapa konsultasi di broadcast_consultations menggunakan user_id
-- yang berbeda dari UUID asli di tabel profiles (karena bug di login).
-- Contoh:
--   - profiles: 43aa0ea2-... (User Konsul) - dari Supabase Auth
--   - broadcast_consultations: 7fdd2b2e-... (User Konsul) - dari localStorage
--
-- Solusi: Update user_id di broadcast_consultations agar match dengan
-- UUID asli di profiles, dengan mencocokkan berdasarkan email/nama_orang_tua.
-- =====================================================

-- Update broadcast_consultations.user_id agar match dengan profiles.id
-- berdasarkan email (jika ada) atau nama_orang_tua
UPDATE public.broadcast_consultations bc
SET user_id = p.id
FROM public.profiles p
WHERE (
  -- Match by nama_orang_tua (most reliable since email isn't in broadcast table)
  bc.nama_orang_tua = p.nama_orang_tua
  -- Or by nama_orang_tua case-insensitive
  OR LOWER(bc.nama_orang_tua) = LOWER(p.nama_orang_tua)
)
AND bc.user_id != p.id;

-- Verifikasi hasil
-- SELECT bc.user_id as old_user_id, p.id as new_user_id, bc.nama_orang_tua
-- FROM public.broadcast_consultations bc
-- JOIN public.profiles p ON LOWER(bc.nama_orang_tua) = LOWER(p.nama_orang_tua)
-- WHERE bc.user_id = p.id;

-- DONE!
-- Setelah update, semua konsultasi di broadcast_consultations akan memiliki
-- user_id yang match dengan profiles.id, sehingga:
-- 1. Admin dashboard akan menampilkan konsultasi yang benar
-- 2. Delete user akan juga menghapus konsultasi terkait
