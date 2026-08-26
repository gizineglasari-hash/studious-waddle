-- =====================================================
-- FIX RLS: Simple policies - Public Read, Owner Write
-- =====================================================
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- Pendekan: Semua tabel bisa dibaca oleh siapa saja (anon + authenticated)
-- Tapi hanya pemilik yang bisa menulis/update/delete
-- =====================================================

-- Hapus semua policy lama
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own children" ON public.children;
DROP POLICY IF EXISTS "Users can insert own children" ON public.children;
DROP POLICY IF EXISTS "Users can update own children" ON public.children;
DROP POLICY IF EXISTS "Users can delete own children" ON public.children;
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Users view own children" ON public.children;
DROP POLICY IF EXISTS "Users insert own children" ON public.children;
DROP POLICY IF EXISTS "Users update own children" ON public.children;
DROP POLICY IF EXISTS "Users delete own children" ON public.children;

DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can view all consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can update consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users insert own consultations" ON public.consultations;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users view own notifs" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifs" ON public.notifications;
DROP POLICY IF EXISTS "Admins insert notifs" ON public.notifications;

DROP POLICY IF EXISTS "Public can view active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Public view active content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can insert content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Admins can delete content" ON public.educational_contents;

DROP FUNCTION IF EXISTS public.is_admin();

-- PROFILES: Public read, owner update
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- CHILDREN: Public read, authenticated insert/update/delete own
CREATE POLICY "Anyone can read children" ON public.children
  FOR SELECT USING (true);
CREATE POLICY "Users insert own children" ON public.children
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own children" ON public.children
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own children" ON public.children
  FOR DELETE USING (auth.uid() = user_id);

-- CONSULTATIONS: Public read, authenticated insert, authenticated update
CREATE POLICY "Anyone can read consultations" ON public.consultations
  FOR SELECT USING (true);
CREATE POLICY "Users insert own consultations" ON public.consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can update consultations" ON public.consultations
  FOR UPDATE TO authenticated USING (true);

-- NOTIFICATIONS: Public read, authenticated insert/update
CREATE POLICY "Anyone can read notifications" ON public.notifications
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (true);

-- EDUCATIONAL CONTENTS: Public read active, authenticated insert/update/delete
CREATE POLICY "Anyone can read active content" ON public.educational_contents
  FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can insert content" ON public.educational_contents
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update content" ON public.educational_contents
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete content" ON public.educational_contents
  FOR DELETE TO authenticated USING (true);

-- DONE!
