import fs from "fs";
import path from "path";

/**
 * Robust repository root resolver that works regardless of whether the process
 * was started from the repo root or from artifacts/api-server.
 */
export function getRepoRootDir(): string {
  let cur = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(cur, "artifacts/conon/public"))) {
      return cur;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }

  // Fallback relative to current module location
  try {
    const metaCandidate = path.resolve(import.meta.dirname, "../../../");
    if (fs.existsSync(path.join(metaCandidate, "artifacts/conon/public"))) {
      return metaCandidate;
    }
  } catch {}

  return process.cwd();
}

export const REPO_ROOT = getRepoRootDir();
export const CONON_PUBLIC_DIR = path.resolve(REPO_ROOT, "artifacts/conon/public");
export const CONON_IMAGES_DIR = path.resolve(CONON_PUBLIC_DIR, "images");
export const CONON_PRODUCTS_IMAGES_DIR = path.resolve(CONON_IMAGES_DIR, "products");
export const POD_DIR = path.resolve(CONON_IMAGES_DIR, "pod");
export const ECOSYSTEM_STORE_PATH = path.resolve(REPO_ROOT, "artifacts/api-server/data/ecosystem-store.json");
export const UPLOADS_DIR = path.resolve(REPO_ROOT, "artifacts/api-server/uploads");
export const PRODUCTS_UPLOADS_DIR = path.resolve(UPLOADS_DIR, "products");
export const MEDIA_VAULT_STORE_PATH = path.resolve(REPO_ROOT, "artifacts/api-server/data/media-vault-overrides.json");

// Ensure required runtime directories exist
if (!fs.existsSync(POD_DIR)) {
  fs.mkdirSync(POD_DIR, { recursive: true });
}
if (!fs.existsSync(PRODUCTS_UPLOADS_DIR)) {
  fs.mkdirSync(PRODUCTS_UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(ECOSYSTEM_STORE_PATH))) {
  fs.mkdirSync(path.dirname(ECOSYSTEM_STORE_PATH), { recursive: true });
}
