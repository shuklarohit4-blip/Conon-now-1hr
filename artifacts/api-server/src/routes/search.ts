import { Router, type IRouter, type Request, type Response } from "express";
import { searchEngine } from "../services/searchEngine";
import { syncBus } from "../services/syncBus";
import { requireAdmin } from "../middleware/adminAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function setNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function broadcastSearchSync(summary: string, entityId?: string) {
  syncBus.publish({
    type: "SEARCH_UPDATED",
    entityId,
    action: "UPDATE",
    summary,
    socketEvent: "search:updated",
    socketPayload: { updatedAt: new Date().toISOString() },
  });
}

/* ── PUBLIC SEARCH ENDPOINTS ──────────────────────────────────────────────── */

router.get("/search/config", async (_req: Request, res: Response) => {
  try {
    setNoStore(res);
    const data = await searchEngine.getConfig();
    return res.json({ ok: true, success: true, ...data });
  } catch (err: any) {
    logger.error({ err }, "[Search API] Failed to load search config");
    return res.status(500).json({ ok: false, error: err?.message || "Failed loading search config" });
  }
});

router.get("/search/suggest", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const q = String(req.query.q || "");
    const suggestions = await searchEngine.suggest(q);
    return res.json({ ok: true, success: true, ...suggestions });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Autocomplete failed" });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const results = await searchEngine.search({
      q: typeof req.query.q === "string" ? req.query.q : "",
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      brand: typeof req.query.brand === "string" ? req.query.brand : undefined,
      sort: typeof req.query.sort === "string" ? req.query.sort : "relevance",
      inStock: req.query.inStock === "true" || req.query.inStock === "1",
      bulkOnly: req.query.bulkOnly === "true" || req.query.bulkOnly === "1",
      stage: typeof req.query.stage === "string" ? req.query.stage : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 60,
    });
    return res.json({ ok: true, success: true, ...results });
  } catch (err: any) {
    logger.error({ err }, "[Search API] Search failed");
    return res.status(500).json({ ok: false, error: err?.message || "Search failed" });
  }
});

router.post("/search/parse-list", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const text = String(req.body?.text || req.body?.list || "");
    if (!text.trim()) {
      return res.status(400).json({ ok: false, error: "Material list text is required" });
    }
    const parsed = await searchEngine.parseParchiList(text);
    return res.json({ ok: true, success: true, ...parsed });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Parchi parser failed" });
  }
});

router.post("/search/requests", async (req: Request, res: Response) => {
  try {
    const itemName = String(req.body?.itemName || "").trim();
    const quantityText = String(req.body?.quantityText || req.body?.qty || "1").trim();
    const phone = String(req.body?.phone || "").trim();
    const pincode = String(req.body?.pincode || "").trim();

    if (!itemName) {
      return res.status(400).json({ ok: false, error: "Item name is required" });
    }
    const created = await searchEngine.createSourcingRequest({
      itemName,
      quantityText,
      phone,
      pincode,
    });
    broadcastSearchSync(`New 60-min sourcing request: ${itemName}`, created.id);
    return res.status(201).json({ ok: true, success: true, request: created });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Failed submitting request" });
  }
});

/* ── ADMIN SEARCH STUDIO ENDPOINTS ────────────────────────────────────────── */

router.get("/admin/search/studio", requireAdmin, async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const days = Number(req.query.days) === 7 ? 7 : 30;
    const data = await searchEngine.getAdminStudioData(days);
    return res.json({ ok: true, success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Failed loading Search Studio" });
  }
});

router.put("/admin/search/config", requireAdmin, async (req: Request, res: Response) => {
  try {
    const config = await searchEngine.updateConfig(req.body || {});
    broadcastSearchSync("Updated Search Bar placeholders, trending pills & stage shortcuts");
    return res.json({ ok: true, success: true, config });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Failed updating search config" });
  }
});

router.post("/admin/search/synonyms", requireAdmin, async (req: Request, res: Response) => {
  try {
    const keywords = Array.isArray(req.body?.keywords)
      ? req.body.keywords
      : String(req.body?.keywords || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
    const mapsTo = String(req.body?.mapsTo || "").trim();
    if (!keywords.length || !mapsTo) {
      return res.status(400).json({ ok: false, error: "keywords and mapsTo are required" });
    }
    const rule = await searchEngine.upsertSynonym({
      keywords,
      mapsTo,
      categorySlug: req.body?.categorySlug,
      isActive: req.body?.isActive,
    });
    broadcastSearchSync(`Added search synonym: ${keywords.join(", ")} -> ${mapsTo}`, rule.id);
    return res.status(201).json({ ok: true, success: true, synonym: rule });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Failed saving synonym" });
  }
});

router.put("/admin/search/synonyms/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const keywords = Array.isArray(req.body?.keywords)
      ? req.body.keywords
      : String(req.body?.keywords || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
    const mapsTo = String(req.body?.mapsTo || "").trim();
    if (!id || !keywords.length || !mapsTo) {
      return res.status(400).json({ ok: false, error: "id, keywords, and mapsTo are required" });
    }
    const rule = await searchEngine.upsertSynonym({
      id,
      keywords,
      mapsTo,
      categorySlug: req.body?.categorySlug,
      isActive: req.body?.isActive,
    });
    broadcastSearchSync(`Updated search synonym: ${mapsTo}`, id);
    return res.json({ ok: true, success: true, synonym: rule });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message || "Failed updating synonym" });
  }
});

router.delete("/admin/search/synonyms/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const ok = await searchEngine.deleteSynonym(id);
    broadcastSearchSync(`Removed search synonym`, id);
    return res.json({ ok: true, success: ok });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Failed deleting synonym" });
  }
});

router.patch("/admin/search/requests/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const status = String(req.body?.status || "").toUpperCase();
    if (!["NEW", "CONTACTED", "ADDED_TO_CATALOG"].includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid request status" });
    }
    const updated = await searchEngine.updateSourcingRequestStatus(id, status as any);
    if (!updated) return res.status(404).json({ ok: false, error: "Request not found" });
    broadcastSearchSync(`Updated sourcing request "${updated.itemName}" -> ${status}`, id);
    return res.json({ ok: true, success: true, request: updated });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Failed updating request" });
  }
});

export default router;
