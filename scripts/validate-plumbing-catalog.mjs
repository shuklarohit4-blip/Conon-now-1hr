import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const tempJsonPath = path.join(rootDir, "scripts/plumbing-products-temp.json");
const storefrontPath = path.join(rootDir, "artifacts/conon/src/components/CPVCPlumbingStorefront.tsx");

console.log("=== STEP 6: Validating CPVC Plumbing & Overhead Tanks Catalog ===");

if (!fs.existsSync(tempJsonPath)) {
  console.error("FAIL: scripts/plumbing-products-temp.json not found!");
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(tempJsonPath, "utf8"));
console.log(`[PASS] Loaded ${products.length} products.`);

// 1. Total SKU count check
if (products.length !== 56) {
  console.error(`FAIL: Expected exactly 56 SKUs, found ${products.length}`);
  process.exit(1);
}
console.log("[PASS] Exactly 56 SKUs present.");

// 2. Subcategory distribution check
const expectedCounts = {
  "cpvc-pipes": 15,
  "upvc-pipes-fittings": 2,
  "swr-drainage-pipes": 4,
  "cpvc-fittings-valves": 16,
  "solvent-cements-adhesives": 4,
  "overhead-water-tanks": 15,
};

const subcatCounts = {};
for (const p of products) {
  subcatCounts[p.subcategory] = (subcatCounts[p.subcategory] || 0) + 1;
}

for (const [subcat, expected] of Object.entries(expectedCounts)) {
  const actual = subcatCounts[subcat] || 0;
  if (actual !== expected) {
    console.error(`FAIL: Subcategory ${subcat} expected ${expected} items, found ${actual}`);
    process.exit(1);
  }
}
console.log("[PASS] All 6 subcategories match required SKU allocations (15, 2, 4, 16, 4, 15).");

// 3. Image file existence check on disk
let missingImages = 0;
for (const p of products) {
  const relPath = p.image.startsWith("/") ? p.image.slice(1) : p.image;
  const fullPath = path.join(publicDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: Missing product image: ${fullPath} for SKU ${p.id}`);
    missingImages++;
  }
}

const subcatIcons = [
  "images/subcategories/cpvc-pipes-icon.webp",
  "images/subcategories/upvc-pipes-icon.webp",
  "images/subcategories/swr-drainage-icon.webp",
  "images/subcategories/cpvc-fittings-icon.webp",
  "images/subcategories/solvent-cements-icon.webp",
  "images/subcategories/overhead-tank-icon.webp",
];
for (const icon of subcatIcons) {
  const fullPath = path.join(publicDir, icon);
  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: Missing subcategory icon: ${fullPath}`);
    missingImages++;
  }
}

if (missingImages > 0) {
  console.error(`FAIL: Found ${missingImages} missing images.`);
  process.exit(1);
}
console.log("[PASS] 0 broken image paths on disk. All 56 product WebP images & 6 subcategory icons exist.");

// 4. Schema fields & mathematical consistency checks
const validPipeSystems = new Set(["CPVC", "UPVC", "SWR", "WATER_TANK", "ACCESSORY"]);
const validVehicleTypes = new Set(["2-Wheeler", "E-Loader", "3-Wheeler/Pickup"]);

for (const p of products) {
  if (!validPipeSystems.has(p.pipeSystem)) {
    console.error(`FAIL: Invalid pipeSystem '${p.pipeSystem}' in SKU ${p.id}`);
    process.exit(1);
  }
  if (!validVehicleTypes.has(p.deliveryVehicleType)) {
    console.error(`FAIL: Invalid deliveryVehicleType '${p.deliveryVehicleType}' in SKU ${p.id}`);
    process.exit(1);
  }
  if (p.gstPercent !== 18) {
    console.error(`FAIL: gstPercent must be 18 for SKU ${p.id}, got ${p.gstPercent}`);
    process.exit(1);
  }
  if (!p.oemModelCode || typeof p.oemModelCode !== "string") {
    console.error(`FAIL: Missing oemModelCode for SKU ${p.id}`);
    process.exit(1);
  }
  if (p.price >= p.mrp) {
    console.error(`FAIL: Price (₹${p.price}) must be less than MRP (₹${p.mrp}) for SKU ${p.id}`);
    process.exit(1);
  }
  const computedExGst = Math.round(p.price / 1.18);
  if (Math.abs(p.exGstPrice - computedExGst) > 2) {
    console.error(`FAIL: exGstPrice mismatch in SKU ${p.id}: expected ~${computedExGst}, got ${p.exGstPrice}`);
    process.exit(1);
  }
}
console.log("[PASS] Schema validation passed: pipeSystem, deliveryVehicleType, gstPercent (18%), and exGstPrice consistency.");

// 5. Price floor checks
for (const p of products) {
  // No 1000L tank < ₹3,800
  if (p.tankCapacityLiters === 1000 && p.price < 3800) {
    console.error(`FAIL: Price floor violation: 1000L tank SKU ${p.id} price ₹${p.price} < ₹3,800`);
    process.exit(1);
  }
  // No 5m 1" CPVC < ₹480
  if (p.pipeSystem === "CPVC" && p.nominalSize === '1" (25mm)' && p.pipeLengthMeters === 5 && p.price < 480) {
    console.error(`FAIL: Price floor violation: 5m 1" CPVC pipe SKU ${p.id} price ₹${p.price} < ₹480`);
    process.exit(1);
  }
}
console.log("[PASS] Price floor checks passed (no 1000L tank < ₹3,800; no 5m 1\" CPVC < ₹480).");

// 6. Delivery vehicle dispatch rule checks
for (const p of products) {
  if (p.pipeLengthMeters === 5 || p.pipeLengthMeters === 6 || p.tankCapacityLiters === 2000) {
    if (p.deliveryVehicleType !== "3-Wheeler/Pickup") {
      console.error(`FAIL: Heavy/long item ${p.id} must be 3-Wheeler/Pickup, got ${p.deliveryVehicleType}`);
      process.exit(1);
    }
  } else if (p.pipeLengthMeters === 3 || p.tankCapacityLiters === 500 || p.tankCapacityLiters === 1000) {
    if (p.deliveryVehicleType !== "E-Loader") {
      console.error(`FAIL: 3m pipe / 500-1000L tank ${p.id} must be E-Loader, got ${p.deliveryVehicleType}`);
      process.exit(1);
    }
  } else if (p.subcategory === "cpvc-fittings-valves" || p.subcategory === "solvent-cements-adhesives") {
    if (p.deliveryVehicleType !== "2-Wheeler") {
      console.error(`FAIL: Fitting/solvent ${p.id} must be 2-Wheeler, got ${p.deliveryVehicleType}`);
      process.exit(1);
    }
  }
}
console.log("[PASS] Vehicle dispatch logistics rules verified across all 56 SKUs.");

// 7. Verify Storefront Component
const storefrontCode = fs.readFileSync(storefrontPath, "utf8");
if (!storefrontCode.includes("PLUMBING_PRODUCTS") || !storefrontCode.includes("Plumber-Safe Compatibility")) {
  console.error("FAIL: CPVCPlumbingStorefront.tsx does not contain Plumber-Safe Compatibility engine!");
  process.exit(1);
}
if (!storefrontCode.includes("Tank Connection Kit")) {
  console.error("FAIL: CPVCPlumbingStorefront.tsx does not contain Tank Connection Kit!");
  process.exit(1);
}
console.log("[PASS] CPVCPlumbingStorefront.tsx contains Plumber-Safe compatibility warnings and 1-Click Tank Kit.");

console.log("\nALL 7 VALIDATION SUITES PASSED CLEANLY (100%)!\n");
