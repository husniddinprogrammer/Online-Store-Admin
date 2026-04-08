import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserRole } from "@/types";
import { tokenStorage } from "@/lib/api";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (data: AuthResponse) => {
        tokenStorage.setAccess(data.accessToken);
        tokenStorage.setRefresh(data.refreshToken);
        set({
          user: { id: data.userId, name: data.name, email: data.email, role: data.role },
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),

      hasRole: (...roles: UserRole[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: "admin-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
