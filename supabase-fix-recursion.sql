-- =====================================================
-- Fix: Infinite Recursion in RLS Policy for profiles
-- =====================================================
-- Masalah: Policy "Admins can view all profiles" melakukan query ke
-- profiles table di dalam policy profiles itu sendiri, menyebabkan
-- infinite recursion.
--
-- Solusi: Hapus policy yang bermasalah dan ganti dengan policy
-- yang menggunakan security_definer function.
-- =====================================================

-- 1. Buat function untuk cek apakah user adalah admin
-- Function ini berjalan dengan privileges dari owner (security definer)
-- sehingga tidak terjebak dalam recursion RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Hapus policy lama yang menyebabkan recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;

-- 3. Buat policy baru menggunakan function is_admin()
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- 4. Update policy untuk children (juga ada recursion)
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
CREATE POLICY "Admins can view all children" ON public.children
  FOR SELECT USING (public.is_admin());

-- 5. Update policy untuk consultations
DROP POLICY IF EXISTS "Admins can view all consultations" ON public.consultations;
CREATE POLICY "Admins can view all consultations" ON public.consultations
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update consultations" ON public.consultations;
CREATE POLICY "Admins can update consultations" ON public.consultations
  FOR UPDATE USING (public.is_admin());

-- 6. Update policy untuk educational_contents
DROP POLICY IF EXISTS "Admins can insert content" ON public.educational_contents;
CREATE POLICY "Admins can insert content" ON public.educational_contents
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update content" ON public.educational_contents;
CREATE POLICY "Admins can update content" ON public.educational_contents
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete content" ON public.educational_contents;
CREATE POLICY "Admins can delete content" ON public.educational_contents
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- DONE - Infinite recursion fixed!
-- =====================================================
