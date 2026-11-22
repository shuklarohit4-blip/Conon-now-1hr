import { Router, type IRouter } from "express";
import { collection, decimalToNumber } from "@workspace/db";

const router: IRouter = Router();

const FALLBACK_MANDI = [
  { material: "Cement", unit: "bag", currentPrice: 410, previousPrice: 405, change: 5, changePercent: 1.23, trend: "up", lastUpdated: new Date().toISOString() },
  { material: "TMT Steel", unit: "tonne", currentPrice: 68000, previousPrice: 68500, change: -500, changePercent: -0.73, trend: "down", lastUpdated: new Date().toISOString() },
  { material: "River Sand", unit: "tonne", currentPrice: 2800, previousPrice: 2800, change: 0, changePercent: 0, trend: "stable", lastUpdated: new Date().toISOString() },
];

router.get("/mandi/prices", async (_req, res, next) => {
  try {
    const prices = await collection("mandiPrices").find().toArray();
    if (prices.length === 0 && process.env.NODE_ENV !== "production") {
      res.json(FALLBACK_MANDI);
      return;
    }

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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      res.json(FALLBACK_MANDI);
      return;
    }
    next(err);
  }
});

export default router;
