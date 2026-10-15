import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pingDatabase } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  if (!(await pingDatabase())) {
    res.status(503).json({ status: "error", dependency: "database" });
    return;
  }

  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
