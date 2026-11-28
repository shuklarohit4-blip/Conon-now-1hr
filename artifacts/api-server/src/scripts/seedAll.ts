import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Ensure .env from monorepo root is loaded when invoked standalone or from any cwd
dotenv.config({ path: path.resolve(__dirname, "../../../../.env"), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

import { closeDatabase, pool } from "@workspace/db";
import { catalogSyncService } from "../services/catalogSyncService";

export async function runSeedAll() {
  const result = await catalogSyncService.seedAll();
  const health = await catalogSyncService.getHybridDbHealth();
  console.log(JSON.stringify({ success: true, health, ...result }, null, 2));
  return { health, ...result };
}

runSeedAll()
  .then(async () => {
    await Promise.allSettled([closeDatabase(), pool.end()]);
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[seedAll] Failed:", err);
    await Promise.allSettled([closeDatabase(), pool.end()]);
    process.exit(1);
  });
