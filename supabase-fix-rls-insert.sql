-- Fix RLS: Allow INSERT without authentication for children, consultations, notifications
-- This is needed because users login via localStorage mode (not Supabase Auth)
-- Run this in Supabase Dashboard → SQL Editor

-- Drop old INSERT policies
DROP POLICY IF EXISTS "Users insert own children" ON public.children;
DROP POLICY IF EXISTS "Users insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can insert content" ON public.educational_contents;

-- Create new INSERT policies that allow anyone to insert
CREATE POLICY "Anyone can insert children" ON public.children
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert consultations" ON public.consultations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert content" ON public.educational_contents
  FOR INSERT WITH CHECK (true);

-- Also allow UPDATE and DELETE for anyone (for admin to answer consultations)
DROP POLICY IF EXISTS "Users update own children" ON public.children;
DROP POLICY IF EXISTS "Users delete own children" ON public.children;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can update consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can update content" ON public.educational_contents;
DROP POLICY IF EXISTS "Authenticated can delete content" ON public.educational_contents;

CREATE POLICY "Anyone can update children" ON public.children
  FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete children" ON public.children
  FOR DELETE USING (true);
CREATE POLICY "Anyone can update profiles" ON public.profiles
  FOR UPDATE USING (true);
CREATE POLICY "Anyone can update consultations" ON public.consultations
  FOR UPDATE USING (true);
CREATE POLICY "Anyone can update notifications" ON public.notifications
  FOR UPDATE USING (true);
CREATE POLICY "Anyone can update content" ON public.educational_contents
  FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete content" ON public.educational_contents
  FOR DELETE USING (true);

-- DONE!
