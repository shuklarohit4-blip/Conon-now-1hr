#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const builtEntry = path.resolve(__dirname, "dist/scripts/seedAll.mjs");
if (!fs.existsSync(builtEntry)) {
  console.error("[seedAll.js] Missing dist/scripts/seedAll.mjs. Run `pnpm --filter @workspace/api-server build` first.");
  process.exit(1);
}

await import(pathToFileURL(builtEntry).href);
