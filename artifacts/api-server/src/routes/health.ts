import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { catalogSyncService } from "../services/catalogSyncService";

const router: IRouter = Router();

router.get("/health", async (_req, res) => {
  const dbHealth = await catalogSyncService.getHybridDbHealth();
  res.json({
    status: "ok",
    postgres: dbHealth.postgres,
    mongo: dbHealth.mongo,
    mode: dbHealth.mode,
    db: dbHealth.mongo,
  });
});

router.get("/healthz", async (_req, res) => {
  const dbHealth = await catalogSyncService.getHybridDbHealth();
  if (dbHealth.mongo !== "connected" && dbHealth.postgres !== "connected") {
    res.status(503).json({ status: "error", dependency: "database", ...dbHealth });
    return;
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, postgres: dbHealth.postgres, mongo: dbHealth.mongo });
});

export default router;
