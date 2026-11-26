import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { cononMediaPlugin } from "./vite-plugin-conon-media";

export default defineConfig(({ command, mode }) => {
  const isProd = mode === "production" || process.env.VITE_LOCAL_ADMIN === "false";
  const isLocalAdmin = command === "serve" && !isProd && process.env.VITE_LOCAL_ADMIN === "true";
  const port = Number(process.env.VITE_PORT) || (!isProd && process.env.VITE_LOCAL_ADMIN === "true" ? 5174 : 5173);
  const basePath = process.env.BASE_PATH || "/";

  return {
    base: basePath,
    envDir: path.resolve(import.meta.dirname, "../.."),
    define: {
      "import.meta.env.VITE_LOCAL_ADMIN": JSON.stringify(isProd ? "false" : (process.env.VITE_LOCAL_ADMIN || "false")),
      "import.meta.env.VITE_MAC_ADMIN_KEY": JSON.stringify(isProd ? "" : (process.env.VITE_MAC_ADMIN_KEY || "")),
    },
    plugins: [react(), tailwindcss(), cononMediaPlugin({ isLocalAdmin })],
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
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("three")) return "vendor-three";
              if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) return "vendor-charts";
              if (id.includes("framer-motion")) return "vendor-motion";
              if (id.includes("firebase")) return "vendor-firebase";
              if (id.includes("lucide-react")) return "vendor-icons";
              if (id.includes("@radix-ui") || id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) return "vendor-ui";
              if (id.includes("@tanstack")) return "vendor-query";
              if (id.includes("socket.io-client") || id.includes("engine.io-client")) return "vendor-socket";
              if (id.includes("zod") || id.includes("react-hook-form") || id.includes("@hookform")) return "vendor-forms";
              if (id.includes("date-fns") || id.includes("dayjs") || id.includes("moment")) return "vendor-date";
              if (/\/node_modules\/(react|react-dom|scheduler|wouter)\//.test(id)) return "vendor-react";
              return "vendor-core";
            }
            // Split storefront collections into domain groups (keep each < 800 KB)
            if (id.includes("Paints") || id.includes("Tiles") || id.includes("Sanitary") || id.includes("Kitchen") || id.includes("Modular")) return "storefronts-interior";
            if (id.includes("Cement") || id.includes("Bricks") || id.includes("Plywood") || id.includes("CPVC") || id.includes("Fevicol")) return "storefronts-structure";
            if (id.includes("CCTV") || id.includes("Appliances") || id.includes("Lighting")) return "storefronts-smart";
            if (id.includes("SafetyCollection") || id.includes("PowerToolsSafety")) return "storefronts-safety";
            if (id.includes("Electrical")) return "storefronts-elec";
            if (id.includes("Furniture") || id.includes("Hinges") || id.includes("Door") || id.includes("Locks") || id.includes("Sinks")) return "storefronts-hardware";
            if (id.includes("CollectionStorefront") || id.includes("Storefront.tsx")) return "storefronts-misc";
            // Split admin-only code (tree-shaken in public build, but chunk helps dev mode)
            if (id.includes("/admin/") || id.includes("AdminMedia") || id.includes("CononCommandOS") || id.includes("adminMedia")) return "admin-studio";
            // Split services & rentals pages
            if (id.includes("Services.tsx") || id.includes("HeavyRentals.tsx") || id.includes("servicesRentals")) return "pages-services";
            // Split vendor & driver panels
            if (id.includes("/vendor/") || id.includes("/driver/") || id.includes("VendorDukaan") || id.includes("DriverCockpit")) return "panels-partner";
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
        "/uploads": {
          target: (process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/api\/?$/, ""),
          changeOrigin: true,
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
