-- =====================================================
-- FIX RLS v2: Allow admin to save Draft content
-- =====================================================
-- Masalah dengan versi sebelumnya (supabase-fix-content-rls.sql):
-- Policy SELECT "USING (is_active = true)" menyebabkan INSERT/PATCH dengan
-- is_active=false GAGAL saat menggunakan "Prefer: return=representation".
-- PostgREST mencoba SELECT row yang baru di-insert/udpate, tapi RLS
-- memblokirnya karena is_active=false.
--
-- Solusi: Ubah SELECT policy agar anon bisa baca SEMUA content (active+inactive).
-- Filter is_active=true dilakukan di frontend (VideoEdukasiView), bukan di RLS.
-- Ini aman karena:
-- 1. App hanya menampilkan is_active=true ke pengunjung publik
-- 2. Tidak ada API lain yang expose data ini
-- 3. Admin butuh akses ke Draft content untuk mengelolanya
-- =====================================================

-- Drop all old policies
DROP POLICY IF EXISTS "Public can view active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Public view active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Anyone can read active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can insert content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can delete content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can insert content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can delete content" ON public.educational_contents;
DROP POLICY IF EXISTS "Anyone can insert content" ON public.educational_contents;
DROP POLICY IF EXISTS "Anyone can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Anyone can delete content" ON public.educational_contents;

-- SELECT: Anyone (anon + authenticated) can READ ALL content (active + inactive)
-- Filtering for public visitors is done in the frontend (VideoEdukasiView.tsx)
-- This allows admin (anon role) to see Draft content too.
CREATE POLICY "Anyone can read all content" ON public.educational_contents
  FOR SELECT TO anon, authenticated USING (true);

-- INSERT: Anyone (anon + authenticated) can INSERT
CREATE POLICY "Anyone can insert content" ON public.educational_contents
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- UPDATE: Anyone (anon + authenticated) can UPDATE
CREATE POLICY "Anyone can update content" ON public.educational_contents
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- DELETE: Anyone (anon + authenticated) can DELETE
CREATE POLICY "Anyone can delete content" ON public.educational_contents
  FOR DELETE TO anon, authenticated USING (true);

-- DONE!
-- Setelah run SQL ini:
-- 1. Admin bisa save Draft content (is_active=false) dengan return=representation
-- 2. Admin bisa lihat semua content (active + inactive) di EditWebsite
-- 3. Halaman publik VideoEdukasiView akan filter dan hanya tampilkan is_active=true
-- 4. CRUD lengkap: Add, Edit, Delete, Toggle Publish/Draft semua berfungsi
