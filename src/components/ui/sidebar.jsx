"use client";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  ChevronsUpDown,
  FileClock,
  GraduationCap,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MessagesSquare,
  Plus,
  Settings,
  UserCircle,
  UserCog,
  UserSearch,
  CreditCard,
  FolderOpen,
  Gift,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Fetch user data from Supabase
  // Setup real-time subscription for user updates
  // Get current user from auth
  // Fetch user data from client table using id (not client_id)
  // Use id instead of client_id
  // If no data in client table, use basic auth data
  // If error, use fallback data
  // Show loading while fetching data
  useEffect(() => {
    fetchUserData();

    // إعداد real-time subscription لتحديثات المستخدم
    const subscription = supabase
      .channel("user-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client",
        },
        () => {
          fetchUserData();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // الحصول على المستخدم الحالي من المصادقة
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authUser) {
        navigate("/login");
        return;
      }

      // جلب بيانات المستخدم من جدول client باستخدام id (ليس client_id)
      const { data: userData, error: userError } = await supabase
        .from("client")
        .select("*")
        .eq("id", authUser.id) // استخدام id بدلاً من client_id
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        // إذا لم توجد بيانات في جدول client، استخدام بيانات المصادقة الأساسية
        setUser({
          id: authUser.id,
          name:
            authUser.user_metadata?.first_name &&
            authUser.user_metadata?.last_name
              ? `${authUser.user_metadata.first_name} ${authUser.user_metadata.last_name}`
              : authUser.email?.split("@")[0] || "User",
          email: authUser.email,
          avatar:
            authUser.user_metadata?.first_name?.[0] +
              authUser.user_metadata?.last_name?.[0] ||
            authUser.email?.[0]?.toUpperCase() ||
            "U",
        });
        return;
      }

      if (userData) {
        setUser({
          id: userData.id,
          user_id: userData.user_id,
          name:
            `${userData.first_name || ""} ${userData.second_name || ""}`.trim() ||
            "User",
          email: userData.email || authUser.email,
          avatar:
            `${userData.first_name?.[0] || ""}${userData.second_name?.[0] || ""}`.toUpperCase() ||
            "U",
          avatar_url: userData.avatar_url,
          wallet: userData.wallet,
          referral_code: userData.referral_code,
          company_name: userData.company_name,
          role: userData.role,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // في حالة الخطأ، استخدام بيانات افتراضية
      setUser({
        name: "User",
        email: "user@example.com",
        avatar: "U",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // عرض loading أثناء جلب البيانات
  if (loading && !user) {
    return (
      <motion.div
        className={cn(
          "sidebar fixed left-0 z-40 h-full shrink-0 border-r bg-white dark:bg-black",
        )}
        initial="closed"
        animate="closed"
        variants={sidebarVariants}
        transition={transitionProps}
      >
        <div className="relative z-40 flex h-full shrink-0 flex-col bg-white dark:bg-black transition-all">
          <div className="flex h-[54px] w-full shrink-0 border-b p-2 items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r bg-white dark:bg-black",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex h-full shrink-0 flex-col bg-white dark:bg-black transition-all"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2"
                    >
                      <Avatar className="rounded size-4">
                        <AvatarFallback>
                          {user?.company_name?.[0] || user?.avatar?.[0] || "O"}
                        </AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              {user?.company_name || "Organization"}
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md p-1 min-w-[200px]"
                  >
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm dark:text-white"
                    >
                      {/* <Link to="/settings/members" className="w-full">
                        <UserCog className="h-4 w-4" /> Manage members
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm dark:text-white"
                    >
                      <Link to="/settings/integrations" className="w-full">
                        <Blocks className="h-4 w-4" /> Integrations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm dark:text-white"
                    > */}
                      <Link
                        to="/signup"
                        className="flex items-center gap-2 w-full"
                      >
                        <Plus className="h-4 w-4" />
                        Create or join an organization
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {/* Overview Dashboard */}
                    <Link
                      to="/dashboard"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("dashboard") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Overview Dashboard
                          </p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Projects Management */}
                    <Link
                      to="/projects"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("projects") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <FolderOpen className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Projects Management
                          </p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Billing & Payments */}
                    <Link
                      to="/billing"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("billing") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Billing & Payments
                          </p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Referral System */}
                    <Link
                      to="/referral"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("referral") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <Gift className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Referral System
                          </p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Tools */}
                    <Link
                      to="/dashboard/tools"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("tools") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <Blocks className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Tools</p>
                        )}
                      </motion.li>
                    </Link>

                    {/* Platforms */}
                    <Link
                      to="/dashboard/platforms"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("platforms") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <Layout className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Platforms</p>
                        )}
                      </motion.li>
                    </Link>

                    <Separator className="w-full bg-gray-200 dark:bg-gray-700" />

                    <Link
                      to="/library/knowledge"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("library") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Knowledge Base
                          </p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/feedback"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("feedback") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <MessageSquareText className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Feedback</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/review"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800",
                        pathname?.includes("review") &&
                          "bg-muted text-blue-600 dark:bg-gray-800",
                      )}
                    >
                      <FileClock className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Document Review
                          </p>
                        )}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                {/* Account Settings Link */}
                <Link
                  to="/account-settings"
                  className="flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800"
                >
                  <UserCog className="h-4 w-4 shrink-0" />
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">
                        Account Settings
                      </p>
                    )}
                  </motion.li>
                </Link>

                {/* Integrations Settings Link */}
                <Link
                  to="/settings/integrations"
                  className="flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Integrations</p>
                    )}
                  </motion.li>
                </Link>

                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary dark:hover:bg-gray-800">
                        <Avatar className="size-4">
                          <AvatarFallback>
                            {user?.avatar?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Account</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      sideOffset={5}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md p-1 min-w-[200px]"
                    >
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            {user?.avatar?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium dark:text-white">
                            {user?.name || "User"}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground dark:text-gray-400">
                            {user?.email || "user@example.com"}
                          </span>
                          {user?.company_name && (
                            <span className="line-clamp-1 text-xs text-muted-foreground dark:text-gray-400">
                              {user.company_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator className="dark:bg-gray-700" />
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm dark:text-white"
                      >
                        <Link to="/settings/profile" className="w-full">
                          <UserCircle className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm dark:text-white"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
