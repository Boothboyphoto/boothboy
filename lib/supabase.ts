import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — ใช้ใน Client Components (realtime, gallery)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Event {
  id: string
  name: string
  slug: string
  date: string | null
  venue: string | null
  description: string | null
  cover_url: string | null
  is_active: boolean
  created_at: string
}

export interface Photo {
  id: string
  event_id: string
  storage_path: string
  url: string
  filename: string | null
  name_tags: string | null
  width: number | null
  height: number | null
  created_at: string
}
