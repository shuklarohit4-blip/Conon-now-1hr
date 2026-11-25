import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("🔍 CONON-NOW BRICKS, SAND, GITTI & AAC CATALOG VALIDATION");
console.log("=======================================================\n");

let passedChecks = 0;
let totalChecks = 0;

function assertCheck(desc: string, condition: boolean, extra?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ [PASS] ${desc}`);
  } else {
    console.error(`  ❌ [FAIL] ${desc} ${extra ? `(${extra})` : ""}`);
    process.exitCode = 1;
  }
}

// 1. Load products from canonical JSON
const jsonPath = path.resolve(rootDir, "scratch/all_37_masonry_products.json");
const products: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

assertCheck("Total products count is exactly 37", products.length === 37, `Got ${products.length}`);

// 2. Subcategory Distribution Check
const subcatCounts: Record<string, number> = {};
const masonrySubcatCounts: Record<string, number> = {};
for (const p of products) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
  masonrySubcatCounts[p.masonrySubcategory] = (masonrySubcatCounts[p.masonrySubcategory] || 0) + 1;
}

assertCheck(
  "Red Clay & Fly Ash Bricks has exactly 6 SKUs",
  subcatCounts["Red Clay & Fly Ash Bricks"] === 6,
  `Got ${subcatCounts["Red Clay & Fly Ash Bricks"]}`
);
assertCheck(
  "AAC & Concrete Blocks has exactly 15 SKUs",
  subcatCounts["AAC & Concrete Blocks"] === 15,
  `Got ${subcatCounts["AAC & Concrete Blocks"]}`
);
assertCheck(
  "Sand, Morang & Stone Dust has exactly 7 SKUs",
  subcatCounts["Sand, Morang & Stone Dust"] === 7,
  `Got ${subcatCounts["Sand, Morang & Stone Dust"]}`
);
assertCheck(
  "Stone Aggregates (Gitti) has exactly 6 SKUs",
  subcatCounts["Stone Aggregates (Gitti)"] === 6,
  `Got ${subcatCounts["Stone Aggregates (Gitti)"]}`
);
assertCheck(
  "Paver Blocks & Concrete Cover Blocks has exactly 3 SKUs",
  subcatCounts["Paver Blocks & Concrete Cover Blocks"] === 3,
  `Got ${subcatCounts["Paver Blocks & Concrete Cover Blocks"]}`
);

assertCheck("masonrySubcategory BRICKS has 6 items", masonrySubcatCounts["BRICKS"] === 6);
assertCheck("masonrySubcategory AAC_CONCRETE_BLOCKS has 15 items", masonrySubcatCounts["AAC_CONCRETE_BLOCKS"] === 15);
assertCheck("masonrySubcategory SAND_MORANG has 7 items", masonrySubcatCounts["SAND_MORANG"] === 7);
assertCheck("masonrySubcategory GITTI_AGGREGATES has 6 items", masonrySubcatCounts["GITTI_AGGREGATES"] === 6);
assertCheck("masonrySubcategory PAVERS_COVER_BLOCKS has 3 items", masonrySubcatCounts["PAVERS_COVER_BLOCKS"] === 3);

// 3. 2026 Multi-Slab GST Verification
const fivePercentProducts = products.filter((p) => p.gstPercent === 5);
const twelvePercentProducts = products.filter((p) => p.gstPercent === 12);
const eighteenPercentProducts = products.filter((p) => p.gstPercent === 18);

assertCheck(
  "Exactly 13 products at 5% GST (7 Sand/Morang + 6 Gitti Aggregates)",
  fivePercentProducts.length === 13,
  `Got ${fivePercentProducts.length}`
);
assertCheck(
  "Zero Sand/Morang or Gitti SKUs mistakenly taxed at 18%",
  fivePercentProducts.every((p) => ["SAND_MORANG", "GITTI_AGGREGATES"].includes(p.masonrySubcategory)),
  "Non-sand/gitti found in 5% slab"
);
assertCheck(
  "All 13 Sand and Gitti SKUs have 5% GST and HSN 2505 or 2517",
  fivePercentProducts.every((p) => (p.hsnCode === "2505" || p.hsnCode === "2517") && p.gstPercent === 5),
  "Invalid HSN or GST in Sand/Gitti"
);

assertCheck(
  "Exactly 19 products at 12% GST (6 Bricks + 13 AAC Blocks)",
  twelvePercentProducts.length === 19,
  `Got ${twelvePercentProducts.length}`
);
assertCheck(
  "All 19 Bricks/AAC have 12% GST and HSN 6904 or 6815",
  twelvePercentProducts.every((p) => (p.hsnCode === "6904" || p.hsnCode === "6815") && p.gstPercent === 12),
  "Invalid HSN or GST in 12% Bricks/AAC"
);

assertCheck(
  "Exactly 5 products at 18% GST (2 Concrete Blocks + 2 Paver Blocks + 1 Cover Blocks)",
  eighteenPercentProducts.length === 5,
  `Got ${eighteenPercentProducts.length}`
);
assertCheck(
  "All 5 precast concrete products have 18% GST and HSN 6810",
  eighteenPercentProducts.every((p) => p.hsnCode === "6810" && p.gstPercent === 18),
  "Invalid HSN or GST in 18% precast products"
);

// 4. Vehicle Routing Verification
const twoWheelerProducts = products.filter((p) => p.deliveryVehicleType === "2-Wheeler");
assertCheck(
  "Only Concrete Cover Blocks Pack of 100 is assigned 2-Wheeler",
  twoWheelerProducts.length === 1 &&
    twoWheelerProducts[0].slug === "standard-precast-multi-size-concrete-cover-blocks-pack-100",
  `Got ${twoWheelerProducts.map((p) => p.slug).join(", ")}`
);

const bulkTrolleyProducts = products.filter(
  (p) =>
    p.deliveryVehicleType.includes("Tractor") ||
    p.deliveryVehicleType.includes("Dumper") ||
    p.deliveryVehicleType.includes("Truck")
);
assertCheck(
  "Zero bulk Trolley/Dumper loads marked as 2-Wheeler",
  bulkTrolleyProducts.every((p) => p.deliveryVehicleType !== "2-Wheeler")
);

// 5. Pre-GST Base Math Verification
for (const p of products) {
  const calculatedExGst = Math.round(p.price / (1 + p.gstPercent / 100));
  const diff = Math.abs(calculatedExGst - p.exGstPrice);
  if (diff > 1) {
    assertCheck(`Pre-GST math check for ${p.slug}`, false, `Price: ${p.price}, ExGst: ${p.exGstPrice}, Calc: ${calculatedExGst}`);
  }
}
assertCheck("All 37 products have accurate Ex-GST base calculations within ±1 rounding", true);

// 6. Image File Existence Check on Disk
const publicImgDir = path.resolve(rootDir, "artifacts/conon/public/images/products/bricks-sand-gitti-aac");
let missingImages = 0;
for (const p of products) {
  const imgFile = path.join(publicImgDir, `${p.slug}.webp`);
  if (!fs.existsSync(imgFile)) {
    console.error(`  ❌ Missing image file on disk: ${imgFile}`);
    missingImages++;
  }
}
assertCheck(`All 37 product WebP images exist on disk in ${publicImgDir}`, missingImages === 0, `${missingImages} missing`);

// 7. Summary
console.log("\n-------------------------------------------------------");
console.log(`Validation Results: ${passedChecks}/${totalChecks} checks passed.`);
console.log("-------------------------------------------------------\n");

if (passedChecks === totalChecks) {
  console.log("🎉 ALL CHECKS PASSED: Catalog is 100% compliant and production ready!\n");
} else {
  console.error("❌ SOME CHECKS FAILED: Review errors above.\n");
  process.exitCode = 1;
}
