import { db, materialsTable, mandiPricesTable, pool } from "@workspace/db";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed demo data in production.");
}

const demoMaterials = [
  { externalId: "demo-cement-opc53", name: "OPC 53 Grade Cement", category: "cement", stage: "foundation", price: "410.00", unit: "bag", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-cement-ppc", name: "PPC Cement", category: "cement", stage: "foundation", price: "385.00", unit: "bag", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-tmt-fe500", name: "TMT Steel Bars Fe500", category: "steel", stage: "foundation", price: "68000.00", unit: "tonne", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-river-sand", name: "River Sand", category: "sand", stage: "foundation", price: "2800.00", unit: "tonne", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-stone-aggregate", name: "Stone Aggregate", category: "aggregate", stage: "foundation", price: "3200.00", unit: "tonne", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-red-bricks", name: "Red Clay Bricks", category: "bricks", stage: "walls", price: "9.00", unit: "piece", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-pvc-pipe", name: "PVC Pipes 4 inch", category: "plumbing", stage: "finishing", price: "540.00", unit: "piece", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
  { externalId: "demo-binding-wire", name: "Steel Binding Wire", category: "hardware", stage: "foundation", price: "95.00", unit: "kg", description: "Illustrative local-demo price; confirm with your supplier.", vendor: "CONON Demo Supplier" },
];

const demoMandiPrices = [
  { material: "Cement", unit: "bag", currentPrice: "410.00", previousPrice: "405.00", change: "5.00", changePercent: "1.23", trend: "up" },
  { material: "TMT Steel", unit: "tonne", currentPrice: "68000.00", previousPrice: "68500.00", change: "-500.00", changePercent: "-0.73", trend: "down" },
  { material: "River Sand", unit: "tonne", currentPrice: "2800.00", previousPrice: "2800.00", change: "0.00", changePercent: "0.00", trend: "stable" },
];

try {
  const existingMaterials = await db.select({ externalId: materialsTable.externalId }).from(materialsTable);
  const materialIds = new Set(existingMaterials.map((row) => row.externalId));
  const missingMaterials = demoMaterials.filter((row) => !materialIds.has(row.externalId));

  if (missingMaterials.length > 0) {
    await db.insert(materialsTable).values(missingMaterials).onConflictDoNothing();
  }

  const existingPrices = await db.select({ material: mandiPricesTable.material }).from(mandiPricesTable);
  const priceMaterials = new Set(existingPrices.map((row) => row.material));
  const missingPrices = demoMandiPrices.filter((row) => !priceMaterials.has(row.material));

  if (missingPrices.length > 0) {
    await db.insert(mandiPricesTable).values(missingPrices);
  }

  console.log(`Local demo seed complete: ${missingMaterials.length} materials, ${missingPrices.length} mandi prices added.`);
  console.log("Demo prices are illustrative only and are not live market quotes.");
} finally {
  await pool.end();
}
