import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Package,
  CreditCard,
  Activity,
  BarChart3,
  Download,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Format date to relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = "blue",
  loading = false,
}) => {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20",
    green:
      "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20",
    orange:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${colorClasses[color]}`}
          style={{ borderRadius: "15px" }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    const icons = {
      payment: DollarSign,
      project: FileText,
      user: Users,
      system: Activity,
      notification: Bell,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type) => {
    const colors = {
      payment:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
      project:
        "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
      user: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20",
      system:
        "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20",
      notification:
        "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20",
    };
    return (
      colors[type] ||
      "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
    );
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
    >
      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {activity.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {activity.description}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {activity.time}
          </span>
          {activity.project && (
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
              {activity.project}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      info: Bell,
      error: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      success:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
      warning:
        "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20",
      info: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
      error: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
    };
    return (
      colors[type] ||
      "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20"
    );
  };

  const Icon = getNotificationIcon(notification.type);

  const handleClick = () => {
    if (notification.unread && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleClick}
      className={`flex items-start gap-4 p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
        notification.unread
          ? "bg-blue-50 dark:bg-blue-900/10 border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
          : "bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-750"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1" style={{ borderRadius: "15px" }}>
            <p
              className={`text-sm font-medium ${notification.unread ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}
            >
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
              {notification.time}
            </span>
          </div>
          {notification.unread && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            transaction.type === "income"
              ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
              : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
          }`}
          style={{ borderRadius: "15px" }}
        >
          {transaction.type === "income" ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {transaction.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {transaction.project} • {transaction.date}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${
            transaction.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}${transaction.amount}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {transaction.status === "completed" ? "Completed" : "Pending"}
        </p>
      </div>
    </motion.div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  subtitle,
  children,
  action,
  to,
  defaultOpen = true,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && (
          <Link
            to={to}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            {action.label}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-6"
        >
          {children}
        </motion.div>
      )}
    </motion.section>
  );
};

// Project Progress Component
const ProjectProgress = ({ projects }) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleProjectClick(project.id)}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-3 h-3 rounded-full ${
                project.status === "active"
                  ? "bg-green-500"
                  : project.status === "on_hold"
                    ? "bg-yellow-500"
                    : project.status === "completed"
                      ? "bg-blue-500"
                      : "bg-gray-500"
              }`}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {project.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {project.client}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  project.progress < 30
                    ? "bg-red-500"
                    : project.progress < 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {project.progress}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Show More Button Component
const ShowMoreButton = ({ onClick, loading = false }) => (
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

// Overview Component
const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notificationsLimit, setNotificationsLimit] = useState(3);
  const [activitiesLimit, setActivitiesLimit] = useState(3);
  const [transactionsLimit, setTransactionsLimit] = useState(3);
  const [loadingMore, setLoadingMore] = useState({
    notifications: false,
    activities: false,
    transactions: false,
  });

  const fetchOverviewData = async (limits = {}) => {
    try {
      if (!limits.notifications) limits.notifications = 3;
      if (!limits.activities) limits.activities = 3;
      if (!limits.transactions) limits.transactions = 3;

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch all data in parallel
      const [
        projectsResponse,
        transactionsResponse,
        activitiesResponse,
        notificationsResponse,
      ] = await Promise.all([
        // Projects
        supabase
          .from("project")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),

        // Transactions
        supabase
          .from("transactions")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limits.transactions),

        // Activities
        supabase
          .from("activities")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limits.activities),

        // Notifications
        supabase
          .from("notifications")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limits.notifications),
      ]);

      // Handle errors
      if (projectsResponse.error)
        throw new Error(projectsResponse.error.message);
      if (transactionsResponse.error)
        throw new Error(transactionsResponse.error.message);
      if (activitiesResponse.error)
        throw new Error(activitiesResponse.error.message);
      if (notificationsResponse.error)
        throw new Error(notificationsResponse.error.message);

      const projects = projectsResponse.data || [];
      const transactions = transactionsResponse.data || [];
      const activities = activitiesResponse.data || [];
      const notifications = notificationsResponse.data || [];

      // Calculate stats
      const totalProjects = projects.length;
      const activeProjects = projects.filter(
        (p) => p.status === "active" || p.status === "in_progress",
      ).length;
      const completedProjects = projects.filter(
        (p) => p.status === "completed",
      ).length;

      // Calculate total revenue from completed transactions
      const totalRevenue = transactions
        .filter((t) => t.type === "income" && t.status === "completed")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Get recent projects for display
      const recentProjects = projects.map((project) => ({
        id: project.id,
        name: project.name,
        client: "Client",
        progress: project.progress || 0,
        status: project.status,
      }));

      // Format transactions for display
      const formattedTransactions = transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        project: transaction.project,
        date: formatRelativeTime(transaction.created_at),
        status: transaction.status,
      }));

      // Format activities for display
      const formattedActivities = activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        project: activity.project,
        time: formatRelativeTime(activity.created_at),
      }));

      // Format notifications for display
      const formattedNotifications = notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: formatRelativeTime(notification.created_at),
        unread: notification.unread,
      }));

      return {
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalRevenue,
          pendingPayments: 0,
        },
        recentTransactions: formattedTransactions,
        recentActivities: formattedActivities,
        notifications: formattedNotifications,
        recentProjects,
      };
    } catch (err) {
      throw err;
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ unread: false })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, unread: false }
            : notification,
        ),
      }));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const loadMore = async (type) => {
    setLoadingMore((prev) => ({ ...prev, [type]: true }));

    let newLimit;
    switch (type) {
      case "notifications":
        newLimit = notificationsLimit + 10;
        setNotificationsLimit(newLimit);
        break;
      case "activities":
        newLimit = activitiesLimit + 10;
        setActivitiesLimit(newLimit);
        break;
      case "transactions":
        newLimit = transactionsLimit + 10;
        setTransactionsLimit(newLimit);
        break;
    }

    try {
      const newData = await fetchOverviewData({
        notifications: type === "notifications" ? newLimit : 3,
        activities: type === "activities" ? newLimit : 3,
        transactions: type === "transactions" ? newLimit : 3,
      });

      setData(newData);
    } catch (err) {
      console.error(`Error loading more ${type}:`, err);
    } finally {
      setLoadingMore((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const overviewData = await fetchOverviewData();
        setData(overviewData);
      } catch (err) {
        console.error("Error fetching overview data:", err);
        setError(err.message);
        setData(getSampleData());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sample data fallback
  const getSampleData = () => ({
    stats: {
      totalProjects: 24,
      activeProjects: 12,
      completedProjects: 8,
      totalRevenue: 45200,
      pendingPayments: 3200,
    },
    recentTransactions: [
      {
        id: 1,
        type: "income",
        amount: 2500,
        description: "Website Development",
        project: "E-commerce Platform",
        date: "2 hours ago",
        status: "completed",
      },
      {
        id: 2,
        type: "expense",
        amount: 500,
        description: "Domain & Hosting",
        project: "Portfolio Site",
        date: "1 day ago",
        status: "completed",
      },
      {
        id: 3,
        type: "income",
        amount: 1800,
        description: "Mobile App Design",
        project: "Fitness Tracker",
        date: "2 days ago",
        status: "pending",
      },
    ],
    recentActivities: [
      {
        id: 1,
        type: "project",
        title: "New project created",
        description: "E-commerce website for Fashion Store",
        time: "2 hours ago",
        project: "Fashion Store",
      },
      {
        id: 2,
        type: "payment",
        title: "Payment received",
        description: "$2,500 for website development",
        time: "4 hours ago",
        project: "E-commerce Platform",
      },
      {
        id: 3,
        type: "user",
        title: "New client registered",
        description: "John Smith from Tech Solutions Inc.",
        time: "1 day ago",
      },
    ],
    notifications: [
      {
        id: 1,
        type: "success",
        title: "Payment Completed",
        message: "Your invoice #INV-001 has been paid",
        time: "1 hour ago",
        unread: true,
      },
      {
        id: 2,
        type: "warning",
        title: "Project Update Needed",
        message: "Client requested changes for the dashboard design",
        time: "3 hours ago",
        unread: true,
      },
      {
        id: 3,
        type: "info",
        title: "New Message",
        message: "You have a new message from Sarah Johnson",
        time: "5 hours ago",
        unread: false,
      },
    ],
    recentProjects: [
      {
        id: 1,
        name: "E-commerce Platform",
        client: "Fashion Store",
        progress: 75,
        status: "active",
      },
      {
        id: 2,
        name: "Mobile App",
        client: "Tech Startup",
        progress: 45,
        status: "active",
      },
      {
        id: 3,
        name: "Portfolio Website",
        client: "Design Agency",
        progress: 90,
        status: "active",
      },
      {
        id: 4,
        name: "CRM System",
        client: "Business Corp",
        progress: 100,
        status: "completed",
      },
    ],
  });

  if (loading) {
    return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error && !data) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Load Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Overview
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Welcome back! Here's what's happening with your projects
                  today.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Projects"
              value={data.stats.totalProjects}
              change="+12%"
              changeType="positive"
              icon={Package}
              color="blue"
              loading={loading}
            />
            <StatCard
              title="Active Projects"
              value={data.stats.activeProjects}
              change="+8%"
              changeType="positive"
              icon={Activity}
              color="green"
              loading={loading}
            />
            <StatCard
              title="Total Revenue"
              value={`$${data.stats.totalRevenue.toLocaleString()}`}
              change="+23%"
              changeType="positive"
              icon={DollarSign}
              color="purple"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div
              className="lg:col-span-2 space-y-8"
              style={{ borderRadius: "15px" }}
            >
              {/* Recent Projects */}
              <CollapsibleSection
                title="Recent Projects"
                subtitle="Latest projects and their progress"
                action={{ label: "View all projects" }}
                to="/projects"
                defaultOpen={true}
              >
                <ProjectProgress projects={data.recentProjects} />
              </CollapsibleSection>

              {/* Recent Transactions */}
              <CollapsibleSection
                title="Recent Transactions"
                subtitle="Latest financial activities"
                action={{ label: "View all projects" }}
                to="/billing"
                defaultOpen={true}
              >
                <div className="space-y-2">
                  {data.recentTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
                {data.recentTransactions.length >= transactionsLimit && (
                  <div className="mt-4">
                    <ShowMoreButton
                      onClick={() => loadMore("transactions")}
                      loading={loadingMore.transactions}
                    />
                  </div>
                )}
              </CollapsibleSection>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Notifications */}
              <CollapsibleSection
                title="Notifications"
                subtitle="Latest updates and alerts"
                defaultOpen={true}
              >
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markNotificationAsRead}
                    />
                  ))}
                </div>
                {data.notifications.length >= notificationsLimit && (
                  <div className="mt-4">
                    <ShowMoreButton
                      onClick={() => loadMore("notifications")}
                      loading={loadingMore.notifications}
                    />
                  </div>
                )}
              </CollapsibleSection>

              {/* Recent Activity */}
              <CollapsibleSection
                title="Recent Activity"
                subtitle="What's happening in your account"
                defaultOpen={true}
              >
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {data.recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
                {data.recentActivities.length >= activitiesLimit && (
                  <div className="mt-4">
                    <ShowMoreButton
                      onClick={() => loadMore("activities")}
                      loading={loadingMore.activities}
                    />
                  </div>
                )}
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
