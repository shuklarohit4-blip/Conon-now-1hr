import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { ALL_38_KITCHEN_PRODUCTS } from "../artifacts/conon/src/data/kitchenSinksData.js";
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

function assert(condition: boolean, msg: string) {
  if (!condition) {
    errors.push(msg);
    console.error(`❌ FAIL: ${msg}`);
  } else {
    console.log(`✓ PASS: ${msg}`);
  }
}

console.log("================================================================================");
console.log(" CONON-NOW: KITCHEN SINKS & FAUCETS 38-SKU CATALOG VALIDATION SUITE            ");
console.log("================================================================================");

// 1. Total Count Verification
assert(ALL_38_KITCHEN_PRODUCTS.length === 38, `ALL_38_KITCHEN_PRODUCTS length is ${ALL_38_KITCHEN_PRODUCTS.length}, expected 38`);

const catalogProducts = CATALOG_PRODUCTS.filter((p) => p.categorySlug === "kitchen-sinks-faucets");
assert(catalogProducts.length === 38, `CATALOG_PRODUCTS with slug 'kitchen-sinks-faucets' is ${catalogProducts.length}, expected 38`);

// 2. Subcategory Count Breakdown
const expectedSubcats: Record<string, number> = {
  "SS Pressed Sinks": 9,
  "Handmade SS Sinks": 6,
  "Quartz Sinks": 4,
  "Kitchen Sink Cocks": 11,
  "Sink Mixers & Pull-Out Faucets": 4,
  "Sink Accessories & RO Add-Ons": 4,
};

const subcatCounts: Record<string, number> = {};
for (const p of ALL_38_KITCHEN_PRODUCTS) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
}

for (const [subcat, count] of Object.entries(expectedSubcats)) {
  assert(subcatCounts[subcat] === count, `Subcategory '${subcat}' count is ${subcatCounts[subcat]}, expected ${count}`);
}

// 3. Category Metadata Verification
const cat = CATALOG_CATEGORIES.find((c) => c.slug === "kitchen-sinks-faucets");
assert(!!cat, "Category 'kitchen-sinks-faucets' exists in CATALOG_CATEGORIES");
if (cat && cat.subcategories) {
  assert(cat.subcategories.length === 6, `Category subcategories count is ${cat.subcategories.length}, expected 6`);
}

// 4. GST & HSN Compliance
for (const p of ALL_38_KITCHEN_PRODUCTS) {
  assert(p.gstPercent === 18, `SKU ${p.id} has gstPercent ${p.gstPercent}, expected 18%`);
  const expectedExGst = Math.round(p.price / 1.18);
  assert(
    Math.abs(p.exGstPrice - expectedExGst) <= 1,
    `SKU ${p.id} exGstPrice is ${p.exGstPrice}, expected ~${expectedExGst}`
  );

  // HSN Check
  if (p.kitchenSubcategory === "SS_PRESSED_SINK" || p.kitchenSubcategory === "HANDMADE_SS_SINK") {
    assert(p.hsnCode === "7324", `SKU ${p.id} SS Sink HSN is ${p.hsnCode}, expected 7324`);
  } else if (p.kitchenSubcategory === "QUARTZ_SINK") {
    assert(p.hsnCode === "6810", `SKU ${p.id} Quartz Sink HSN is ${p.hsnCode}, expected 6810`);
  } else if (p.kitchenSubcategory === "SINK_COCK" || p.kitchenSubcategory === "SINK_MIXER_PULLOUT") {
    assert(p.hsnCode === "8481", `SKU ${p.id} Faucet HSN is ${p.hsnCode}, expected 8481`);
  } else if (p.id.includes("waste-pipe")) {
    assert(p.hsnCode === "3917", `SKU ${p.id} Waste Pipe HSN is ${p.hsnCode}, expected 3917`);
  } else if (p.id.includes("coupling") || p.id.includes("dispenser")) {
    assert(p.hsnCode === "7324", `SKU ${p.id} HSN is ${p.hsnCode}, expected 7324`);
  } else if (p.id.includes("ro-faucet")) {
    assert(p.hsnCode === "8481", `SKU ${p.id} RO Faucet HSN is ${p.hsnCode}, expected 8481`);
  }
}

// 5. Plumbing & Carpentry Guardrails Check
const sinks = ALL_38_KITCHEN_PRODUCTS.filter((p) =>
  ["SS_PRESSED_SINK", "HANDMADE_SS_SINK", "QUARTZ_SINK"].includes(p.kitchenSubcategory)
);
assert(sinks.length === 19, `Total sinks count is ${sinks.length}, expected 19`);

for (const s of sinks) {
  assert(
    typeof s.minCabinetWidthMm === "number" && [600, 700, 900, 1000].includes(s.minCabinetWidthMm),
    `Sink ${s.id} minCabinetWidthMm is ${s.minCabinetWidthMm}, expected 600, 700, 900, or 1000`
  );
  assert(
    s.deliveryVehicleType !== "2-Wheeler",
    `Sink ${s.id} vehicle is ${s.deliveryVehicleType}, MUST NOT be 2-Wheeler`
  );
}

const faucets = ALL_38_KITCHEN_PRODUCTS.filter((p) =>
  ["SINK_COCK", "SINK_MIXER_PULLOUT"].includes(p.kitchenSubcategory)
);
assert(faucets.length === 15, `Total faucets/mixers count is ${faucets.length}, expected 15`);

for (const f of faucets) {
  assert(
    f.mountType === "WALL_MOUNTED" || f.mountType === "TABLE_DECK_MOUNTED",
    `Faucet ${f.id} mountType is ${f.mountType}, expected WALL_MOUNTED or TABLE_DECK_MOUNTED`
  );
  assert(
    f.deliveryVehicleType === "2-Wheeler",
    `Faucet ${f.id} vehicle is ${f.deliveryVehicleType}, expected 2-Wheeler`
  );
}

const accessories = ALL_38_KITCHEN_PRODUCTS.filter(
  (p) => p.kitchenSubcategory === "SINK_ACCESSORY"
);
assert(accessories.length === 4, `Accessories count is ${accessories.length}, expected 4`);
for (const a of accessories) {
  assert(
    a.deliveryVehicleType === "2-Wheeler",
    `Accessory ${a.id} vehicle is ${a.deliveryVehicleType}, expected 2-Wheeler`
  );
}

// 6. Image & Manifest File Verification
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

for (const p of ALL_38_KITCHEN_PRODUCTS) {
  const filePath = path.join(publicDir, p.image.replace(/^\//, ""));
  assert(fs.existsSync(filePath), `Image file exists on disk: ${filePath}`);

  const relKey = p.image.replace(/^\//, "");
  const manifestEntry = manifest[relKey];
  assert(!!manifestEntry, `Manifest entry exists for: ${relKey}`);

  if (fs.existsSync(filePath) && manifestEntry) {
    const fileBuf = fs.readFileSync(filePath);
    const hash = getSha256(fileBuf);
    assert(hash === manifestEntry.sha256, `SHA-256 match for ${relKey}`);
  }
}

// Summary
console.log("\n================================================================================");
if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} errors!`);
  process.exit(1);
} else {
  console.log("SUCCESS: All 38 SKUs verified! 100% Tax, Plumbing, Fleet & Image Compliant!");
  console.log("================================================================================");
}
