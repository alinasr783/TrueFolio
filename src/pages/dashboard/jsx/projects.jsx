import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"
import "../css/projects.css";
import { supabase, getUserSafe } from '@/lib/supabase';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Calendar,
  Users,
  Code,
  Globe,
  Smartphone,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Building,
  User,
} from "lucide-react";

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
      icon: Smartphone,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    api: {
      label: "API",
      icon: Code,
      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    design: {
      label: "Design",
      icon: Users,
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
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

// Progress bar component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Progress
        </span>
        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            progress < 30
              ? "bg-red-500"
              : progress < 70
                ? "bg-yellow-500"
                : "bg-green-500",
          )}
        />
      </div>
    </div>
  );
};

// Project card component
const ProjectCard = React.memo(({ project, onEdit, onDelete, onView, onPrefetch }) => {
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

  // Use default values to avoid errors
  const logos = project.logos || [];
  const technologies = project.technologies || [];
  const client = project.client || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      onMouseEnter={() => onPrefetch && onPrefetch(project.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.des || project.description}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
              >
                <button
                  onClick={() => {
                    navigate(`/project/${project.id}`)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4" style={{borderRadius: '25px'}}>
        <StatusBadge status={project.status}  style={{borderRadius: '25px'}} />
        <TypeBadge type={project.type}   style={{borderRadius: '25px'}}/>
      </div>

      <ProgressBar progress={project.progress || 0} />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {project.start_at ? new Date(project.start_at).toLocaleDateString() : 'Not started'}
          </span>
        </div>

        {/* Client Info Section */}
        <div className="flex items-center gap-2">
          {client.avatar_url ? (
            <img
              src={client.avatar_url}
              alt={client.company_name || `${client.first_name} ${client.second_name}`}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              fetchpriority="low"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {client.company_name || `${client.first_name} ${client.second_name}`}
            </p>
          </div>
        </div>
      </div>

     
      {technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
              +{technologies.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
});


// Main component
const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 9;

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects from Supabase
  const fetchProjects = useCallback(async (p = page) => {
    try {
      // 🔹 Get current user
      const { data: { user }, error: userError } = await getUserSafe();
      if (userError) throw userError;

      const cacheKey = `projects_cache_user_${user.id}_p_${p}_s_${pageSize}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.ts && Date.now() - parsed.ts < 5 * 60 * 1000 && Array.isArray(parsed.data)) {
          setProjects(parsed.data);
          setLoading(false);
          setTotal(parsed.total || parsed.data.length);
        }
      } else {
        setLoading(true);
      }

      // 🔹 Fetch only this user's projects
      const from = p * pageSize;
      const to = from + pageSize - 1;
      const { data: projectsData, error: projectsError, count } = await supabase
        .from('project')
        .select(`
          id, name, des, type, status, progress, start_at, end_at, logos, technologies, total_price, live_link,
          client:client_id (company_name, first_name, second_name, avatar_url)
        `, { count: 'exact' })
        .eq('client_id', user.id) // Filter by the current user
        .order('created_at', { ascending: false });
      
      if (from >= 0 && to >= from) {
        const ranged = await supabase
          .from('project')
          .select(`id, name, des, type, status, progress, start_at, end_at, logos, technologies, total_price, live_link,
          client:client_id (company_name, first_name, second_name, avatar_url)`)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to);
        if (ranged.error) throw ranged.error;
        projectsData.splice(0, projectsData.length, ...ranged.data);
      }

      if (projectsError) throw projectsError;

      // 🔹 Transform data
      const transformedProjects = projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.des,
        type: project.type,
        status: project.status,
        progress: project.progress || 0,
        start_at: project.start_at,
        end_at: project.end_at,
        logos: project.logos || [],
        technologies: project.technologies || [],
        total_price: project.total_price,
        live_link: project.live_link,
        client: project.client || {},
        timeline: project.timeline,
        files: project.files,
        ui: project.ui,
        extensions: project.extensions,
        tasks: project.tasks
      }));

      setProjects(transformedProjects);
      setTotal(typeof count === 'number' ? count : transformedProjects.length);
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: transformedProjects, total: typeof count === 'number' ? count : transformedProjects.length, ts: Date.now() }));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProjects(page);
  }, [fetchProjects, page]);

  const filteredProjects = useMemo(() => {
    const q = filters.search.toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = filters.status === "all" || project.status === filters.status;
      const matchesType = filters.type === "all" || project.type === filters.type;
      const matchesSearch =
        project.name?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q) ||
        project.client?.company_name?.toLowerCase().includes(q) ||
        project.client?.first_name?.toLowerCase().includes(q);
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [projects, filters]);

  const handleDeleteProject = async (id) => {
    try {
      const { error } = await supabase
        .from('project')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    planning: projects.filter((p) => p.status === "planning").length,
    on_hold: projects.filter((p) => p.status === "on_hold").length,
  };

  const prefetchProject = useCallback(async (id) => {
    const key = `project_detail_${id}`;
    if (sessionStorage.getItem(key)) return;
    try {
      const { data, error } = await supabase
        .from('project')
        .select(`id, name, des, type, status, progress, start_at, end_at, logos, technologies, total_price, live_link,
          client:client_id (company_name, first_name, second_name, avatar_url), timeline, files, ui, extensions, tasks`)
        .eq('id', id)
        .single();
      if (error) return;
      sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }, []);

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
            <button 
              onClick={fetchProjects}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      

        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Project Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and track all your software projects in one place
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center " style={{borderRadius: '15px'}}>
                  
    
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      In Progress
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                    <CheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Planning
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.planning}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      On Hold
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.on_hold}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center" style={{borderRadius: '15px'}}>
                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"  style={{borderRadius: '15px'}}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{borderRadius: '25px'}}>
                <div className="relative"  style={{borderRadius: '15px'}}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
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
                  <option value="all"  style={{borderRadius: '15px'}}>All Status</option>
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
                  <option value="mobile">Mobile App</option>
                  <option value="api">API</option>
                  <option value="design">Design</option>
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={(p) => console.log("Edit", p)}
                    onDelete={handleDeleteProject}
                    onView={handleViewProject}
                    onPrefetch={prefetchProject}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >Prev</button>
                <button
                  onClick={() => setPage((p) => (p + 1 < Math.ceil(total / pageSize) ? p + 1 : p))}
                  disabled={page + 1 >= Math.ceil(total / pageSize)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >Next</button>
              </div>
            </div>

            {filteredProjects.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No projects match the search criteria
                </p>
              </div>
            )}

            {/* Modal */}
            
          </div>
        </div>
    </>
  );
};

export default ProjectManagement;