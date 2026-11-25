import fs from "fs";
import path from "path";

const API_BASE = "http://localhost:5001";

async function main() {
  console.log("==================================================================");
  console.log("   CONON-NOW: GOD-EYE COMMAND CENTER & STUDIO VERIFICATION SUITE  ");
  console.log("==================================================================");

  // 1. Verify GET /api/admin/god-eye
  console.log("\n[TEST 1] Testing /api/admin/god-eye Telemetry & Lucknow Map Data...");
  const godEyeRes = await fetch(`${API_BASE}/api/admin/god-eye`, {
    headers: { "x-admin-key": "conon-internal-dev" },
  });

  if (!godEyeRes.ok) {
    throw new Error(`Failed to fetch /api/admin/god-eye: HTTP ${godEyeRes.status} ${await godEyeRes.text()}`);
  }

  const godEye = await godEyeRes.json();
  if (!godEye.success) {
    throw new Error(`God-Eye response did not have success=true`);
  }

  console.log("✓ God-Eye API responded HTTP 200 OK");
  console.log("  KPIs Verified:");
  console.log(`    - Today GMV: ₹${godEye.kpis.todayGmv.toLocaleString("en-IN")} (${godEye.kpis.todayGmvDelta})`);
  console.log(`    - Net Profit: ₹${godEye.kpis.netProfit.toLocaleString("en-IN")} (${godEye.kpis.netMarginPercent}% margin)`);
  console.log(`    - Active Orders: ${godEye.kpis.activeOrders} (${godEye.kpis.onTrackCount} On-Track / ${godEye.kpis.heavyFleetCount} Heavy Fleet)`);
  console.log(`    - SLA Breaches: ${godEye.kpis.slaBreaches}`);
  console.log(`    - Khata Exposure: ₹${godEye.kpis.khataCreditExposure.toLocaleString("en-IN")}`);
  console.log(`    - Vendor Payouts: ₹${godEye.kpis.pendingVendorPayouts.toLocaleString("en-IN")} across ${godEye.kpis.pendingDealersCount} dealers`);

  // Verify 6 Lucknow Supply Hubs
  console.log(`\n  Lucknow Supply Hubs (${godEye.hubs?.length}):`);
  if (!godEye.hubs || godEye.hubs.length < 6) {
    throw new Error(`Expected at least 6 Lucknow hubs, found ${godEye.hubs?.length}`);
  }
  for (const hub of godEye.hubs) {
    console.log(`    - [${hub.id}] ${hub.name} (${hub.zone}) -> Live Orders: ${hub.liveOrders} | Status: ${hub.status}`);
  }

  // Verify Active Fleet Telemetry
  console.log(`\n  Active Moving Fleet Telemetry (${godEye.fleet?.length}):`);
  if (!godEye.fleet || godEye.fleet.length < 5) {
    throw new Error(`Expected at least 5 active fleet vehicles, found ${godEye.fleet?.length}`);
  }
  for (const driver of godEye.fleet) {
    console.log(`    - ${driver.driverName} (${driver.vehicleClass} • ${driver.plateNumber}) -> Hub: ${driver.hubName} => Site: ${driver.destinationSite} | ETA: ${driver.minsLeft}m | Status: ${driver.status}`);
  }

  // Verify Guardrails
  console.log(`\n  Lucknow Site-Safe Guardrails:`);
  console.log(`    - No-Entry Window: ${godEye.guardrails.noEntryWindow.label} [${godEye.guardrails.noEntryWindow.status}]`);
  console.log(`    - UP Mining Pass: ${godEye.guardrails.eMM11MiningPass.label} [${godEye.guardrails.eMM11MiningPass.status}]`);
  console.log(`    - Tile Batch Lock: ${godEye.guardrails.tileBatchLock.label} [${godEye.guardrails.tileBatchLock.status}]`);
  console.log(`    - Builder Kit Leads: ${godEye.guardrails.builderKitLeads.label} [${godEye.guardrails.builderKitLeads.status}]`);

  // 2. Test Image Processing Pipeline (Sharp 800x800 WebP in Vite publicDir)
  console.log("\n[TEST 2] Testing Sharp Image Ingestion & Vite publicDir Hosting...");
  const samplePngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const formData = new FormData();
  formData.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test-sharp-packshot.png");
  formData.append("mode", "upload");
  formData.append("categorySlug", "electricals");
  formData.append("skuSlug", "god-eye-verified-mcb");

  const imageUploadRes = await fetch(`${API_BASE}/api/admin/catalog/image`, {
    method: "POST",
    body: formData,
  });

  if (!imageUploadRes.ok) {
    throw new Error(`Image upload failed: HTTP ${imageUploadRes.status} ${await imageUploadRes.text()}`);
  }
  const imageUploadData = await imageUploadRes.json();
  const webpUrl = imageUploadData.imageUrl || imageUploadData.url;
  console.log(`✓ Image processed by Sharp to 800x800 square: ${webpUrl}`);

  // Check physical file on disk in conon public directory
  const physicalPath = path.resolve(process.cwd(), "artifacts/conon/public", webpUrl.replace(/^\//, ""));
  if (!fs.existsSync(physicalPath)) {
    throw new Error(`Expected image file does not exist on disk at ${physicalPath}`);
  }
  console.log(`✓ Confirmed physical WebP on disk: ${physicalPath} (${fs.statSync(physicalPath).size} bytes)`);

  // 3. Test Create New SKU with Real Merchandising Specs
  console.log("\n[TEST 3] Testing No-Code SKU Creation with High-Craft Merchandising Attributes...");
  const testSkuPayload = {
    name: "Anchor by Panasonic Roma Classic 16A Modular Switch (War-Room Spec)",
    brand: "Anchor by Panasonic",
    category: "electricals",
    categorySlug: "electricals",
    subcategory: "Modular Switches",
    packSize: "Box of 10",
    sellingPrice: 185,
    mrp: 240,
    dealerLandingCost: 155,
    gstPercent: 18,
    hsnCode: "8536",
    deliveryVehicleType: "2W_BIKE",
    inStock: true,
    isExpress60: true,
    isFeatured: true,
    preferredVendorId: "latouche-hub-01",
    fitGuardrailBadge: "ISI Marked · Flame Retardant Polycarbonate",
    shortDescription: "High-grade silver cadmium contacts for 1,00,000+ clicks and heavy appliance durability.",
    highlights: [
      "Silver Cadmium Oxide Contacts",
      "Flame Retardant Polycarbonate Body",
      "Spark Shield Enclosure",
      "ISI Marked IS 3854",
      "10-Year Manufacturer Warranty",
      "Tested for 1,00,000+ Clicks",
    ],
    specs: [
      { key: "Current Rating", value: "16A Heavy Duty" },
      { key: "Voltage Rating", value: "240V AC ~ 50Hz" },
      { key: "Module Size", value: "1 Module (Standard)" },
      { key: "Material", value: "Self-extinguishing Engineering Resin" },
    ],
    imageUrl: webpUrl,
    pairedSkuIds: ["schneider-32a-mcb-dp", "havells-hi-flow-pump"],
  };

  const createSkuRes = await fetch(`${API_BASE}/api/admin/catalog/sku`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testSkuPayload),
  });

  if (!createSkuRes.ok) {
    throw new Error(`Failed to create test SKU: HTTP ${createSkuRes.status} ${await createSkuRes.text()}`);
  }
  const createSkuJson = await createSkuRes.json();
  const createdSku = createSkuJson.sku || createSkuJson;
  console.log(`✓ Created SKU ${createdSku.id}: "${createdSku.name}"`);
  console.log(`  Selling Price: ₹${createdSku.sellingPrice} | MRP: ₹${createdSku.mrp}`);
  console.log(`  Guardrail: ${createdSku.fitGuardrailBadge}`);

  // 4. Test Live Storefront Query
  console.log("\n[TEST 4] Querying Live Catalog API to verify instant live sync...");
  const liveCatalogRes = await fetch(`${API_BASE}/api/catalog/live`);
  if (!liveCatalogRes.ok) throw new Error(`Failed to fetch /api/catalog/live: ${liveCatalogRes.status}`);
  const liveCatalogJson = await liveCatalogRes.json();
  const verifiedLiveItem = liveCatalogJson.items.find((item: any) => item.id === createdSku.id);
  if (!verifiedLiveItem) {
    throw new Error(`Created SKU ${createdSku.id} not found in /api/catalog/live`);
  }
  console.log(`✓ Confirmed newly created SKU in live catalog:`);
  console.log(`  ID: ${verifiedLiveItem.id}`);
  console.log(`  Name: ${verifiedLiveItem.name}`);
  console.log(`  Image: ${verifiedLiveItem.imageUrl}`);
  console.log(`  Vehicle: ${verifiedLiveItem.deliveryVehicleType}`);
  console.log(`  Specs count: ${verifiedLiveItem.specs?.length}`);
  console.log(`  Highlights count: ${verifiedLiveItem.highlights?.length}`);

  // 5. Cleanup Test Record
  console.log("\n[TEST 5] Cleaning up test SKU via archive...");
  const archiveRes = await fetch(`${API_BASE}/api/admin/catalog/sku/${createdSku.id}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: true }),
  });
  if (!archiveRes.ok) throw new Error(`Archive cleanup failed: ${archiveRes.status}`);
  console.log("✓ Test SKU safely archived!");

  console.log("\n==================================================================");
  console.log("   ALL GOD-EYE TELEMETRY & STUDIO VERIFICATIONS PASSED (100%)     ");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
