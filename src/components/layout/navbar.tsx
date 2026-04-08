"use client";

import { Bell, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { useUnseenNotificationCount } from "@/hooks/use-notifications";
import { getInitials } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/api";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "@/hooks/use-translations";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { data: unseenCount } = useUnseenNotificationCount();

  const handleLogout = async () => {
    try {
      const refresh = tokenStorage.getRefresh();
      if (refresh) await authService.logout(refresh);
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" asChild className="relative">
          <Link to="/notifications" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unseenCount != null && unseenCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {unseenCount > 9 ? "9+" : unseenCount}
              </Badge>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {user ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? "Admin"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {user?.role && (
                  <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                    {user.role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/notifications">{t("nav.notifications")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
