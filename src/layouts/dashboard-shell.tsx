import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-4 lg:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
