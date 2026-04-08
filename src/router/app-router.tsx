import { Suspense, lazy, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { NotFoundPage } from "@/pages/not-found";
import { ProtectedRoute, PublicOnlyRoute, RootRedirect } from "@/router/route-guards";
import { RouteLoader } from "@/router/route-loader";
import { RouteMetaTags } from "@/router/route-meta";

const LoginPage = lazy(() => import("@/pages/auth/login-page"));
const AnalyticsPage = lazy(() => import("@/pages/dashboard/analytics-page"));
const CategoriesPage = lazy(() => import("@/pages/dashboard/categories-page"));
const CommentsPage = lazy(() => import("@/pages/dashboard/comments-page"));
const CompaniesPage = lazy(() => import("@/pages/dashboard/companies-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard-page"));
const MyReviewsPage = lazy(() => import("@/pages/dashboard/my-reviews-page"));
const NotificationsPage = lazy(() => import("@/pages/dashboard/notifications-page"));
const OrdersPage = lazy(() => import("@/pages/dashboard/orders-page"));
const PostersPage = lazy(() => import("@/pages/dashboard/posters-page"));
const ProductsPage = lazy(() => import("@/pages/dashboard/products-page"));
const UsersPage = lazy(() => import("@/pages/dashboard/users-page"));

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <>
      <RouteMetaTags />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicOnlyRoute />}>
          <Route
            path="/login"
            element={
              <LazyRoute>
                <LoginPage />
              </LazyRoute>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardShell />}>
            <Route
              path="/dashboard"
              element={
                <LazyRoute>
                  <DashboardPage />
                </LazyRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <LazyRoute>
                  <AnalyticsPage />
                </LazyRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <LazyRoute>
                  <CategoriesPage />
                </LazyRoute>
              }
            />
            <Route
              path="/comments"
              element={
                <LazyRoute>
                  <CommentsPage />
                </LazyRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <LazyRoute>
                  <CompaniesPage />
                </LazyRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <LazyRoute>
                  <MyReviewsPage />
                </LazyRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <LazyRoute>
                  <NotificationsPage />
                </LazyRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <LazyRoute>
                  <OrdersPage />
                </LazyRoute>
              }
            />
            <Route
              path="/posters"
              element={
                <LazyRoute>
                  <PostersPage />
                </LazyRoute>
              }
            />
            <Route
              path="/products"
              element={
                <LazyRoute>
                  <ProductsPage />
                </LazyRoute>
              }
            />
            <Route
              path="/users"
              element={
                <LazyRoute>
                  <UsersPage />
                </LazyRoute>
              }
            />
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
