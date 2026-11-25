import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("🔍 CONON-NOW TILES, MARBLE & GRANITE CATALOG VALIDATION");
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
const jsonPath = path.resolve(rootDir, "scratch/all_42_tiles_stone_products.json");
const products: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

assertCheck("Total products count is exactly 42", products.length === 42, `Got ${products.length}`);

// 2. Subcategory Distribution Check
const subcatCounts: Record<string, number> = {};
const stoneSubcatCounts: Record<string, number> = {};
for (const p of products) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
  stoneSubcatCounts[p.stoneSubcategory] = (stoneSubcatCounts[p.stoneSubcategory] || 0) + 1;
}

assertCheck("Vitrified Floor Tiles has exactly 12 SKUs", subcatCounts["Vitrified Floor Tiles"] === 12, `Got ${subcatCounts["Vitrified Floor Tiles"]}`);
assertCheck("Ceramic Wall & Parking Tiles has exactly 6 SKUs", subcatCounts["Ceramic Wall & Parking Tiles"] === 6, `Got ${subcatCounts["Ceramic Wall & Parking Tiles"]}`);
assertCheck("Granite Slabs has exactly 7 SKUs", subcatCounts["Granite Slabs"] === 7, `Got ${subcatCounts["Granite Slabs"]}`);
assertCheck("Marble & Natural Stones has exactly 9 SKUs", subcatCounts["Marble & Natural Stones"] === 9, `Got ${subcatCounts["Marble & Natural Stones"]}`);
assertCheck("Grouts, Epoxy, Spacers & Cutting Tools has exactly 8 SKUs", subcatCounts["Grouts, Epoxy, Spacers & Cutting Tools"] === 8, `Got ${subcatCounts["Grouts, Epoxy, Spacers & Cutting Tools"]}`);

assertCheck("stoneSubcategory VITRIFIED_TILE has 12 items", stoneSubcatCounts["VITRIFIED_TILE"] === 12);
assertCheck("stoneSubcategory WALL_PARKING_TILE has 6 items", stoneSubcatCounts["WALL_PARKING_TILE"] === 6);
assertCheck("stoneSubcategory GRANITE_SLAB has 7 items", stoneSubcatCounts["GRANITE_SLAB"] === 7);
assertCheck("stoneSubcategory MARBLE_NATURAL_STONE has 9 items", stoneSubcatCounts["MARBLE_NATURAL_STONE"] === 9);
assertCheck("stoneSubcategory GROUT_AND_TOOLS has 8 items", stoneSubcatCounts["GROUT_AND_TOOLS"] === 8);

// 3. 2026 GST Split Verification
const fivePercentProducts = products.filter((p) => p.gstPercent === 5);
const eighteenPercentProducts = products.filter((p) => p.gstPercent === 18);

assertCheck("Exactly 1 product at 5% GST (SKU #32 Unpolished Kota Stone)", fivePercentProducts.length === 1 && fivePercentProducts[0].hsnCode === "2515" && fivePercentProducts[0].price === 26 && fivePercentProducts[0].exGstPrice === 25);
assertCheck("All other 41 products are at 18% GST", eighteenPercentProducts.length === 41);

// 4. Vehicle Routing Verification
const pickupProducts = products.filter((p) => p.deliveryVehicleType === "Pickup / Mini-Truck");
const twoWheelerProducts = products.filter((p) => p.deliveryVehicleType === "2-Wheeler");
const eLoaderPickupProducts = products.filter((p) => p.deliveryVehicleType === "E-Loader / Pickup");
const eLoaderProducts = products.filter((p) => p.deliveryVehicleType === "E-Loader");

assertCheck("All 16 Granite & Marble slabs routed to 'Pickup / Mini-Truck' for A-Frame transit", pickupProducts.length === 16);
assertCheck("All 8 Grouts & Tools routed to '2-Wheeler' for 60-min express", twoWheelerProducts.length === 8);
assertCheck("All 12 Vitrified Floor Tiles routed to 'E-Loader / Pickup'", eLoaderPickupProducts.length === 12);
assertCheck("All 6 Ceramic Wall & Parking Tiles routed to 'E-Loader'", eLoaderProducts.length === 6);

// 5. Box Coverage and Dual Price Math Verification
let tileMathValid = true;
let tileDetailsValid = true;
for (const p of products) {
  if (p.sellingUnit === "BOX") {
    if (!p.coverageSqFtPerBox || !p.piecesPerBox || !p.effectivePricePerSqFt) {
      tileDetailsValid = false;
    }
    const expectedRate = Math.round(p.price / p.coverageSqFtPerBox);
    if (Math.abs(expectedRate - p.effectivePricePerSqFt) > 1) {
      tileMathValid = false;
      console.error(`Rate mismatch on ${p.name}: expected ~${expectedRate}, got ${p.effectivePricePerSqFt}`);
    }
  }
}
assertCheck("All 18 Tile SKUs have valid piecesPerBox, coverageSqFtPerBox, and effectivePricePerSqFt", tileDetailsValid);
assertCheck("Dual rate effectivePricePerSqFt accurately matches Math.round(price / coverageSqFtPerBox)", tileMathValid);

// 6. Slab Minimum Order and Thickness Verification
let slabDetailsValid = true;
for (const p of products) {
  if (p.sellingUnit === "SQ_FT") {
    if (p.minOrderSqFt !== 25 || !p.thicknessMm) {
      slabDetailsValid = false;
      console.error(`Slab invalid: ${p.name}, minOrder: ${p.minOrderSqFt}, thickness: ${p.thicknessMm}`);
    }
  }
}
assertCheck("All 16 Natural Stone Slabs have minOrderSqFt: 25 and calibrated thicknessMm", slabDetailsValid);

// 7. Verify Local WebP Image Paths on Disk
const publicDir = path.resolve(rootDir, "artifacts/conon/public");
let missingImages = 0;
for (const p of products) {
  const imgPath = path.resolve(publicDir, p.image.slice(1));
  if (!fs.existsSync(imgPath)) {
    missingImages++;
    console.error(`Missing image on disk: ${p.image}`);
  }
}
assertCheck(`All 42 WebP packshots exist on disk (${42 - missingImages}/42 present)`, missingImages === 0);

// 8. Verify Catalog in catalogData.ts
const catDataPath = path.resolve(rootDir, "artifacts/conon/src/data/catalogData.ts");
const catContent = fs.readFileSync(catDataPath, "utf-8");
assertCheck("Catalog data contains category 12 'Tiles, Marble & Granite'", catContent.includes('"catId": 12') && catContent.includes('"title": "Tiles, Marble & Granite"'));
assertCheck("Catalog data contains Kajaria Zion Marfil GVT", catContent.includes("Kajaria Eternity Zion Marfil GVT"));
assertCheck("Catalog data contains South Indian Black Galaxy Slab", catContent.includes("Black Galaxy Polished Granite Slab 18mm"));
assertCheck("Catalog data contains Kota Grey Unpolished 5% GST", catContent.includes("Kota Grey Unpolished/Cut Flooring Stone 22x22 in") && catContent.includes('"hsnCode": "2515"'));

console.log("\n=======================================================");
console.log(`📊 VALIDATION SUMMARY: ${passedChecks}/${totalChecks} CHECKS PASSED`);
if (passedChecks === totalChecks) {
  console.log("🎉 ALL TILES, MARBLE & GRANITE ARCHITECTURAL CHECKS PASSED!");
} else {
  console.log("⚠️ SOME CHECKS FAILED!");
}
console.log("=======================================================\n");
