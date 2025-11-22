import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Download,
  Filter,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  X,
  MoreHorizontal,
  CreditCard,
  Building,
  User,
  PieChart,
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

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
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

// Filter Component
const FilterDropdown = ({ filters, onFilterChange, onClearFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filter
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h3>
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange("dateRange", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Transaction Item Component
const TransactionItem = ({ transaction, onViewDetails }) => {
  const getStatusColor = (status) => {
    const colors = {
      completed:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
      pending:
        "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20",
      failed: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: CheckCircle,
      pending: Clock,
      failed: X,
    };
    return icons[status] || Clock;
  };

  const StatusIcon = getStatusIcon(transaction.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`p-3 rounded-lg ${
              transaction.type === "income"
                ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
            }`}
            style={{ borderRadius: "12px" }}
          >
            {transaction.type === "income" ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {transaction.description}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  transaction.status,
                )}`}
              >
                <StatusIcon className="w-3 h-3" />
                {transaction.status.charAt(0).toUpperCase() +
                  transaction.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                {transaction.project || "No Project"}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(transaction.created_at)}</span>
              <span>•</span>
              <span>ID: {transaction.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={`text-lg font-bold ${
                transaction.type === "income"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {transaction.type === "income" ? "Income" : "Expense"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(transaction)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {/* <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Transaction Details Modal
const TransactionDetailsModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Transaction Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Amount
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  transaction.type === "income"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Status
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1 capitalize">
                {transaction.status}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Description
            </p>
            <p className="text-gray-900 dark:text-gray-100 mt-1">
              {transaction.description}
            </p>
          </div>

          {/* Project Info */}
          {transaction.project && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Project
              </p>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {transaction.project}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Created
              </p>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                {new Date(transaction.created_at).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Last Updated
              </p>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {formatRelativeTime(transaction.created_at)}
              </p>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Transaction ID
            </p>
            <p className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
              {transaction.id}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Receipt
          </button>
        </div>
      </motion.div>
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

// Billing and Payments Component
const BillingAndPayments = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionsLimit, setTransactionsLimit] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [wallet, setWallet] = useState(0);

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    dateRange: "all",
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filters, searchTerm]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("transactions")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false });

      if (transactionsError) throw new Error(transactionsError.message);

      setTransactions(transactionsData || []);

      // Calculate stats
      const totalIncome = transactionsData
        .filter((t) => t.type === "income" && t.status === "completed")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalExpenses = transactionsData
        .filter((t) => t.type === "expense" && t.status === "completed")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const pendingTransactions = transactionsData.filter(
        (t) => t.status === "pending",
      ).length;

      const { data: walletData, error: walletError } = await supabase
        .from("client")
        .select("wallet")
        .eq("id", user.id)

      if (walletError) throw new Error(walletError.message);
      setWallet(walletData || []);

      

      setStats({
        totalIncome,
        totalExpenses,
        netRevenue: totalIncome - totalExpenses,
        pendingTransactions,
        totalTransactions: transactionsData.length,
      });
    } catch (err) {
      console.error("Error fetching billing data:", err);
      setError(err.message);
      // Fallback to sample data
      setTransactions(getSampleTransactions());
      setStats(getSampleStats());
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.project
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.id?.toString().includes(searchTerm),
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === filters.status,
      );
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === filters.type,
      );
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(
          (transaction) => new Date(transaction.created_at) >= startDate,
        );
      }
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      type: "all",
      dateRange: "all",
    });
    setSearchTerm("");
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const loadMoreTransactions = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setTransactionsLimit((prev) => prev + 10);
      setLoadingMore(false);
    }, 500);
  };

  const getSampleTransactions = () => [
    {
      id: 1,
      type: "income",
      amount: 2500,
      description: "Website Development Payment",
      project: "E-commerce Platform",
      status: "completed",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: "expense",
      amount: 500,
      description: "Domain & Hosting Renewal",
      project: "Portfolio Site",
      status: "completed",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: "income",
      amount: 1800,
      description: "Mobile App Design",
      project: "Fitness Tracker",
      status: "pending",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: "income",
      amount: 3200,
      description: "Full-stack Development",
      project: "CRM System",
      status: "completed",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      type: "expense",
      amount: 150,
      description: "SSL Certificate",
      project: "Business Website",
      status: "completed",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getSampleStats = () => ({
    totalIncome: 7500,
    totalExpenses: 650,
    netRevenue: 6850,
    pendingTransactions: 1,
    totalTransactions: 5,
  });

  const displayedTransactions = filteredTransactions.slice(
    0,
    transactionsLimit,
  );

  if (loading && !transactions.length) {
    return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ml-10">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ml-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Billing & Payments
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage and track all your financial transactions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Spend"
              value={formatCurrency(stats?.totalIncome || 0)}
              icon={ArrowUpRight}
              color="green"
              loading={loading}
            />
            {/* <StatCard
              title="Total Expenses"
              value={formatCurrency(stats?.totalExpenses || 0)}
              icon={ArrowDownRight}
              color="red"
              loading={loading}
            /> */}
            <StatCard
              title="Net balance"
              value={formatCurrency(wallet[0]?.wallet || 0)}
              icon={DollarSign}
              color="blue"
              loading={loading}
            />
            <StatCard
              title="Pending Transactions"
              value={stats?.pendingTransactions || 0}
              icon={Clock}
              color="orange"
              loading={loading}
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FilterDropdown
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredTransactions.length} transactions found
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {displayedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onViewDetails={handleViewDetails}
              />
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>

          {/* Show More Button */}
          {filteredTransactions.length > transactionsLimit && (
            <div className="mt-6">
              <ShowMoreButton
                onClick={loadMoreTransactions}
                loading={loadingMore}
                hasMore={filteredTransactions.length > transactionsLimit}
              />
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default BillingAndPayments;
