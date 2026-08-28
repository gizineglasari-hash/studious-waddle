-- =====================================================
-- FIX: Update registration trigger to save nomor_telepon and alamat
-- =====================================================
-- Masalah: Trigger handle_new_user hanya copy nama_orang_tua ke profiles
-- table, tidak copy nomor_telepon dan alamat. Akibatnya field tersebut
-- null di database meskipun user sudah input saat register.
--
-- Solusi: Update trigger agar juga copy nomor_telepon dan alamat dari
-- raw_user_meta_data.
-- =====================================================

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that copies ALL fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_orang_tua, email, nomor_telepon, alamat, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_orang_tua', 'Pengguna'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nomor_telepon', ''),
    COALESCE(NEW.raw_user_meta_data->>'alamat', ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    nama_orang_tua = EXCLUDED.nama_orang_tua,
    nomor_telepon = EXCLUDED.nomor_telepon,
    alamat = EXCLUDED.alamat,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Also update existing profiles that have null nomor_telepon/alamat
-- by looking at auth.users user_metadata
-- =====================================================
-- This is a one-time fix for existing users
-- Note: This requires running in Supabase Dashboard with service_role
-- because auth.users is not accessible via anon key

-- For existing users, we can't easily fix their data without service_role
-- The app code will handle this by upserting profiles after login

-- DONE!
-- After running this SQL:
-- 1. New users will have nomor_telepon and alamat saved automatically
-- 2. The app code will also upsert profiles directly as a backup
-- 3. Existing users with null fields will be fixed when they login
--    (the app fetches profile by email and updates it)
