"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  GitFork, 
  PlayCircle, 
  CheckSquare, 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  LogOut,
  Building2,
  Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav on login & signup
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("opspilot_token"),
    refetchInterval: 10000,
  });

  const handleLogout = () => {
    localStorage.removeItem("opspilot_token");
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Workflows", href: "/workflows", icon: GitFork },
    { label: "Executions", href: "/executions", icon: PlayCircle },
    { 
      label: "Approvals", 
      href: "/approvals", 
      icon: CheckSquare,
      badge: stats?.pending_approvals && stats.pending_approvals > 0 ? stats.pending_approvals : null
    },
    { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
    { label: "Audit Logs", href: "/audit-logs", icon: ShieldCheck },
    { label: "Integrations", href: "/integrations", icon: Cpu },
    { label: "CTO Case Study", href: "/case-study", icon: FileText, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Tenant Indicator */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">OPS PILOT</span>
              <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">AI PLATFORM</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1 text-xs text-slate-700 dark:text-slate-300">
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-slate-800 dark:text-slate-200">Demo Operations</span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
              Demo Environment
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : item.highlight
                    ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 rounded-md border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
