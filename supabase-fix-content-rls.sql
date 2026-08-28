-- =====================================================
-- FIX RLS: Allow admin (anon role) to manage educational_contents
-- =====================================================
-- Masalah: Admin login via localStorage (anon role di Supabase),
-- tapi policy lama hanya mengizinkan "authenticated" untuk INSERT/UPDATE/DELETE.
-- Akibatnya: admin tidak bisa menambah/mengubah/menghapus konten di EditWebsite.
--
-- Solusi: Update policy agar anon + authenticated bisa INSERT/UPDATE/DELETE.
-- SELECT tetap dibatasi untuk is_active = true (public hanya lihat yang aktif).
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can view active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Public view active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Anyone can read active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can insert content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can delete content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can insert content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can delete content" ON public.educational_contents;

-- Public (anon + authenticated) can READ active content
CREATE POLICY "Anyone can read active content" ON public.educational_contents
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Admin (anon + authenticated) can INSERT
CREATE POLICY "Anyone can insert content" ON public.educational_contents
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admin (anon + authenticated) can UPDATE (all rows, including inactive)
CREATE POLICY "Anyone can update content" ON public.educational_contents
  FOR UPDATE TO anon, authenticated USING (true);

-- Admin (anon + authenticated) can DELETE
CREATE POLICY "Anyone can delete content" ON public.educational_contents
  FOR DELETE TO anon, authenticated USING (true);

-- DONE!
-- Setelah run SQL ini:
-- 1. Admin bisa menambah/mengubah/menghapus konten di EditWebsite
-- 2. Konten yang ditambahkan akan otomatis muncul di halaman Video dan Media Edukasi
-- 3. Pengunjung hanya bisa melihat konten yang is_active = true
