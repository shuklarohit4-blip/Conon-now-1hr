import { Router, type IRouter } from "express";
import { collection, decimalToNumber } from "@workspace/db";

const router: IRouter = Router();

router.get("/mandi/prices", async (_req, res) => {
  const prices = await collection("mandiPrices").find().toArray();

  res.json(
    prices.map((p) => ({
      material: p.material,
      unit: p.unit,
      currentPrice: decimalToNumber(p.currentPrice),
      previousPrice: decimalToNumber(p.previousPrice),
      change: decimalToNumber(p.change),
      changePercent: decimalToNumber(p.changePercent),
      trend: p.trend,
      lastUpdated: p.lastUpdated.toISOString(),
    }))
  );
});

export default router;
