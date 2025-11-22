import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xgyybiukqrnlovfgxvhc.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneXliaXVrcXJubG92Zmd4dmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMTM4MDEsImV4cCI6MjA3NTY4OTgwMX0.PSreNxvgJrbXZw6RqZ0J0PlD4rzI6g8aFzpP008SO6A"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

export async function getUserSafe() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const { data } = await supabase.auth.getSession()
      const user = data?.session?.user || null
      return { data: { user }, error: null }
    }
    return await supabase.auth.getUser()
  } catch (e) {
    const { data } = await supabase.auth.getSession()
    const user = data?.session?.user || null
    return { data: { user }, error: e }
  }
}
