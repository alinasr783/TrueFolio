import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import {
  Search,
  Globe,
  Eye,
  ExternalLink,
  Tag,
  MoreVertical,
  Layers,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Cpu,
  Database,
} from "lucide-react"

// Utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
    planning: { label: "Planning", color: "bg-blue-500", icon: Clock },
    completed: { label: "Completed", color: "bg-gray-500", icon: CheckCircle },
    on_hold: { label: "On Hold", color: "bg-yellow-500", icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ",
        "rounded-[50px]",
        config.color,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Type badge component
const TypeBadge = ({ type }) => {
  const typeConfig = {
    web: {
      label: "Web App",
      icon: Globe,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    mobile: {
      label: "Mobile",
      icon: Zap,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    api: {
      label: "API",
      icon: Cpu,
      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    tool: {
      label: "Tool",
      icon: Database,
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
  };

  const config = typeConfig[type] || typeConfig.web;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
        config.color,
      )}
      style={{borderRadius: '25px'}}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Platform card component
const PlatformCard = React.memo(({ item, onPrefetch }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
      onMouseEnter={() => onPrefetch && onPrefetch(item.slug)}
    >
      {/* Cover Image Section */}
      <div className="relative h-36 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {item.cover_url ? (
          <img 
            src={item.cover_url} 
            alt={`${item.title || item.name} cover`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Logo */}
        {item.logo_url && (
          <div className="absolute -bottom-4 left-4">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1.5">
              <img 
                src={item.logo_url} 
                alt={`${item.title || item.name} logo`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 pt-6">
        {/* Header with Title and Menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {item.title || item.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
          
          {/* Menu Button */}
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-10"
                >
                  <button
                    onClick={() => {
                      navigate(`/dashboard/platform/${item.slug}`);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={item.status || 'active'} />
          <TypeBadge type={item.type} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mb-3">
          <button 
            onClick={() => navigate(`/dashboard/platform/${item.slug}`)}
            className="flex-1 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium text-center"
          >
            View Details
          </button>
          <a 
            href={item.live_link || "#"} 
            target={item.live_link ? "_blank" : "_self"} 
            rel="noopener noreferrer"
            className={cn(
              "px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5",
              item.live_link 
                ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" 
                : "border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            )}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit
          </a>
        </div>

        {/* Tags */}
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Main component
const Platforms = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 9;

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    tag: "all",
    search: "",
  });

  const fetchPlatforms = useCallback(async (p = page) => {
    try {
      setLoading(true);
      setError(null);
      const cacheKey = `platforms_cache_v1`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.ts && Date.now() - parsed.ts < 5 * 60 * 1000 && Array.isArray(parsed.data)) {
          setItems(parsed.data);
          setLoading(false);
          setTotal(parsed.total || parsed.data.length);
        }
      }

      const { data, error: err, count } = await supabase
        .from("platform")
        .select("id, slug, name, title, description, tags, logo_url, cover_url, live_link, type, status, priority", { count: 'exact' })
        .eq("published", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (err) throw err;

      setItems(Array.isArray(data) ? data : []);
      setTotal(typeof count === 'number' ? count : (Array.isArray(data) ? data.length : 0));
      sessionStorage.setItem(cacheKey, JSON.stringify({ 
        data: Array.isArray(data) ? data : [], 
        total: typeof count === 'number' ? count : (Array.isArray(data) ? data.length : 0), 
        ts: Date.now() 
      }));
    } catch (e) {
      setError("Failed to load platforms");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { 
    fetchPlatforms(page);
  }, [fetchPlatforms, page]);

  const uniqueTags = useMemo(() => {
    const s = new Set();
    items.forEach(i => Array.isArray(i.tags) && i.tags.forEach(t => s.add(t)));
    return ["all", ...Array.from(s)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return items.filter(i => {
      const matchesType = filters.type === "all" || i.type === filters.type;
      const matchesTag = filters.tag === "all" || (Array.isArray(i.tags) && i.tags.includes(filters.tag));
      const matchesSearch = (i.name || "").toLowerCase().includes(q) || (i.title || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q);
      const matchesStatus = filters.status === "all" || i.status === filters.status;
      return matchesType && matchesTag && matchesSearch && matchesStatus;
    });
  }, [items, filters]);

  const stats = {
    total: items.length,
    web: items.filter(i => i.type === 'web').length,
    mobile: items.filter(i => i.type === 'mobile').length,
    api: items.filter(i => i.type === 'api').length,
    tool: items.filter(i => i.type === 'tool').length,
    active: items.filter(i => i.status === 'active').length,
  };

  const prefetch = useCallback(async (slug) => {
    const key = `platform_${slug}`;
    if (sessionStorage.getItem(key)) return;
    try {
      const { data } = await supabase.from("platform").select("*").eq("slug", slug).single();
      if (data) sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading platforms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10 flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button 
            onClick={fetchPlatforms}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            style={{borderRadius: '15px'}}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Our Platforms
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Projects we fully own and operate across different user segments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Platforms
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Web Apps
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.web}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Mobile Apps
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.mobile}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  API Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.api}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                <Cpu className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Tools
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.tool}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8" style={{borderRadius: '15px'}}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{borderRadius: '25px'}}>
            <div className="relative" style={{borderRadius: '15px'}}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search platforms..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{borderRadius: '15px'}}
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{borderRadius: '15px'}}
            >
              <option value="all" style={{borderRadius: '15px'}}>All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{borderRadius: '15px'}}
            >
              <option value="all">All Types</option>
              <option value="web">Web App</option>
              <option value="mobile">Mobile</option>
              <option value="api">API</option>
              <option value="tool">Tool</option>
            </select>
            <select
              value={filters.tag || "all"}
              onChange={(e) =>
                setFilters({ ...filters, tag: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{borderRadius: '15px'}}
            >
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag === "all" ? "All Tags" : tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(item => (
              <PlatformCard key={item.id} item={item} onPrefetch={prefetch} />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              style={{borderRadius: '15px'}}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => (p + 1 < Math.ceil(total / pageSize) ? p + 1 : p))}
              disabled={page + 1 >= Math.ceil(total / pageSize)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              style={{borderRadius: '15px'}}
            >
              Next
            </button>
          </div>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No platforms match your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Platforms;
