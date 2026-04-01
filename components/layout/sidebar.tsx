"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tag,
  Building2,
  MessageSquare,
  Bell,
  Image,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/comments", label: "Reviews", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/posters", label: "Posters", icon: Image },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

const telegramLink = "https://t.me/mahmudovhusniddin";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const refresh = tokenStorage.getRefresh();
      if (refresh) await authService.logout(refresh);
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push("/login");
      setLoggingOut(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border overflow-hidden shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
                  <Store className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sidebar-foreground font-semibold text-sm whitespace-nowrap">
                  Store Admin
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <Store className="w-4 h-4 text-primary-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "shrink-0 w-4 h-4 transition-colors",
                        isActive ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-accent-foreground"
                      )}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Footer actions */}
        <div className="p-2 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={telegramLink}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
                aria-label="Open Telegram"
              >
                <Send className="shrink-0 w-4 h-4" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Telegram
                    </motion.span>
                  )}
                </AnimatePresence>
              </a>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right"><p>Telegram</p></TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={cn(
                  "flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  "text-sidebar-muted hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                )}
              >
                <LogOut className="shrink-0 w-4 h-4" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right"><p>Logout</p></TooltipContent>}
          </Tooltip>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="absolute -right-3.5 top-[4.5rem] z-10 h-7 w-7 rounded-full border border-sidebar-border bg-sidebar text-sidebar-muted hover:text-sidebar-accent-foreground shadow-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </motion.aside>
    </TooltipProvider>
  );
}
