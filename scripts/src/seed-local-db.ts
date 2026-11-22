import { closeDatabase, collection, connectDatabase, decimal, nextId } from "@workspace/db";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed demo data in production.");
}

const demoMaterials = [
  { externalId: "demo-cement-weatherplus", name: "UltraTech Weather Plus Cement 50kg", category: "cement", stage: "foundation", price: 380, unit: "bag", description: "Waterproofing OPC/PPC blend with dense particle packing.", vendor: "UltraTech Depot" },
  { externalId: "demo-cement-opc53", name: "OPC 53 Grade Cement", category: "cement", stage: "foundation", price: 410, unit: "bag", description: "High-early strength 53 grade cement for RCC slabs and pillars.", vendor: "CONON-NOW Supplier" },
  { externalId: "demo-cement-ppc", name: "PPC Cement", category: "cement", stage: "foundation", price: 385, unit: "bag", description: "Pozzolana cement engineered for plastering and long durability.", vendor: "CONON-NOW Supplier" },
  { externalId: "demo-tmt-fe500", name: "Tata Tiscon 550SD TMT Steel Bars", category: "steel", stage: "foundation", price: 62000, unit: "tonne", description: "Earthquake resistant Fe 550D primary steel with superior ductility.", vendor: "Tata Steel Yard" },
  { externalId: "demo-river-sand", name: "River Sand (Plaster Grade)", category: "sand", stage: "foundation", price: 1450, unit: "tonne", description: "Screened silt-washed river sand for masonry and smooth plastering.", vendor: "CONON-NOW Sand Yard" },
  { externalId: "demo-stone-aggregate", name: "20mm Stone Aggregate (Gitti)", category: "aggregate", stage: "foundation", price: 3200, unit: "tonne", description: "Machine-crushed graded blue stone aggregate for structural concrete.", vendor: "CONON-NOW Quarry" },
  { externalId: "demo-red-bricks", name: "First Class Red Clay Bricks", category: "bricks", stage: "walls", price: 10, unit: "piece", description: "Kiln-fired table moulded red clay bricks with sharp edges.", vendor: "CONON-NOW Brickfield" },
  { externalId: "demo-flyash-bricks", name: "Fly Ash Bricks Standard", category: "bricks", stage: "walls", price: 7, unit: "piece", description: "High-compressive strength lightweight thermal fly ash bricks.", vendor: "CONON-NOW Brickfield" },
  { externalId: "demo-asian-apex", name: "Asian Paints Apex Weatherproof 20L", category: "paint", stage: "finishing", price: 6450, unit: "bucket", description: "Exterior emulsion with anti-algae silicone additives.", vendor: "Asian Paints Hub" },
  { externalId: "demo-kajaria-tiles", name: "Kajaria Vitrified Floor Tiles 600x600", category: "tiles", stage: "finishing", price: 1180, unit: "box", description: "Anti-skid high gloss vitrified tiles box of 4.", vendor: "Kajaria Galaxy" },
  { externalId: "demo-polycab-wire", name: "Polycab FR House Wire 1.5 sq.mm", category: "electrical", stage: "finishing", price: 1480, unit: "coil", description: "Flame retardant copper wire 90m coil BIS certified.", vendor: "Polycab Electric" },
  { externalId: "demo-astral-pipe", name: "Astral CPVC FlowGuard Pipe 1-Inch", category: "plumbing", stage: "finishing", price: 320, unit: "piece", description: "SDR 11 CPVC hot and cold pipe 3m length.", vendor: "Astral Pipes Depot" },
  { externalId: "demo-fevicol-sh", name: "Fevicol SH Synthetic Resin 50kg", category: "adhesives", stage: "finishing", price: 6800, unit: "drum", description: "D3 wood adhesive for joinery and laminate bonding.", vendor: "Pidilite Distributor" },
  { externalId: "demo-drfixit-pidifin", name: "Dr. Fixit Pidifin 2K Waterproofing 20kg", category: "waterproofing", stage: "finishing", price: 2200, unit: "kit", description: "2-component polymer elastomeric coating for terrace and tanks.", vendor: "Dr. Fixit Store" },
  { externalId: "demo-hettich-hinges", name: "Hettich Soft-Close Concealed Hinges", category: "hardware", stage: "finishing", price: 580, unit: "pack", description: "Nickel-plated silent damper 35mm cup hinges pack of 10.", vendor: "Hettich Hardware" },
  { externalId: "demo-bosch-drill", name: "Bosch GSB 550 Professional Impact Drill", category: "tools", stage: "finishing", price: 2450, unit: "kit", description: "550W powerful impact drill with 13mm chuck.", vendor: "Bosch Tools Hub" },
];

const demoMandiPrices = [
  { material: "Cement", unit: "bag", currentPrice: 410, previousPrice: 405, change: 5, changePercent: 1.23, trend: "up" },
  { material: "TMT Steel", unit: "tonne", currentPrice: 68000, previousPrice: 68500, change: -500, changePercent: -0.73, trend: "down" },
  { material: "River Sand", unit: "tonne", currentPrice: 2800, previousPrice: 2800, change: 0, changePercent: 0, trend: "stable" },
];

const demoServices = [
  { externalId: "srv-foreman", type: "foreman", name: "Senior Site Foreman (Civil)", description: "Civil engineering supervision & layout planning.", ratePerDay: 1800, available: true, rating: 4.9, experience: 14 },
  { externalId: "srv-plumber", type: "plumber", name: "Master Plumber", description: "CPVC/UPVC pipe fitting, sanitaryware installation.", ratePerDay: 1050, available: true, rating: 4.7, experience: 10 },
  { externalId: "srv-electrician", type: "electrician", name: "Certified Electrician", description: "Concealed wiring, DB dressing, switchboards.", ratePerDay: 1100, available: true, rating: 4.9, experience: 8 },
  { externalId: "srv-fitter", type: "fitter", name: "Bar Bender & Steel Fitter", description: "TMT cutting, bending, rebar mesh & column cages.", ratePerDay: 1150, available: true, rating: 4.8, experience: 11 },
  { externalId: "srv-daily-labor", type: "daily_labor", name: "Construction Helper (Beldar)", description: "Material mixing, carrying, and site cleanup.", ratePerDay: 700, available: true, rating: 4.6, experience: 5 },
];

await connectDatabase();
try {
  const materials = collection("materials");
  let materialsAdded = 0;
  for (const row of demoMaterials) {
    const result = await materials.updateOne(
      { externalId: row.externalId },
      {
        $setOnInsert: {
          ...row,
          id: await nextId("materials"),
          price: decimal(row.price),
          inStock: true,
          imageUrl: null,
          deliveryTime: 60,
          dynamicPricingEnabled: false,
        },
      },
      { upsert: true },
    );
    materialsAdded += result.upsertedCount;
  }

  const prices = collection("mandiPrices");
  let pricesAdded = 0;
  for (const row of demoMandiPrices) {
    const result = await prices.updateOne(
      { material: row.material },
      {
        $setOnInsert: {
          ...row,
          id: await nextId("mandiPrices"),
          currentPrice: decimal(row.currentPrice),
          previousPrice: decimal(row.previousPrice),
          change: decimal(row.change),
          changePercent: decimal(row.changePercent),
          lastUpdated: new Date(),
        },
      },
      { upsert: true },
    );
    pricesAdded += result.upsertedCount;
  }

  const services = collection("services");
  let servicesAdded = 0;
  for (const row of demoServices) {
    const result = await services.updateOne(
      { externalId: row.externalId },
      {
        $setOnInsert: {
          ...row,
          id: await nextId("services"),
          ratePerDay: decimal(row.ratePerDay),
          rating: decimal(row.rating),
        },
      },
      { upsert: true },
    );
    servicesAdded += result.upsertedCount;
  }

  console.log(`Local demo seed complete: ${materialsAdded} materials, ${pricesAdded} mandi prices, ${servicesAdded} services added.`);
  console.log("Demo prices are illustrative only and are not live market quotes.");
} finally {
  await closeDatabase();
}
