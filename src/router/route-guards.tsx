import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RouteLoader } from "@/router/route-loader";
import { useAuthStore } from "@/store/auth.store";

function buildRedirectTarget(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <RouteLoader />;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    const redirect = buildRedirectTarget(location);
    const loginPath =
      redirect && redirect !== "/" ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";
    return <Navigate to={loginPath} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
