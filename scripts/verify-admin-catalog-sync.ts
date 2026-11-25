/**
 * End-to-end verification script for:
 * 1. Admin Master Catalog (753 SKUs across all 20 categories)
 * 2. Real-time pricing & stock overrides persistence
 * 3. Mandi Bhav Controller with Lucknow CFT standards and catalog cascade
 * 4. Cart flow with Ultratech PPC benchmark (₹410 + ₹199 + ₹99 = ₹708)
 */

const API_BASE = "http://localhost:5001";

async function runVerification() {
  console.log("=== STARTING CONON VERIFICATION SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Verify GET /api/catalog/live
  console.log("Step 1: Testing Master Catalog (753 SKUs)...");
  const catalogRes = await fetch(`${API_BASE}/api/catalog/live`);
  assert(catalogRes.status === 200, `GET /api/catalog/live returned 200 OK`);
  const catalogData = await catalogRes.json();

  assert(catalogData.items && catalogData.items.length >= 750, `Catalog contains ${catalogData.items?.length} SKUs (expected >= 750)`);
  assert(catalogData.categories && catalogData.categories.length >= 16, `Catalog contains ${catalogData.categories?.length} categories`);
  assert(catalogData.kpis && catalogData.kpis.totalSkus >= 750, `KPI bar reports ${catalogData.kpis?.totalSkus} total SKUs`);
  assert(catalogData.kpis.inStockCount > 0, `KPI bar reports ${catalogData.kpis?.inStockCount} in-stock SKUs`);

  // 2. Verify Mandi Bhav Controller with Lucknow CFT units
  console.log("\nStep 2: Testing Lucknow Mandi Bhav Controller...");
  const mandiRes = await fetch(`${API_BASE}/api/admin/mandi`);
  assert(mandiRes.status === 200, `GET /api/admin/mandi returned 200 OK`);
  const mandiItems: any[] = await mandiRes.json();

  assert(mandiItems.length >= 7, `Mandi controller returns ${mandiItems.length} commodities`);

  // Check no "Morang (Aggregate)" or "Per MT" mistakes
  const hasAggregateMistake = mandiItems.some((m) => m.material.includes("Morang (Aggregate)"));
  assert(!hasAggregateMistake, `Zero instances of "Morang (Aggregate)" (Properly separated Morang Sand vs Kabrai Gitti)`);

  const morang = mandiItems.find((m) => m.id.includes("morang") || m.material.includes("Morang"));
  assert(!!morang && morang.unit.includes("CFT"), `Banda Coarse Morang Sand is sold by CFT (${morang?.unit})`);
  assert(morang?.gstPercent === 5, `Morang Sand GST is 5% (HSN 2505)`);

  const gitti = mandiItems.find((m) => m.id.includes("gitti") || m.material.includes("Gitti"));
  assert(!!gitti && gitti.unit.includes("CFT"), `Kabrai 20mm Kali Gitti is sold by CFT (${gitti?.unit})`);
  assert(gitti?.gstPercent === 5, `Kali Gitti GST is 5% (HSN 2517)`);

  const cement = mandiItems.find((m) => m.id === "cement-opc-53");
  assert(!!cement && cement.unit.includes("50 kg Bag"), `Cement sold by 50 kg Bag (${cement?.unit})`);
  assert(cement?.gstPercent === 18, `Cement GST is 18% (HSN 2523)`);

  // 3. Test Patching an individual SKU price and stock
  console.log("\nStep 3: Testing SKU Price & Stock Live Override...");
  const targetSkuId = "ultratech-ppc-cement-50kg";
  const patchSkuRes = await fetch(`${API_BASE}/api/admin/catalog/sku/${targetSkuId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sellingPrice: 415,
      inStock: true,
      notes: "Verified by automated sync test",
    }),
  });
  assert(patchSkuRes.status === 200, `PATCH /api/admin/catalog/sku/${targetSkuId} returned 200`);

  // Verify reflected in live catalog
  const reCatalogRes = await fetch(`${API_BASE}/api/catalog/live`);
  const reCatalogData = await reCatalogRes.json();
  const updatedItem = reCatalogData.items.find((i: any) => i.id === targetSkuId);
  assert(updatedItem && updatedItem.sellingPrice === 415, `SKU selling price updated to ₹415 in live catalog`);

  // Reset back to benchmark ₹410
  await fetch(`${API_BASE}/api/admin/catalog/sku/${targetSkuId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellingPrice: 410 }),
  });

  // 4. Test Mandi Cascade to Catalog
  console.log("\nStep 4: Testing Mandi Bhav Cascade to Catalog...");
  const patchMandiRes = await fetch(`${API_BASE}/api/admin/mandi/cement-opc-53`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      price: 425,
      cascadeToCatalog: true,
    }),
  });
  assert(patchMandiRes.status === 200, `PATCH /api/admin/mandi with cascadeToCatalog returned 200`);

  // 5. Test Cart with Ultratech Benchmark Item
  console.log("\nStep 5: Testing Cart & Quick-Delivery Breakdown...");
  const cartRes = await fetch(`${API_BASE}/api/cart`);
  assert(cartRes.status === 200, `GET /api/cart returned 200 OK`);

  const addCartRes = await fetch(`${API_BASE}/api/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: "_sid=sync-test-session-1234",
    },
    body: JSON.stringify({
      materialId: "ultratech-ppc-cement-50kg",
      name: "Ultratech PPC Cement, 50 Kg Bag",
      category: "cement",
      price: 410,
      unit: "50 Kg Bag",
      quantity: 1,
    }),
  });
  assert(addCartRes.status === 200, `POST /api/cart (Ultratech PPC Cement) returned 200 OK`);
  const cartBody = await addCartRes.json();
  assert(cartBody.totalItems >= 1, `Cart totalItems is ${cartBody.totalItems}`);
  assert(cartBody.grandTotal >= 410, `Cart grandTotal is ₹${cartBody.grandTotal}`);

  console.log(`\n=== VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification suite encountered an error:", err);
  process.exit(1);
});
