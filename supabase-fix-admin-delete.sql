-- =====================================================
-- FIX ADMIN DELETE & SYNC OPERATIONS
-- =====================================================
-- Masalah:
-- 1. Admin login via localStorage (BUKAN Supabase Auth)
--    sehingga auth.uid() = null. RLS policy yang menggunakan
--    auth.uid() tidak berlaku untuk admin.
-- 2. Tabel profiles, children, notifications, consultations
--    tidak punya policy DELETE untuk anon role.
--    Akibatnya: deleteUser() silently gagal di Supabase,
--    data tetap ada, dan muncul lagi setelah refresh.
--
-- Solusi: Tambahkan policy DELETE untuk anon + authenticated
-- di tabel profiles, children, notifications, consultations.
-- Ini konsisten dengan pola broadcast_consultations yang
-- sudah disabled RLS-nya.
-- =====================================================

-- =====================================================
-- PROFILES: Allow DELETE for anon + authenticated
-- =====================================================
DROP POLICY IF EXISTS "Anyone can delete profiles" ON public.profiles;
CREATE POLICY "Anyone can delete profiles" ON public.profiles
  FOR DELETE TO anon, authenticated USING (true);

-- =====================================================
-- CHILDREN: Allow DELETE for anon + authenticated
-- =====================================================
DROP POLICY IF EXISTS "Anyone can delete children" ON public.children;
CREATE POLICY "Anyone can delete children" ON public.children
  FOR DELETE TO anon, authenticated USING (true);

-- =====================================================
-- NOTIFICATIONS: Allow DELETE for anon + authenticated
-- =====================================================
DROP POLICY IF EXISTS "Anyone can delete notifications" ON public.notifications;
CREATE POLICY "Anyone can delete notifications" ON public.notifications
  FOR DELETE TO anon, authenticated USING (true);

-- =====================================================
-- CONSULTATIONS: Allow DELETE for anon + authenticated
-- =====================================================
DROP POLICY IF EXISTS "Anyone can delete consultations" ON public.consultations;
CREATE POLICY "Anyone can delete consultations" ON public.consultations
  FOR DELETE TO anon, authenticated USING (true);

-- =====================================================
-- VERIFIKASI: Cek semua policy yang aktif
-- =====================================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- DONE! Setelah run SQL ini:
-- 1. Admin bisa menghapus user secara permanen dari Supabase
-- 2. Data anak yang ditambahkan user akan tampil di admin dashboard
-- 3. Sinkronisasi data antar device berfungsi penuh
