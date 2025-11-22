import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Calendar,
  Globe,
  FileText,
  Code,
  Clock,
  CheckCircle,
  Circle,
  Download,
  ExternalLink,
  User,
  DollarSign,
  PlayCircle,
  ShoppingCart,
  Eye,
  EyeOff,
  Zap,
  Share,
  Shield,
  Languages,
  BarChart3,
  Mail,
  Search,
  PenTool,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Target,
  PieChart
} from "lucide-react";

// Utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: "Active", color: "bg-green-500", icon: PlayCircle },
    planning: { label: "Planning", color: "bg-blue-500", icon: Clock },
    completed: { label: "Completed", color: "bg-gray-500", icon: CheckCircle },
    on_hold: { label: "On Hold", color: "bg-yellow-500", icon: EyeOff },
    in_progress: { label: "In Progress", color: "bg-green-500", icon: PlayCircle },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white",
        config.color,
      )}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Progress
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
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

// Show More Button Component
const ShowMoreButton = ({ onClick, loading = false, hasMore = true }) => {
  if (!hasMore) return null;

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1">
          Show More
          <ChevronDown className="w-4 h-4" />
        </div>
      )}
    </button>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  scrollable = false,
  maxHeight = "400px"
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4"
        >
          <div 
            className={scrollable ? "overflow-y-auto" : ""}
            style={scrollable ? { maxHeight } : {}}
          >
            {children}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700" style={{borderRadius: '10px'}}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Extension Icon component
const ExtensionIcon = ({ name }) => {
  const iconConfig = {
    "SEO Optimization": Search,
    "Monthly Maintenance": Clock,
    "Content Writing": PenTool,
    "Social Media Integration": Share,
    "Website Backup Plan": Shield,
    "Custom Email Setup": Mail,
    "Speed Optimization": Zap,
    "Security Enhancement": Shield,
    "Multi-language Support": Languages,
    "Analytics Integration": BarChart3,
  };

  const IconComponent = iconConfig[name] || CreditCard;
  return <IconComponent className="w-5 h-5" />;
};

// Task Item Component
const TaskItem = ({ task, done }) => (
  <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    {done ? (
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
    ) : (
      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
    )}
    <span
      className={cn(
        "text-gray-900 dark:text-gray-100 flex-1 text-sm",
        done && "line-through text-gray-500",
      )}
    >
      {task}
    </span>
  </div>
);

// File Item Component
const FileItem = ({ file }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div className="flex items-center gap-3 min-w-0">
      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.name}
        </p>
        {file.type && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {file.type}
          </p>
        )}
      </div>
    </div>
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm flex-shrink-0 ml-2"
    >
      <Download className="w-3 h-3" />
      Download
    </a>
  </div>
);

// ProjectDetails Component
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for scroll limits
  const [timelineLimit, setTimelineLimit] = useState(5);
  const [tasksLimit, setTasksLimit] = useState(5);
  const [filesLimit, setFilesLimit] = useState(5);
  const [uiLimit, setUiLimit] = useState(4);
  const [extensionsLimit, setExtensionsLimit] = useState(20);
  const [logosLimit, setLogosLimit] = useState(4);

  // Loading states for show more buttons
  const [loadingMore, setLoadingMore] = useState({
    timeline: false,
    tasks: false,
    files: false,
    ui: false,
    extensions: false,
    logos: false
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: projectData, error: projectError } = await supabase
          .from("project")
          .select(
            `
            *,
            client:client_id (*)
          `,
          )
          .eq("id", id)
          .single();

        if (projectError) throw new Error(`Failed to load project: ${projectError.message}`);
        if (!projectData) throw new Error("Project not found");

        setProject(projectData);
        setClient(projectData.client || {});
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    } else {
      setError("Project ID is missing");
      setLoading(false);
    }
  }, [id]);

  // Safe JSON parsing function
  const safeParse = (value, fallback = []) => {
    if (!value) return fallback;
    try {
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return fallback;
    }
  };

  // Function to load more items
  const loadMore = (type) => {
    setLoadingMore(prev => ({ ...prev, [type]: true }));

    setTimeout(() => {
      switch (type) {
        case 'timeline':
          setTimelineLimit(prev => prev + 5);
          break;
        case 'tasks':
          setTasksLimit(prev => prev + 5);
          break;
        case 'files':
          setFilesLimit(prev => prev + 5);
          break;
        case 'ui':
          setUiLimit(prev => prev + 4);
          break;
        case 'extensions':
          setExtensionsLimit(prev => prev + 4);
          break;
        case 'logos':
          setLogosLimit(prev => prev + 4);
          break;
      }
      setLoadingMore(prev => ({ ...prev, [type]: false }));
    }, 500);
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center ml-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading project details...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center ml-10">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Load Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "Project not found"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
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
      </>
    );
  }

  // Parse all JSON fields with error handling
  const timeline = safeParse(project.timeline);
  const files = safeParse(project.files);
  const ui = safeParse(project.ui);
  const extensions = safeParse(project.extensions);
  const tasks = safeParse(project.tasks);
  const logos = safeParse(project.logos);

  // Calculate total extensions price
  const totalExtensionsPrice = extensions
    .filter((ext) => ext.active)
    .reduce((total, ext) => total + (ext.price || 0), 0);

  const totalProjectCost = (project.total_price || 0) + totalExtensionsPrice;

  // Get limited data for display
  const displayedTimeline = timeline.slice(0, timelineLimit);
  const displayedTasks = tasks.slice(0, tasksLimit);
  const displayedFiles = files.slice(0, filesLimit);
  const displayedUi = ui.slice(0, uiLimit);
  const displayedExtensions = extensions.slice(0, extensionsLimit);
  const displayedLogos = logos.slice(0, logosLimit);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Projects
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {project.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  {project.des}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            {/* Project Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6" >
              <StatCard
                icon={Calendar}
                label="Start Date"
                value={project.start_at ? new Date(project.start_at).toLocaleDateString() : "Not set"}
                color="blue"
              />
              <StatCard
                icon={DollarSign}
                label="Project Price"
                value={`$${project.total_price ? project.total_price.toLocaleString() : "0"}`}
                color="green"
              />
              <StatCard
                icon={ShoppingCart}
                label="Extensions"
                value={`+$${totalExtensionsPrice.toLocaleString()}`}
                color="purple"
              />
              <StatCard
                icon={PieChart}
                label="Type"
                value={project.type}
                color="orange"
              />
              <StatCard
                icon={User}
                label="Client"
                value={client?.company_name || `${client?.first_name} ${client?.second_name}` || "No client"}
                color="indigo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Section */}
              <CollapsibleSection title="Project Progress" icon={PlayCircle} defaultOpen={true}>
                <ProgressBar progress={project.progress || 0} />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {project.start_at
                        ? new Date(project.start_at).toLocaleDateString()
                        : "Not started"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {project.end_at
                        ? new Date(project.end_at).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Timeline Section */}
              {timeline.length > 0 && (
                <CollapsibleSection 
                  title="Project Timeline" 
                  icon={Clock}
                  scrollable={true}
                  maxHeight="400px"
                  defaultOpen={false}
                >
                  <div className="space-y-3">
                    {displayedTimeline.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        style={{borderRadius: '10px'}}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            item.completed
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600",
                          )}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.phase}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.date ? new Date(item.date).toLocaleDateString() : "No date"}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {timeline.length > timelineLimit && (
                    <div className="mt-4">
                      <ShowMoreButton 
                        onClick={() => loadMore('timeline')}
                        loading={loadingMore.timeline}
                        hasMore={timeline.length > timelineLimit}
                      />
                    </div>
                  )}
                </CollapsibleSection>
              )}

              {/* Tasks Section */}
              {tasks.length > 0 && (
                <CollapsibleSection 
                  title="Project Tasks" 
                  icon={CheckCircle}
                  scrollable={true}
                  maxHeight="400px"
                  defaultOpen={false}
                >
                  <div className="space-y-2">
                    {displayedTasks.map((task, index) => (
                      <TaskItem key={index} task={task.task} done={task.done} />
                    ))}
                  </div>
                  {tasks.length > tasksLimit && (
                    <div className="mt-4">
                      <ShowMoreButton 
                        onClick={() => loadMore('tasks')}
                        loading={loadingMore.tasks}
                        hasMore={tasks.length > tasksLimit}
                      />
                    </div>
                  )}
                </CollapsibleSection>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <CollapsibleSection 
                  title="Project Files" 
                  icon={FileText}
                  scrollable={true}
                  maxHeight="400px"
                  defaultOpen={false}
                >
                  <div className="space-y-2">
                    {displayedFiles.map((file, index) => (
                      <FileItem key={index} file={file} />
                    ))}
                  </div>
                  {files.length > filesLimit && (
                    <div className="mt-4">
                      <ShowMoreButton 
                        onClick={() => loadMore('files')}
                        loading={loadingMore.files}
                        hasMore={files.length > filesLimit}
                      />
                    </div>
                  )}
                </CollapsibleSection>
              )}

              {/* UI Pages Section */}
              {ui.length > 0 && (
                <CollapsibleSection 
                  title="Website Components" 
                  icon={PieChart}
                  defaultOpen={false}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{borderRadius: '25px'}}>
                    {displayedUi.map((page, index) => (
                      <div
                        key={index}
                        className={cn(
                          "border rounded-lg overflow-hidden transition-all",
                          page.active
                            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                            : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-75",
                        )}
                         style={{borderRadius: '10px'}}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {page.active ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {page.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {page.description}
                                </p>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-1 rounded flex-shrink-0",
                                page.active
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
                              )}
                            >
                              {page.active ? "Active" : "Planned"}
                            </span>
                          </div>
                          {page.image_url && (
                            <div className="mt-3">
                              <img
                                src={page.image_url}
                                alt={page.name}
                                className="w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600"
                              />
                              <div className="mt-2 text-center">
                                <a
                                  href={page.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Full Size
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {ui.length > uiLimit && (
                    <div className="mt-4">
                      <ShowMoreButton 
                        onClick={() => loadMore('ui')}
                        loading={loadingMore.ui}
                        hasMore={ui.length > uiLimit}
                      />
                    </div>
                  )}
                </CollapsibleSection>
              )}

              {/* Extensions Section */}
              {extensions.length > 0 && (
                <CollapsibleSection 
                  title="Available Extensions" 
                  icon={ShoppingCart}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {displayedExtensions.map((extension, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            extension.active
                              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                              : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/30",
                          )}
                           style={{borderRadius: '10px'}}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={cn(
                                "p-2 rounded flex-shrink-0",
                                extension.active
                                  ? "bg-green-100 dark:bg-green-800/30"
                                  : "bg-gray-100 dark:bg-gray-600",
                              )}>
                                <ExtensionIcon name={extension.name} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {extension.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {extension.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                EGP {extension.price}
                              </p>
                              <div className="flex items-center gap-1 justify-end mt-1">
                                {extension.active ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Available</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Cost Summary */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"  style={{borderRadius: '10px'}}>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Base Project</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            EGP{project.total_price ? project.total_price.toLocaleString() : "0"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Extensions</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            +EGP{totalExtensionsPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-gray-100">Total Cost</span>
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            EGP{totalProjectCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {extensions.length > extensionsLimit && (
                      <div className="mt-4">
                        <ShowMoreButton 
                          onClick={() => loadMore('extensions')}
                          loading={loadingMore.extensions}
                          hasMore={extensions.length > extensionsLimit}
                        />
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Information */}
              {client && (
                <CollapsibleSection title="Client Information" icon={User} defaultOpen={true}>
                  <div className="flex items-center gap-3 mb-4">
                    {client.avatar_url ? (
                      <img
                        src={client.avatar_url}
                        alt={
                          client.company_name ||
                          `${client.first_name} ${client.second_name}`
                        }
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {client.company_name ||
                          `${client.first_name} ${client.second_name}`}
                      </p>
                      {client.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {client.phone && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Phone:</span> {client.phone}
                      </p>
                    )}
                    {client.country && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Country:</span> {client.country}
                      </p>
                    )}
                    {client.bio && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs">
                        {client.bio}
                      </p>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Live Link */}
              {project.live_link && (
                <CollapsibleSection title="Live Project" icon={Globe} defaultOpen={true}>
                  <a
                    href={project.live_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Live Site
                  </a>
                </CollapsibleSection>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <CollapsibleSection title="Technologies" icon={Code} defaultOpen={true}>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Active Extensions Summary */}
              {extensions.filter(ext => ext.active).length > 0 && (
                <CollapsibleSection title="Active Extensions" icon={CheckCircle} defaultOpen={false}>
                  <div className="space-y-2">
                    {extensions
                      .filter((ext) => ext.active)
                      .map((extension, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="flex items-center gap-2">
                            <ExtensionIcon name={extension.name} />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {extension.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex-shrink-0">
                            EGP{extension.price}
                          </span>
                        </div>
                      ))}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between font-semibold text-sm">
                        <span>Total:</span>
                        <span>EGP{totalExtensionsPrice}</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {/* Logos */}
              {logos.length > 0 && (
                <CollapsibleSection title="Project Logos" icon={FileText} defaultOpen={false}>
                  <div className="grid grid-cols-2 gap-3">
                    {displayedLogos.map((logo, index) => (
                      <img
                        key={index}
                        src={logo.url || logo}
                        alt={`Project logo ${index + 1}`}
                        className="w-full h-auto rounded border border-gray-200 dark:border-gray-700 bg-white p-2"
                      />
                    ))}
                  </div>
                  {logos.length > logosLimit && (
                    <div className="mt-4">
                      <ShowMoreButton 
                        onClick={() => loadMore('logos')}
                        loading={loadingMore.logos}
                        hasMore={logos.length > logosLimit}
                      />
                    </div>
                  )}
                </CollapsibleSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
