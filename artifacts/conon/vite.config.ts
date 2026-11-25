import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production" || process.env.VITE_LOCAL_ADMIN === "false";
  const port = Number(process.env.VITE_PORT) || (!isProd && process.env.VITE_LOCAL_ADMIN === "true" ? 5174 : 5173);
  const basePath = process.env.BASE_PATH || "/";

  return {
    base: basePath,
    envDir: path.resolve(import.meta.dirname, "../.."),
    define: {
      "import.meta.env.VITE_LOCAL_ADMIN": JSON.stringify(isProd ? "false" : (process.env.VITE_LOCAL_ADMIN || "false")),
      "import.meta.env.VITE_MAC_ADMIN_KEY": JSON.stringify(isProd ? "" : (process.env.VITE_MAC_ADMIN_KEY || "")),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "src/assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("three")) {
                return "vendor-three";
              }
              if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) {
                return "vendor-charts";
              }
              if (id.includes("framer-motion")) {
                return "vendor-motion";
              }
              if (id.includes("firebase")) {
                return "vendor-firebase";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              if (
                id.includes("@radix-ui") ||
                id.includes("class-variance-authority") ||
                id.includes("clsx") ||
                id.includes("tailwind-merge")
              ) {
                return "vendor-ui";
              }
              if (id.includes("@tanstack")) {
                return "vendor-query";
              }
              if (/\/node_modules\/(react|react-dom|scheduler|wouter)\//.test(id)) {
                return "vendor-react";
              }
              return "vendor-core";
            }
          },
        },
      },
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        allow: [path.resolve(import.meta.dirname), path.resolve(import.meta.dirname, "../..")],
        deny: ["**/.*"],
      },
      proxy: {
        "/api": {
          target: (process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/api\/?$/, ""),
          changeOrigin: true,
          ws: true,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
