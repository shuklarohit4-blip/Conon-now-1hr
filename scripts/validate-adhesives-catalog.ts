import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { ALL_45_ADHESIVES_PRODUCTS } from "../artifacts/conon/src/data/adhesivesData.js";
import { CATALOG_PRODUCTS } from "../artifacts/conon/src/data/catalogData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const imagesDir = path.join(publicDir, "images/products/fevicol-adhesives-sealants");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

function getSha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

let totalErrors = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    totalErrors++;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function runValidation() {
  console.log("================================================================================");
  console.log("  CONON-NOW: FEVICOL, ADHESIVES & SEALANTS CATALOG INTEGRITY AUDIT SUITE");
  console.log("================================================================================\n");

  // TEST 1: Exact SKU Count in Dataset & Catalog
  console.log("--- TEST 1: Product Count Audit ---");
  assert(
    ALL_45_ADHESIVES_PRODUCTS.length === 45,
    `adhesivesData.ts has exact 45 products (Found: ${ALL_45_ADHESIVES_PRODUCTS.length})`
  );

  const catalogAdhesiveProducts = CATALOG_PRODUCTS.filter(
    (p) => p.categorySlug === "fevicol-adhesives-sealants"
  );
  assert(
    catalogAdhesiveProducts.length === 45,
    `CATALOG_PRODUCTS has exact 45 adhesive products (Found: ${catalogAdhesiveProducts.length})`
  );

  // TEST 2: Subcategory Breakdown
  console.log("\n--- TEST 2: Subcategory Breakdown Audit ---");
  const subcatCounts: Record<string, number> = {};
  for (const p of ALL_45_ADHESIVES_PRODUCTS) {
    subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
  }
  assert(
    subcatCounts["Wood & Laminate Adhesives"] === 20,
    `Wood & Laminate Adhesives: expected 20 SKUs, got ${subcatCounts["Wood & Laminate Adhesives"]}`
  );
  assert(
    subcatCounts["Contact & Rubber Adhesives"] === 3,
    `Contact & Rubber Adhesives: expected 3 SKUs, got ${subcatCounts["Contact & Rubber Adhesives"]}`
  );
  assert(
    subcatCounts["Epoxy, Putty & Instant Repair"] === 10,
    `Epoxy, Putty & Instant Repair: expected 10 SKUs, got ${subcatCounts["Epoxy, Putty & Instant Repair"]}`
  );
  assert(
    subcatCounts["Silicone, PU Sealants & Foam"] === 8,
    `Silicone, PU Sealants & Foam: expected 8 SKUs, got ${subcatCounts["Silicone, PU Sealants & Foam"]}`
  );
  assert(
    subcatCounts["Applicator Guns & Masking Tapes"] === 4,
    `Applicator Guns & Masking Tapes: expected 4 SKUs, got ${subcatCounts["Applicator Guns & Masking Tapes"]}`
  );

  // TEST 3: 2026 GST & HSN Compliance (Strict 18%)
  console.log("\n--- TEST 3: 2026 GST & HSN Compliance Audit ---");
  let gst18Count = 0;
  let exGstMatchCount = 0;
  let validHsnCount = 0;

  const validHsns = new Set(["3506", "3214", "8205", "3919"]);

  for (const p of ALL_45_ADHESIVES_PRODUCTS) {
    if (p.gstPercent === 18) gst18Count++;
    const expectedExGst = Math.round(p.price / 1.18);
    if (Math.abs(p.exGstPrice - expectedExGst) <= 1) exGstMatchCount++;
    if (validHsns.has(p.hsnCode)) validHsnCount++;
  }

  assert(
    gst18Count === 45,
    `All 45 SKUs taxed at strict 18% GST (Passed: ${gst18Count}/45)`
  );
  assert(
    exGstMatchCount === 45,
    `All 45 SKUs have exact ex-GST base price Math.round(price / 1.18) within ±1 (Passed: ${exGstMatchCount}/45)`
  );
  assert(
    validHsnCount === 45,
    `All 45 SKUs have valid HSN codes (3506 / 3214 / 8205 / 3919) (Passed: ${validHsnCount}/45)`
  );

  // TEST 4: Volume Discount Rate Monotonicity
  console.log("\n--- TEST 4: Volume Discount Monotonicity Audit ---");
  // Fevicol SH: 50kg < 20kg < 5kg < 2kg < 1kg
  const sh1 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-sh-1kg")!;
  const sh2 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-sh-2kg")!;
  const sh5 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-sh-5kg")!;
  const sh20 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-sh-20kg")!;
  const sh50 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-sh-50kg")!;

  assert(
    sh50.effectiveUnitRate! < sh20.effectiveUnitRate! &&
      sh20.effectiveUnitRate! < sh5.effectiveUnitRate! &&
      sh5.effectiveUnitRate! < sh2.effectiveUnitRate! &&
      sh2.effectiveUnitRate! < sh1.effectiveUnitRate!,
    `Fevicol SH monotonic rate progression: 50kg (₹${sh50.effectiveUnitRate}) < 20kg (₹${sh20.effectiveUnitRate}) < 5kg (₹${sh5.effectiveUnitRate}) < 2kg (₹${sh2.effectiveUnitRate}) < 1kg (₹${sh1.effectiveUnitRate})`
  );

  // Fevicol Marine: 50kg < 20kg < 5kg < 2kg < 1kg
  const m1 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-marine-1kg")!;
  const m2 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-marine-2kg")!;
  const m5 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-marine-5kg")!;
  const m20 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-marine-20kg")!;
  const m50 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-fevicol-marine-50kg")!;

  assert(
    m50.effectiveUnitRate! < m20.effectiveUnitRate! &&
      m20.effectiveUnitRate! < m5.effectiveUnitRate! &&
      m5.effectiveUnitRate! < m2.effectiveUnitRate! &&
      m2.effectiveUnitRate! < m1.effectiveUnitRate!,
    `Fevicol Marine monotonic rate progression: 50kg (₹${m50.effectiveUnitRate}) < 20kg (₹${m20.effectiveUnitRate}) < 5kg (₹${m5.effectiveUnitRate}) < 2kg (₹${m2.effectiveUnitRate}) < 1kg (₹${m1.effectiveUnitRate})`
  );

  // Jivanjor: 50kg < 20kg < 1kg
  const j1 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-jivanjor-allrounder-1kg")!;
  const j20 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-jivanjor-allrounder-20kg")!;
  const j50 = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === "prod-adh-jivanjor-allrounder-50kg")!;

  assert(
    j50.effectiveUnitRate! < j20.effectiveUnitRate! &&
      j20.effectiveUnitRate! < j1.effectiveUnitRate!,
    `Jivanjor All Rounder monotonic rate: 50kg (₹${j50.effectiveUnitRate}) < 20kg (₹${j20.effectiveUnitRate}) < 1kg (₹${j1.effectiveUnitRate})`
  );

  // TEST 5: Fleet Routing & Vehicle Restrictions
  console.log("\n--- TEST 5: Fleet Routing & Weight Limit Audit ---");
  let heavyDrumsOnTwoWheeler = 0;
  let twoWheelerCount = 0;
  let heavyVehicleCount = 0;

  for (const p of ALL_45_ADHESIVES_PRODUCTS) {
    const isHeavy = p.name.includes("20 kg") || p.name.includes("50 kg");
    if (isHeavy && p.deliveryVehicleType === "2-Wheeler") {
      heavyDrumsOnTwoWheeler++;
    }
    if (p.deliveryVehicleType === "2-Wheeler") twoWheelerCount++;
    if (p.deliveryVehicleType === "E-Loader" || p.deliveryVehicleType === "E-Loader / Pickup") {
      heavyVehicleCount++;
    }
  }

  assert(
    heavyDrumsOnTwoWheeler === 0,
    `Zero 20kg or 50kg heavy drums dispatched on 2-Wheeler (Violations: ${heavyDrumsOnTwoWheeler})`
  );
  assert(
    twoWheelerCount === 38,
    `Expected 38 SKUs on 60-min 2-Wheeler express dispatch (Got: ${twoWheelerCount})`
  );
  assert(
    heavyVehicleCount === 7,
    `Expected 7 heavy drums (4x 20kg + 3x 50kg) on E-Loader / Pickup (Got: ${heavyVehicleCount})`
  );

  // TEST 6: WebP Images & Manifest Integrity
  console.log("\n--- TEST 6: WebP Assets & Manifest Integrity Audit ---");
  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {}
  }

  let existingImagesCount = 0;
  let hashMatchesCount = 0;

  for (const p of ALL_45_ADHESIVES_PRODUCTS) {
    const filename = path.basename(p.image);
    const diskPath = path.join(imagesDir, filename);
    if (fs.existsSync(diskPath)) {
      existingImagesCount++;
      const buf = fs.readFileSync(diskPath);
      const hash = getSha256(buf);
      const manifestKey = `images/products/fevicol-adhesives-sealants/${filename}`;
      if (manifest[manifestKey] && manifest[manifestKey].sha256 === hash) {
        hashMatchesCount++;
      }
    }
  }

  assert(
    existingImagesCount === 45,
    `All 45 WebP image files exist on disk in ${imagesDir} (Found: ${existingImagesCount}/45)`
  );
  assert(
    hashMatchesCount === 45,
    `All 45 WebP image hashes match manifest records in image-manifest.json (Matched: ${hashMatchesCount}/45)`
  );

  // TEST 7: Cross-Sell References Integrity
  console.log("\n--- TEST 7: Cross-Sell SKU References Audit ---");
  const allIds = new Set(ALL_45_ADHESIVES_PRODUCTS.map((p) => p.id));
  let brokenRefs = 0;
  for (const p of ALL_45_ADHESIVES_PRODUCTS) {
    for (const ref of p.crossSellSkus) {
      if (!allIds.has(ref)) {
        brokenRefs++;
        console.error(`  ❌ Broken cross-sell reference: ${p.id} -> ${ref}`);
      }
    }
  }
  assert(
    brokenRefs === 0,
    `All cross-sell references resolve to valid SKUs (Broken references: ${brokenRefs})`
  );

  // FINAL SUMMARY
  console.log("\n================================================================================");
  if (totalErrors === 0) {
    console.log("🎉 AUDIT PASSED: ALL 45 SKUS ARE 100% VERIFIED, ACCURATE & PRODUCTION-READY!");
  } else {
    console.error(`❌ AUDIT FAILED: Found ${totalErrors} issue(s) that must be resolved.`);
    process.exit(1);
  }
  console.log("================================================================================\n");
}

runValidation().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
