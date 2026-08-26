-- =====================================================
-- Fix RLS Policy untuk Notifications
-- =====================================================
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- =====================================================
-- Masalah: Saat user membuat konsultasi, mereka perlu insert
-- notifikasi "admin" (untuk memberi tahu admin ada konsultasi baru).
-- Policy lama hanya mengizinkan admin yang insert notifikasi.
-- =====================================================

-- Hapus policy lama
DROP POLICY IF EXISTS "Admins insert notifs" ON public.notifications;

-- Buat policy baru: user bisa insert notifikasi untuk admin (saat buat konsultasi)
-- dan admin bisa insert notifikasi untuk user (saat jawab konsultasi)
CREATE POLICY "Anyone can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Hapus policy lama untuk update
DROP POLICY IF EXISTS "Users update own notifs" ON public.notifications;

-- Buat policy baru: user bisa update notifikasi miliknya (mark as read)
CREATE POLICY "Users update own notifs" ON public.notifications
  FOR UPDATE USING (
    user_id = auth.uid()::text OR user_id = 'admin'
  );

-- =====================================================
-- DONE - Policy berhasil diupdate!
-- =====================================================
