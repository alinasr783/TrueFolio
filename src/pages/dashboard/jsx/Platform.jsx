import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Globe, ExternalLink, Tag, Layers, Clock, CheckCircle, Calendar } from "lucide-react"
import { getSimilarPlatforms } from "@/lib/platforms"

const cn = (...classes) => classes.filter(Boolean).join(" ")

const TypeBadge = ({ type }) => {
  const map = {
    web: { label: "Web App", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
    mobile: { label: "Mobile", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    api: { label: "API", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
    tool: { label: "Tool", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  }
  const cfg = map[type] || map.web
  return (
    <span 
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium", cfg.color)}
      style={{borderRadius: '25px'}}
    >
      {cfg.label}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
    planning: { label: "Planning", color: "bg-blue-500", icon: Clock },
    completed: { label: "Completed", color: "bg-gray-500", icon: CheckCircle },
    on_hold: { label: "On Hold", color: "bg-yellow-500", icon: Clock },
  }

  const config = statusConfig[status] || statusConfig.active
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white",
        "rounded-[50px]",
        config.color,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export default function PlatformDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [similar, setSimilar] = useState([])

  useEffect(() => {
    const key = `platform_${slug}`
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const cached = sessionStorage.getItem(key)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed?.ts && Date.now() - parsed.ts < 10 * 60 * 1000 && parsed.data) {
            setItem(parsed.data)
            setLoading(false)
          }
        }
        const { data, error: err } = await supabase.from("platform").select("*").eq("slug", slug).single()
        if (err) throw err
        setItem(data)
        sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
        try {
          const { data: sims } = await getSimilarPlatforms({ type: data.type, tags: data.tags || [], excludeSlug: data.slug, limit: 6 })
          setSimilar(Array.isArray(sims) ? sims : [])
        } catch {}
      } catch (e) {
        setError("Failed to load platform details")
      } finally {
        setLoading(false)
      }
    }
    if (slug) load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load details</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Platform not found"}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tags = Array.isArray(item.tags) ? item.tags : []
  const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString() : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Platforms
        </button>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
        >
          {/* Cover Image */}
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            {item.cover_url ? (
              <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Layers className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Logo */}
            {item.logo_url && (
              <div className="absolute -bottom-6 left-6">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-2.5">
                  <img 
                    src={item.logo_url} 
                    alt={item.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 pt-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title || item.name}
                </h1>
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status || 'active'} />
                <TypeBadge type={item.type} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {item.live_link && (
                <a 
                  href={item.live_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}
              {item.repo_link && (
                <a 
                  href={item.repo_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Repository
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">Type</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{item.type || "N/A"}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-white">Created</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{createdAt || "N/A"}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">Live Link</span>
            </div>
            {item.live_link ? (
              <a 
                href={item.live_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
              >
                {item.live_link}
              </a>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">N/A</p>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features and Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
            {Array.isArray(item.features) && item.features.length > 0 ? (
              <ul className="space-y-2">
                {item.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{typeof f === "string" ? f : JSON.stringify(f)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">No features listed</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goals</h2>
            {Array.isArray(item.goals) && item.goals.length > 0 ? (
              <ul className="space-y-2">
                {item.goals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{typeof g === "string" ? g : JSON.stringify(g)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">No goals listed</p>
            )}
          </div>
        </div>

        {/* Ownership Percentage */}
        {item.ownership_pct !== undefined && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ownership Percentage</h2>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.ownership_pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.ownership_pct}%</p>
          </div>
        )}

        {/* Similar Projects */}
        {similar.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Similar Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similar.map(p => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{p.title}</div>
                    </div>
                  </div>
                  <a 
                    href={`/dashboard/platform/${p.slug}`} 
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Updated Date */}
        {item.updated_at && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Updated: {new Date(item.updated_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}