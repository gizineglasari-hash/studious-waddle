-- =====================================================
-- Koniciwa Gemas Gempita - Supabase Database Schema
-- =====================================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama_orang_tua TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  nomor_telepon TEXT,
  alamat TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_orang_tua, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_orang_tua', 'Pengguna'),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. CHILDREN TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nama_anak TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  berat_badan NUMERIC NOT NULL,
  tinggi_badan NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CONSULTATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  -- Snapshot of child data at time of consultation
  nama_anak TEXT NOT NULL,
  tanggal_lahir_anak DATE,
  jenis_kelamin_anak TEXT,
  berat_badan_anak NUMERIC,
  tinggi_badan_anak NUMERIC,
  -- Snapshot of parent data
  nama_orang_tua TEXT,
  nomor_telepon TEXT,
  alamat TEXT,
  -- Consultation content
  pertanyaan TEXT NOT NULL,
  jawaban TEXT DEFAULT '',
  status TEXT DEFAULT 'Menunggu Jawaban' CHECK (status IN ('Menunggu Jawaban', 'Sedang Diproses', 'Sudah Dijawab', 'Selesai')),
  admin_id UUID REFERENCES public.profiles(id),
  admin_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- UUID for users, 'admin' for admin notifications
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EDUCATIONAL CONTENTS TABLE (Edit Website)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.educational_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'pdf', 'article', 'banner')),
  category TEXT NOT NULL,
  media_url TEXT,
  external_url TEXT,
  video_source TEXT CHECK (video_source IN ('upload', 'youtube', 'vimeo', 'url')),
  thumbnail_url TEXT,
  article_content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  duration TEXT,
  file_size TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_contents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- CHILDREN POLICIES
-- =====================================================
-- Users can CRUD their own children
CREATE POLICY "Users can view own children" ON public.children
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON public.children
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON public.children
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON public.children
  FOR DELETE USING (auth.uid() = user_id);
-- Admins can view all children
CREATE POLICY "Admins can view all children" ON public.children
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- CONSULTATIONS POLICIES
-- =====================================================
-- Users can view their own consultations
CREATE POLICY "Users can view own consultations" ON public.consultations
  FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own consultations
CREATE POLICY "Users can insert own consultations" ON public.consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can view, update all consultations
CREATE POLICY "Admins can view all consultations" ON public.consultations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update consultations" ON public.consultations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
-- Users can view their own notifications (user_id = their UUID or 'admin')
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid()::text OR user_id = 'admin'
  );
-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (
    user_id = auth.uid()::text OR user_id = 'admin'
  );
-- System can insert notifications (via admin or trigger)
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    user_id = 'admin' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- EDUCATIONAL CONTENTS POLICIES
-- =====================================================
-- Public can view active content only
CREATE POLICY "Public can view active content" ON public.educational_contents
  FOR SELECT USING (is_active = true);
-- Admins can CRUD all content
CREATE POLICY "Admins can insert content" ON public.educational_contents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update content" ON public.educational_contents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete content" ON public.educational_contents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_children_user_id ON public.children(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_educational_contents_type ON public.educational_contents(content_type);
CREATE INDEX IF NOT EXISTS idx_educational_contents_active ON public.educational_contents(is_active);

-- =====================================================
-- DONE - Schema created successfully!
-- =====================================================
