import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/lib": path.resolve(__dirname, "src/utils"),
      "@/messages": path.resolve(__dirname, "src/assets/messages"),
      "@/src": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts")) return "charts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n";
          if (
            id.includes("@tanstack") ||
            id.includes("axios") ||
            id.includes("zustand") ||
            id.includes("zod")
          ) {
            return "data";
          }
          if (
            id.includes("framer-motion") ||
            id.includes("lucide-react") ||
            id.includes("sonner") ||
            id.includes("next-themes")
          ) {
            return "ui-vendor";
          }
          return "vendor";
        },
      },
    },
  },
});
