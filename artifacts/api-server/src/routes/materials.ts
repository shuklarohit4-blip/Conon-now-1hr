import { Router, type IRouter } from "express";
import { collection, decimalToNumber } from "@workspace/db";
import { GetMaterialsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

// The web client renders every material image from a LOCAL asset map
// (resolveProductImage), so the API never supplies a remote image URL — that
// avoids deprecated/hallucinated stock URLs ever reaching the UI. We pass
// through any genuine stored imageUrl and otherwise leave it empty; the client
// then resolves a bulletproof local product photo.
function resolveImage(existing: string | null | undefined) {
  const url = existing?.trim() ?? "";
  // Never surface a REMOTE url: a stale/hallucinated stock-photo host can HANG
  // forever without firing the <img> onError, leaving a permanently blank box.
  // The web client resolves a bulletproof LOCAL product photo from
  // category/name, so we pass through only local/relative paths and blank
  // anything remote (this also neutralises any legacy remote URLs in the DB).
  if (/^https?:\/\//i.test(url)) return "";
  return url;
}

router.get("/materials", async (req, res) => {
  const query = GetMaterialsQueryParams.parse(req.query);

  let materials;
  if (query.stage && query.stage !== "all") {
    materials = await collection("materials").find({ stage: query.stage }).toArray();
  } else {
    materials = await collection("materials").find().toArray();
  }

  res.json(
    materials.map((m) => ({
      id: m.externalId,
      name: m.name,
      category: m.category,
      stage: m.stage,
      price: decimalToNumber(m.price),
      unit: m.unit,
      description: m.description ?? "",
      inStock: m.inStock,
      imageUrl: resolveImage(m.imageUrl),
      vendor: m.vendor,
      deliveryTime: m.deliveryTime,
    }))
  );
});

export default router;
