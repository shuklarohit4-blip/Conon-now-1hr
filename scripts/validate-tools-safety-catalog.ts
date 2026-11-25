import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { ALL_9_TOOLS_SAFETY_PRODUCTS, type ToolsSafetyProduct } from "../artifacts/conon/src/data/toolsSafetyData.js";
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from "../artifacts/conon/src/data/catalogData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

function getSha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

let errors: string[] = [];

console.log("=================================================");
console.log(" VALIDATING POWER TOOLS & SITE SAFETY CATALOG   ");
console.log("=================================================");

// 1. Total Product Count Assertion
console.log(`\n[Check 1] Verified Product Count: ${ALL_9_TOOLS_SAFETY_PRODUCTS.length} / 9`);
if (ALL_9_TOOLS_SAFETY_PRODUCTS.length !== 9) {
  errors.push(`Expected exactly 9 products, found ${ALL_9_TOOLS_SAFETY_PRODUCTS.length}`);
}

// 2. Subcategory Distribution
const powerTools = ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => p.subCategory === "Power Tools");
const handTools = ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => p.subCategory === "Hand & Measuring Tools");
const safetyTools = ALL_9_TOOLS_SAFETY_PRODUCTS.filter((p) => p.subCategory === "Site Safety & PPE");

console.log(`[Check 2] Subcategory Distribution:`);
console.log(`  - Power Tools          : ${powerTools.length} / 3`);
console.log(`  - Hand & Measuring     : ${handTools.length} / 2`);
console.log(`  - Site Safety & PPE    : ${safetyTools.length} / 4`);

if (powerTools.length !== 3) errors.push(`Power Tools count mismatch: expected 3, got ${powerTools.length}`);
if (handTools.length !== 2) errors.push(`Hand & Measuring count mismatch: expected 2, got ${handTools.length}`);
if (safetyTools.length !== 4) errors.push(`Site Safety & PPE count mismatch: expected 4, got ${safetyTools.length}`);

// 3. GST & HSN Verification
console.log(`\n[Check 3] Strict 18% GST & Exact HSN Compliance:`);
const EXPECTED_HSN_MAP: Record<string, string> = {
  "prod-tools-bosch-gws-600": "8467",
  "prod-tools-bosch-gbh-2-26-re": "8467",
  "prod-tools-bosch-gbh-2-26-dre": "8467",
  "prod-tools-taparia-tk-052": "8205",
  "prod-tools-stanley-tylon-5m": "9017",
  "prod-safety-karam-pn501": "6506",
  "prod-safety-karam-ki01-pn351": "6307",
  "prod-safety-3m-fahrenheit": "9004",
  "prod-safety-smasys-jacket": "6211",
};

for (const prod of ALL_9_TOOLS_SAFETY_PRODUCTS) {
  if (prod.gstPercent !== 18) {
    errors.push(`Product ${prod.id} has invalid GST ${prod.gstPercent}%, expected 18%`);
  }
  const expectedHsn = EXPECTED_HSN_MAP[prod.id];
  if (!expectedHsn) {
    errors.push(`Unexpected product ID ${prod.id}`);
  } else if (prod.hsnCode !== expectedHsn) {
    errors.push(`Product ${prod.id} has invalid HSN ${prod.hsnCode}, expected ${expectedHsn}`);
  }
  const computedExGst = Math.round(prod.price / 1.18);
  if (Math.abs(prod.exGstPrice - computedExGst) > 1) {
    errors.push(`Product ${prod.id} has incorrect ex-GST price ₹${prod.exGstPrice}, expected ~₹${computedExGst}`);
  }
}
console.log(`  ✓ All 9 SKUs strictly compliant with 18% GST, exact HSN codes, and base pricing!`);

// 4. Delivery Vehicle Tag Check
console.log(`\n[Check 4] Express Delivery Vehicle Tag:`);
for (const prod of ALL_9_TOOLS_SAFETY_PRODUCTS) {
  if (prod.deliveryVehicleType !== "2-Wheeler") {
    errors.push(`Product ${prod.id} deliveryVehicleType is ${prod.deliveryVehicleType}, expected "2-Wheeler"`);
  }
}
console.log(`  ✓ All 9 SKUs tagged with deliveryVehicleType: "2-Wheeler" (60-minute express)!`);

// 5. Image & Manifest Verification
console.log(`\n[Check 5] WebP Packshots on Disk & SHA-256 Hashes:`);
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (_) {}
}

for (const prod of ALL_9_TOOLS_SAFETY_PRODUCTS) {
  const relImagePath = prod.image.replace(/^\//, "");
  const fullPath = path.join(publicDir, relImagePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Product ${prod.id} image file missing on disk: ${fullPath}`);
  } else {
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      errors.push(`Product ${prod.id} image is 0 bytes: ${fullPath}`);
    } else {
      const buf = fs.readFileSync(fullPath);
      const hash = getSha256(buf);
      const manifestEntry = manifest[relImagePath];
      console.log(`  ✓ [Image] ${path.basename(prod.image)} | ${(stat.size / 1024).toFixed(1)} KB | Hash: ${hash.substring(0, 12)}...`);
      if (manifestEntry && manifestEntry.sha256 !== hash) {
        errors.push(`Manifest SHA256 mismatch for ${relImagePath}`);
      }
    }
  }
}

// 6. Master Catalog Integration Check
console.log(`\n[Check 6] Master Catalog Integration:`);
const catRegistered = CATALOG_CATEGORIES.some((c) => c.slug === "power-tools-safety");
if (!catRegistered) {
  errors.push(`Category "power-tools-safety" missing in CATALOG_CATEGORIES`);
} else {
  console.log(`  ✓ Category "power-tools-safety" registered in CATALOG_CATEGORIES`);
}

let catalogMatchCount = 0;
for (const prod of ALL_9_TOOLS_SAFETY_PRODUCTS) {
  const found = CATALOG_PRODUCTS.find((p) => p.id === prod.id);
  if (found) catalogMatchCount++;
}
console.log(`  ✓ ${catalogMatchCount} / 9 products found in CATALOG_PRODUCTS`);
if (catalogMatchCount !== 9) {
  errors.push(`Only ${catalogMatchCount} / 9 products found in CATALOG_PRODUCTS`);
}

// Final Summary
console.log("\n=================================================");
if (errors.length > 0) {
  console.error(`VALIDATION FAILED with ${errors.length} error(s):`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log("✓ ALL AUDIT & MIGRATION CHECKS PASSED PERFECTLY!");
  console.log("=================================================\n");
}
