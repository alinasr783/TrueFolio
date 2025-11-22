import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Users,
  Share2,
  Copy,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Eye,
  Download,
  Gift,
  TrendingUp,
  UserPlus,
  CreditCard,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Utility function
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  subtitle,
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
       style={{ borderRadius: "15px" }}
    >
      <div className="flex items-center justify-between" style={{ borderRadius: "15px" }}>
        <div className="flex-1" style={{ borderRadius: "15px" }}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
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

// Referral Code Component
const ReferralCodeSection = ({ referralCode, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Your Referral Code</h2>
      </div>

      <p className="text-blue-100 mb-4">
        Share your code with friends and earn <strong>5%</strong> of their total
        transactions!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <div className="bg-white/10 rounded-lg p-4" style={{ borderRadius: "5px" }}>
            <p className="text-sm text-blue-200 mb-1">Your Code</p>
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono font-bold">
                {referralCode}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                 style={{ borderRadius: "5px" }}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white/10 rounded-lg p-4"  style={{ borderRadius: "5px" }}>
            <p className="text-sm text-blue-200 mb-1">Share Link</p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono truncate flex-1 mr-2">
                {shareUrl}
              </code>
              <button
                onClick={() =>
                  navigator.share?.({ url: shareUrl }) || handleCopy()
                }
                className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
                 style={{ borderRadius: "5px" }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4"  style={{ borderRadius: "5px" }}>
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Share your referral code with friends</li>
          <li>• They enter it during signup</li>
          <li>
            • You earn <strong>5%</strong> of all their transaction amounts
          </li>
          <li>• Earnings are automatically added to your wallet</li>
        </ul>
      </div>
    </div>
  );
};

// Referred Member Item Component
const ReferredMemberItem = ({ member, earnings }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {member.first_name?.[0]}
            {member.second_name?.[0]}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {member.first_name} {member.second_name}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {formatDate(member.created_at)}
              </span>
              <span>•</span>
              <span>{member.email}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(earnings)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Earnings
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Earnings History Item Component
const EarningsHistoryItem = ({ earning }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
          <ArrowUpRight className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            Referral Earnings from {earning.referred_user_name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(earning.created_at)} • Transaction:{" "}
            {earning.transaction_description}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-green-600 dark:text-green-400">
          +{formatCurrency(earning.amount)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          5% of {formatCurrency(earning.original_amount)}
        </p>
      </div>
    </motion.div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  scrollable = false,
  maxHeight = "400px",
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
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
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

// Referral Program Component
const ReferralProgram = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [referredMembers, setReferredMembers] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // State for scroll limits
  const [membersLimit, setMembersLimit] = useState(5);
  const [earningsLimit, setEarningsLimit] = useState(5);
  const [loadingMore, setLoadingMore] = useState({
    members: false,
    earnings: false,
  });

  useEffect(() => {
    fetchReferralData();

    // Set up real-time subscription for transactions
    const setupRealtimeSubscription = () => {
      const subscription = supabase
        .channel("referral-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
          },
          (payload) => {
            // Refresh data when transactions change
            fetchReferralData();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🧩 Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      if (!user) throw new Error("User not authenticated");

      // 🧩 Fetch current user data from 'client' table
      const { data: userData, error: userError } = await supabase
        .from("client")
        .select("*")
        .eq("id", user.id)
        .single();

      

      if (userError) throw new Error(userError.message);
      if (!userData) throw new Error("User data not found");

      setUserData(userData);


      // 🧩 Fetch referred members using referred_by (UUID)
      const { data: referredMembersData, error: membersError } = await supabase
        .from("client")
        .select("*")
        .eq("referred_by", user.id)

      if (membersError) throw new Error(membersError.message);

      setReferredMembers(referredMembersData || []);
      console.log("Referred Members:", referredMembersData)

      // 🧩 Get transactions of referred members
      const referredMemberIds = referredMembersData?.map((m) => m.id) || [];
      let totalEarnings = 0;
      let earningsHistoryData = [];

      if (referredMemberIds.length > 0) {
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("transactions")
            .select("*, client:client_id(first_name, second_name)")
            .in("client_id", referredMemberIds)
            .eq("status", "completed")
            .order("created_at", { ascending: false });

        if (transactionsError) throw new Error(transactionsError.message);
        

        // 🧮 Calculate 5% earnings
        earningsHistoryData =
          transactionsData?.map((transaction) => {
            const earnings = transaction.amount * 0.05;
            totalEarnings += earnings;


            return {
              id: transaction.id,
              amount: earnings,
              original_amount: transaction.amount,
              created_at: transaction.created_at,
              transaction_description: transaction.description,
              referred_user_name:
                `${transaction.client?.first_name || ""} ${transaction.client?.second_name || ""}`.trim() ||
                "Unknown User",
            };
          }) || [];
      }

      setEarningsHistory(earningsHistoryData);

      // 🧩 Calculate stats
      const totalReferrals = referredMembersData?.length || 0;
      const pendingEarnings = 0; // You can add pending transactions calculation later

      setStats({
        walletBalance: userData?.wallet || 0,
        totalEarnings,
        totalReferrals,
        pendingEarnings,
      });
    } catch (err) {
      console.error("Error fetching referral data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadMore = (type) => {
    setLoadingMore((prev) => ({ ...prev, [type]: true }));

    setTimeout(() => {
      switch (type) {
        case "members":
          setMembersLimit((prev) => prev + 5);
          break;
        case "earnings":
          setEarningsLimit((prev) => prev + 5);
          break;
      }
      setLoadingMore((prev) => ({ ...prev, [type]: false }));
    }, 500);
  };

  // Calculate member earnings for display
  const getMemberEarnings = (memberId) => {
    return earningsHistory
      .filter((earning) => {
        const earningMember = referredMembers.find(
          (m) =>
            `${m.first_name} ${m.second_name}` === earning.referred_user_name
        );
        // Use m.id instead of client_id because this is the actual UUID
        return earningMember?.id === memberId;
      })
      .reduce((total, earning) => total + earning.amount, 0);
  };


  const displayedMembers = referredMembers.slice(0, membersLimit);
  const displayedEarnings = earningsHistory.slice(0, earningsLimit);

  if (loading && !userData) {
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
                  Referral Program
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Earn 5% commission from every transaction made by your
                  referrals
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" style={{ borderRadius: "5px" }}>

                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Referral Code Section */}
          {userData?.referral_code && (
            <div className="mb-8">
              <ReferralCodeSection
                referralCode={userData.referral_code}
                onCopy={handleCopyCode}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Wallet Balance"
              value={formatCurrency(stats?.walletBalance || 0)}
              subtitle="Available for withdrawal"
              icon={CreditCard}
              color="blue"
              loading={loading}
            />
            <StatCard
              title="Total Earnings"
              value={formatCurrency(stats?.totalEarnings || 0)}
              subtitle="From referral program"
              icon={DollarSign}
              color="green"
              loading={loading}
            />
            <StatCard
              title="Total Referrals"
              value={stats?.totalReferrals || 0}
              subtitle="Active members"
              icon={Users}
              color="purple"
              loading={loading}
            />
            <StatCard
              title="Pending Earnings"
              value={formatCurrency(stats?.pendingEarnings || 0)}
              subtitle="From pending transactions"
              icon={TrendingUp}
              color="orange"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Referred Members */}
              <CollapsibleSection
                title="Your Referrals"
                icon={UserPlus}
                scrollable={true}
                maxHeight="500px"
                defaultOpen={true}
              >
                <div className="space-y-4">
                  {displayedMembers.map((member) => (
                    <ReferredMemberItem
                      key={member.id}
                      member={member}
                      earnings={getMemberEarnings(member.id)}
                    />
                  ))}

                  {referredMembers.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No referrals yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Share your referral code to start earning!
                      </p>
                    </div>
                  )}
                </div>

                {referredMembers.length > membersLimit && (
                  <div className="mt-4">
                    <ShowMoreButton
                      onClick={() => loadMore("members")}
                      loading={loadingMore.members}
                      hasMore={referredMembers.length > membersLimit}
                    />
                  </div>
                )}
              </CollapsibleSection>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Earnings History */}
              <CollapsibleSection
                title="Earnings History"
                icon={Award}
                scrollable={true}
                maxHeight="500px"
                defaultOpen={true}
              >
                <div className="space-y-4">
                  {displayedEarnings.map((earning) => (
                    <EarningsHistoryItem key={earning.id} earning={earning} />
                  ))}

                  {earningsHistory.length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No earnings yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Earnings will appear here when your referrals make
                        transactions
                      </p>
                    </div>
                  )}
                </div>

                {earningsHistory.length > earningsLimit && (
                  <div className="mt-4">
                    <ShowMoreButton
                      onClick={() => loadMore("earnings")}
                      loading={loadingMore.earnings}
                      hasMore={earningsHistory.length > earningsLimit}
                    />
                  </div>
                )}
              </CollapsibleSection>

              {/* How It Works */}
              <CollapsibleSection
                title="How It Works"
                icon={Star}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Share Your Code
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Share your unique referral code with friends and
                        colleagues
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        They Sign Up
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Your friends enter your code during registration on our
                        platform
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        They Make Transactions
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        When they pay for projects or services, you earn
                        commission
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Get Paid
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Earn <strong>5%</strong> of all their transaction
                        amounts, automatically added to your wallet
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralProgram;
