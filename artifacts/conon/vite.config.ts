import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// On Replit, PORT and BASE_PATH are injected by the platform.
// Locally (VS Code / macOS), they are not set — fall back to safe defaults.
const port     = Number(process.env.PORT)     || 5173;
const basePath = process.env.BASE_PATH        || "/";

// Load Replit-specific plugins only when running inside a Repl.
const replitPlugins: import("vite").Plugin[] = [];
if (process.env.REPL_ID !== undefined) {
  try {
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    replitPlugins.push(runtimeErrorOverlay());
  } catch { /* not installed locally — skip */ }

  if (process.env.NODE_ENV !== "production") {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      replitPlugins.push(cartographer({ root: path.resolve(import.meta.dirname, "..") }));
    } catch { /* skip */ }

    try {
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      replitPlugins.push(devBanner());
    } catch { /* skip */ }
  }
}

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), ...replitPlugins],
  resolve: {
    alias: {
      "@":      path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root:  path.resolve(import.meta.dirname),
  build: {
    outDir:     path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,     // allow serving assets outside root (e.g. attached_assets)
      deny: ["**/.*"],
    },
    // Local-dev proxy: /api → backend on 5001 (avoids macOS AirPlay conflict on 5000)
    // On Replit, the reverse proxy handles this — the proxy block is ignored in production.
    proxy: process.env.REPL_ID
      ? undefined
      : {
          "/api": {
            target:      "http://localhost:5001",
            changeOrigin: true,
          },
        },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
