import { closeDatabase, collection, connectDatabase, decimal, nextId } from "@workspace/db";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed demo data in production.");
}

const demoMaterials = [
  { externalId: "demo-cement-opc53", name: "OPC 53 Grade Cement", category: "cement", stage: "foundation", price: 410, unit: "bag", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-cement-ppc", name: "PPC Cement", category: "cement", stage: "foundation", price: 385, unit: "bag", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-tmt-fe500", name: "TMT Steel Bars Fe500", category: "steel", stage: "foundation", price: 68000, unit: "tonne", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-river-sand", name: "River Sand", category: "sand", stage: "foundation", price: 2800, unit: "tonne", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-stone-aggregate", name: "Stone Aggregate", category: "aggregate", stage: "foundation", price: 3200, unit: "tonne", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-red-bricks", name: "Red Clay Bricks", category: "bricks", stage: "walls", price: 9, unit: "piece", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-pvc-pipe", name: "PVC Pipes 4 inch", category: "plumbing", stage: "finishing", price: 540, unit: "piece", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-binding-wire", name: "Steel Binding Wire", category: "hardware", stage: "foundation", price: 95, unit: "kg", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
];

const demoMandiPrices = [
  { material: "Cement", unit: "bag", currentPrice: 410, previousPrice: 405, change: 5, changePercent: 1.23, trend: "up" },
  { material: "TMT Steel", unit: "tonne", currentPrice: 68000, previousPrice: 68500, change: -500, changePercent: -0.73, trend: "down" },
  { material: "River Sand", unit: "tonne", currentPrice: 2800, previousPrice: 2800, change: 0, changePercent: 0, trend: "stable" },
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

  console.log(`Local demo seed complete: ${materialsAdded} materials, ${pricesAdded} mandi prices added.`);
  console.log("Demo prices are illustrative only and are not live market quotes.");
} finally {
  await closeDatabase();
}
