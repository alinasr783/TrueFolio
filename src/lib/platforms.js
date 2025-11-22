import { supabase } from "@/lib/supabase"

export async function getAllPlatforms() {
  return await supabase
    .from("platform")
    .select("*")
    .eq("published", true)
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })
}

export async function getTopPlatforms(limit = 8) {
  return await supabase
    .from("platform")
    .select("*")
    .eq("published", true)
    .order("priority", { ascending: false })
    .limit(limit)
}

export async function getPlatformBySlug(slug) {
  return await supabase
    .from("platform")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()
}

export async function searchPlatforms(q, opts = {}) {
  const useFTS = opts.fts === true
  if (useFTS) {
    return await supabase
      .from("platform")
      .select("*")
      .eq("published", true)
      .textSearch("search_vector", q, { type: "websearch" })
  }
  const pattern = `%${q}%`
  return await supabase
    .from("platform")
    .select("*")
    .eq("published", true)
    .or([
      `name.ilike.${pattern}`,
      `title.ilike.${pattern}`,
      `description.ilike.${pattern}`,
      `tags::text.ilike.${pattern}`,
      `features::text.ilike.${pattern}`,
      `goals::text.ilike.${pattern}`,
    ].join(","))
}

export async function getSimilarPlatforms({ type, tags = [], excludeSlug, limit = 6 }) {
  let q = supabase
    .from("platform")
    .select("*")
    .eq("published", true)
    .neq("slug", excludeSlug)
  if (type) q = q.eq("type", type)
  if (tags && tags.length) q = q.contains("tags", [tags[0]])
  return await q.order("priority", { ascending: false }).limit(limit)
}

export async function getTypeCounts() {
  return await supabase.rpc("platform_type_counts")
}