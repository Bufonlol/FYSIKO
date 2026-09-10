import { createClient } from '@supabase/supabase-js'

// The Supabase anon key is safe to ship in the client bundle — access is
// enforced by RLS, not by hiding this value. Falls back to these defaults
// when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren't set at build time.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://rrknlhicfhlufmfaylbv.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJya25saGljZmhsdWZtZmF5bGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MzQ4MDcsImV4cCI6MjEwNDMxMDgwN30.-auBzd_VQ1uG90WuWJVo4clXW0y7MLf22sba2ka0mNg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
