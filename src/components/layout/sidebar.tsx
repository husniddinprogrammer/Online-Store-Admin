"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Store,
  LogOut,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/api";
import { useTranslations } from "@/hooks/use-translations";

const navItemDefs = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/users", key: "nav.users", icon: Users },
  { href: "/products", key: "nav.products", icon: Package },
  { href: "/orders", key: "nav.orders", icon: ShoppingCart },
  { href: "/categories", key: "nav.categories", icon: Tag },
  { href: "/companies", key: "nav.companies", icon: Building2 },
  { href: "/comments", key: "nav.reviews", icon: MessageSquare },
  { href: "/notifications", key: "nav.notifications", icon: Bell },
  { href: "/posters", key: "nav.posters", icon: Image },
  { href: "/analytics", key: "nav.analytics", icon: BarChart2 },
];

const telegramLink = "https://t.me/mahmudovhusniddin";
const collapsed = false;

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const t = useTranslations();
  const navItems = navItemDefs.map((item) => ({ ...item, label: t(item.key) }));

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const refresh = tokenStorage.getRefresh();
      if (refresh) await authService.logout(refresh);
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate("/login");
      setLoggingOut(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="sticky top-0 relative flex h-screen shrink-0 flex-col self-start overflow-hidden border-r border-sidebar-border bg-sidebar"
      >
        <div className="flex h-16 items-center px-4 shrink-0">
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Store className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-sidebar-foreground">
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Store className="h-4 w-4 text-primary-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-sidebar-muted group-hover:text-sidebar-accent-foreground",
                      )}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden whitespace-nowrap"
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

        <div className="space-y-1 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={telegramLink}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150",
                  "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
                aria-label="Open Telegram"
              >
                <Send className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      Telegram
                    </motion.span>
                  )}
                </AnimatePresence>
              </a>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Telegram</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150",
                  "text-sidebar-muted hover:bg-destructive/10 hover:text-destructive disabled:opacity-50",
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {loggingOut ? t("common.loading") : t("auth.logout")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>{t("auth.logout")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
