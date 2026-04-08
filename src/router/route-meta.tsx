import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";

type RouteMeta = {
  path: string;
  title: string;
  description: string;
};

const DEFAULT_META: RouteMeta = {
  path: "*",
  title: "Store Admin",
  description:
    "E-commerce admin dashboard for managing users, products, orders, reviews, and analytics.",
};

const ROUTE_META: RouteMeta[] = [
  { path: "/login", title: "Sign In", description: "Access the Store Admin dashboard securely." },
  {
    path: "/dashboard",
    title: "Dashboard",
    description: "Overview of users, products, orders, revenue, and recent activity.",
  },
  {
    path: "/analytics",
    title: "Analytics",
    description: "Review business performance, revenue trends, and top-selling products.",
  },
  {
    path: "/categories",
    title: "Categories",
    description: "Manage product categories and their images.",
  },
  {
    path: "/comments",
    title: "Comments",
    description: "Moderate product comments and ratings from customers.",
  },
  {
    path: "/companies",
    title: "Companies",
    description: "Manage company records and branding assets.",
  },
  {
    path: "/my-reviews",
    title: "My Reviews",
    description: "Review pending and submitted product reviews.",
  },
  {
    path: "/notifications",
    title: "Notifications",
    description: "Monitor and manage admin notifications.",
  },
  {
    path: "/orders",
    title: "Orders",
    description: "Track orders, update statuses, and inspect delivery details.",
  },
  {
    path: "/posters",
    title: "Posters",
    description: "Manage promotional posters and their click-through performance.",
  },
  {
    path: "/products",
    title: "Products",
    description: "Manage product details, pricing, discounts, stock, and images.",
  },
  {
    path: "/users",
    title: "Users",
    description: "Manage users, roles, access, and account status.",
  },
];

function getRouteMeta(pathname: string): RouteMeta {
  return (
    ROUTE_META.find((route) => matchPath({ path: route.path, end: true }, pathname)) ?? DEFAULT_META
  );
}

export function RouteMetaTags() {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname);
  const title = meta.title === DEFAULT_META.title ? meta.title : `${meta.title} | Store Admin`;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}${location.search}${location.hash}`
      : location.pathname;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Store Admin" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
}
