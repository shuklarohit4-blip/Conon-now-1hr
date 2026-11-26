/**
 * Centralized Build-Time & Runtime Security Guard for CONON COMMAND OS
 *
 * In production web deployments (e.g. Netlify, public storefront):
 * - VITE_LOCAL_ADMIN is undefined or false.
 * - Rollup/Vite dead-code eliminates the entire admin chunk via tree-shaking.
 * - Admin routes, event listeners, keyboard shortcuts, and UI pills are 100% stripped.
 *
 * On local MacBook development:
 * - VITE_LOCAL_ADMIN='true' enables the Admin Command OS on port 5174.
 */

export const IS_LOCAL_ADMIN: boolean =
  Boolean(import.meta.env?.VITE_LOCAL_ADMIN === "true");

export const MAC_ADMIN_KEY: string =
  IS_LOCAL_ADMIN ? ((import.meta.env?.VITE_MAC_ADMIN_KEY as string) || "") : "";
