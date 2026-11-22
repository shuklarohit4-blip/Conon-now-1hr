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

const FALLBACK_MATERIALS = [
  { id: "demo-cement-weatherplus", name: "UltraTech Weather Plus Cement 50kg", category: "cement", stage: "foundation", price: 380, unit: "bag", description: "Waterproofing OPC/PPC blend with dense particle packing.", inStock: true, imageUrl: "", vendor: "UltraTech Depot", deliveryTime: 60 },
  { id: "demo-cement-opc53", name: "OPC 53 Grade Cement", category: "cement", stage: "foundation", price: 410, unit: "bag", description: "High-early strength 53 grade cement for RCC slabs and pillars.", inStock: true, imageUrl: "", vendor: "CONON-NOW Supplier", deliveryTime: 60 },
  { id: "demo-cement-ppc", name: "PPC Cement", category: "cement", stage: "foundation", price: 385, unit: "bag", description: "Pozzolana cement engineered for plastering and long durability.", inStock: true, imageUrl: "", vendor: "CONON-NOW Supplier", deliveryTime: 60 },
  { id: "demo-tmt-fe500", name: "Tata Tiscon 550SD TMT Steel Bars", category: "steel", stage: "foundation", price: 62000, unit: "tonne", description: "Earthquake resistant Fe 550D primary steel with superior ductility.", inStock: true, imageUrl: "", vendor: "Tata Steel Yard", deliveryTime: 60 },
  { id: "demo-river-sand", name: "River Sand (Plaster Grade)", category: "sand", stage: "foundation", price: 1450, unit: "ton", description: "Screened silt-washed river sand for masonry and smooth plastering.", inStock: true, imageUrl: "", vendor: "CONON-NOW Sand Yard", deliveryTime: 60 },
  { id: "demo-stone-aggregate", name: "20mm Stone Aggregate (Gitti)", category: "aggregate", stage: "foundation", price: 3200, unit: "tonne", description: "Machine-crushed graded blue stone aggregate for structural concrete.", inStock: true, imageUrl: "", vendor: "CONON-NOW Quarry", deliveryTime: 60 },
  { id: "demo-red-bricks", name: "First Class Red Clay Bricks", category: "bricks", stage: "walls", price: 10, unit: "piece", description: "Kiln-fired table moulded red clay bricks with sharp edges.", inStock: true, imageUrl: "", vendor: "CONON-NOW Brickfield", deliveryTime: 60 },
  { id: "demo-flyash-bricks", name: "Fly Ash Bricks Standard", category: "bricks", stage: "walls", price: 7, unit: "piece", description: "High-compressive strength lightweight thermal fly ash bricks.", inStock: true, imageUrl: "", vendor: "CONON-NOW Brickfield", deliveryTime: 60 },
  { id: "demo-asian-apex", name: "Asian Paints Apex Weatherproof 20L", category: "paint", stage: "finishing", price: 6450, unit: "bucket", description: "Exterior emulsion with anti-algae silicone additives.", inStock: true, imageUrl: "", vendor: "Asian Paints Hub", deliveryTime: 60 },
  { id: "demo-kajaria-tiles", name: "Kajaria Vitrified Floor Tiles 600x600", category: "tiles", stage: "finishing", price: 1180, unit: "box", description: "Anti-skid high gloss vitrified tiles box of 4.", inStock: true, imageUrl: "", vendor: "Kajaria Galaxy", deliveryTime: 60 },
  { id: "demo-polycab-wire", name: "Polycab FR House Wire 1.5 sq.mm", category: "electrical", stage: "finishing", price: 1480, unit: "coil", description: "Flame retardant copper wire 90m coil BIS certified.", inStock: true, imageUrl: "", vendor: "Polycab Electric", deliveryTime: 60 },
  { id: "demo-astral-pipe", name: "Astral CPVC FlowGuard Pipe 1-Inch", category: "plumbing", stage: "finishing", price: 320, unit: "piece", description: "SDR 11 CPVC hot and cold pipe 3m length.", inStock: true, imageUrl: "", vendor: "Astral Pipes Depot", deliveryTime: 60 },
  { id: "demo-fevicol-sh", name: "Fevicol SH Synthetic Resin 50kg", category: "adhesives", stage: "finishing", price: 6800, unit: "drum", description: "D3 wood adhesive for joinery and laminate bonding.", inStock: true, imageUrl: "", vendor: "Pidilite Distributor", deliveryTime: 60 },
  { id: "demo-drfixit-pidifin", name: "Dr. Fixit Pidifin 2K Waterproofing 20kg", category: "waterproofing", stage: "finishing", price: 2200, unit: "kit", description: "2-component polymer elastomeric coating for terrace and tanks.", inStock: true, imageUrl: "", vendor: "Dr. Fixit Store", deliveryTime: 60 },
  { id: "demo-hettich-hinges", name: "Hettich Soft-Close Concealed Hinges", category: "hardware", stage: "finishing", price: 580, unit: "pack", description: "Nickel-plated silent damper 35mm cup hinges pack of 10.", inStock: true, imageUrl: "", vendor: "Hettich Hardware", deliveryTime: 60 },
  { id: "demo-bosch-drill", name: "Bosch GSB 550 Professional Impact Drill", category: "tools", stage: "finishing", price: 2450, unit: "kit", description: "550W powerful impact drill with 13mm chuck.", inStock: true, imageUrl: "", vendor: "Bosch Tools Hub", deliveryTime: 60 },
];

router.get("/materials", async (req, res, next) => {
  try {
    const query = GetMaterialsQueryParams.parse(req.query);

    let materials;
    if (query.stage && query.stage !== "all") {
      materials = await collection("materials").find({ stage: query.stage }).toArray();
    } else {
      materials = await collection("materials").find().toArray();
    }

    if (materials.length === 0 && process.env.NODE_ENV !== "production") {
      const stage = query.stage && query.stage !== "all" ? query.stage : undefined;
      const fallback = stage ? FALLBACK_MATERIALS.filter((m) => m.stage === stage) : FALLBACK_MATERIALS;
      res.json(fallback);
      return;
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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      const query = GetMaterialsQueryParams.safeParse(req.query);
      const stage = query.success && query.data.stage !== "all" ? query.data.stage : undefined;
      const fallback = stage ? FALLBACK_MATERIALS.filter((m) => m.stage === stage) : FALLBACK_MATERIALS;
      res.json(fallback);
      return;
    }
    next(err);
  }
});

export default router;
