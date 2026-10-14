import { Router, type IRouter } from "express";
import { db, mandiPricesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/mandi/prices", async (_req, res) => {
  const prices = await db.select().from(mandiPricesTable);

  res.json(
    prices.map((p) => ({
      material: p.material,
      unit: p.unit,
      currentPrice: parseFloat(p.currentPrice),
      previousPrice: parseFloat(p.previousPrice),
      change: parseFloat(p.change),
      changePercent: parseFloat(p.changePercent),
      trend: p.trend,
      lastUpdated: p.lastUpdated.toISOString(),
    }))
  );
});

export default router;
