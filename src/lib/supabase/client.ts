import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Client Configuration
 *
 * Environment Variables (set in Vercel → Settings → Environment Variables):
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL (https://xxx.supabase.co)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
 *
 * If these are not set, the app falls back to localStorage (single-device mode).
 * When set, authentication and data sync across all devices.
 *
 * TEMPORARY: Supabase is DISABLED until RLS recursion issue is fixed.
 * Set NEXT_PUBLIC_SUPABASE_ENABLED=1 to re-enable.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseEnabled = process.env.NEXT_PUBLIC_SUPABASE_ENABLED === "1";

export const isSupabaseConfigured = supabaseEnabled && !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Helper to check if Supabase is available
 */
export function getSupabase() {
  return supabase;
}
