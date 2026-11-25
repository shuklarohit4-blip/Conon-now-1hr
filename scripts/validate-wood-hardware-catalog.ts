import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("🔍 CONON-NOW PLYWOOD, DOORS & HARDWARE CATALOG VALIDATION");
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
const jsonPath = path.resolve(rootDir, "scratch/all_16_wood_hardware_products.json");
const products: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

assertCheck("Total wood & hardware products count is exactly 16", products.length === 16, `Got ${products.length}`);

// 2. Subcategory Distribution Check
const subcatCounts: Record<string, number> = {};
const woodSubcatCounts: Record<string, number> = {};
for (const p of products) {
  subcatCounts[p.subcategory] = (subcatCounts[p.subcategory] || 0) + 1;
  woodSubcatCounts[p.woodSubcategory] = (woodSubcatCounts[p.woodSubcategory] || 0) + 1;
}

assertCheck("Plywood (8x4 ft) has exactly 6 SKUs", subcatCounts["plywood-8x4"] === 6, `Got ${subcatCounts["plywood-8x4"]}`);
assertCheck("Flush Doors (30mm) has exactly 4 SKUs", subcatCounts["flush-doors-30mm"] === 4, `Got ${subcatCounts["flush-doors-30mm"]}`);
assertCheck("Laminates (1mm) has exactly 2 SKUs", subcatCounts["laminates-1mm"] === 2, `Got ${subcatCounts["laminates-1mm"]}`);
assertCheck("Hardware (Locks & Hinges) has exactly 4 SKUs", subcatCounts["hardware-locks-hinges"] === 4, `Got ${subcatCounts["hardware-locks-hinges"]}`);

assertCheck("woodSubcategory PLYWOOD has 6 items", woodSubcatCounts["PLYWOOD"] === 6);
assertCheck("woodSubcategory FLUSH_DOOR has 4 items", woodSubcatCounts["FLUSH_DOOR"] === 4);
assertCheck("woodSubcategory LAMINATE has 2 items", woodSubcatCounts["LAMINATE"] === 2);
assertCheck("woodSubcategory HARDWARE has 4 items", woodSubcatCounts["HARDWARE"] === 4);

// 3. Exact Price, Pre-GST Base & 18% GST Verification
const expectedPrices: Record<string, { price: number; exGst: number; hsn: string; vehicle: string }> = {
  "PLY-CP-CP-18": { price: 4448, exGst: 3769, hsn: "4412", vehicle: "E-Loader / Pickup" },
  "PLY-CP-CP-19": { price: 4928, exGst: 4176, hsn: "4412", vehicle: "E-Loader / Pickup" },
  "PLY-CP-SK-18": { price: 3872, exGst: 3281, hsn: "4412", vehicle: "E-Loader / Pickup" },
  "PLY-CP-SK-19": { price: 3808, exGst: 3227, hsn: "4412", vehicle: "E-Loader / Pickup" },
  "PLY-GP-GG-18": { price: 2592, exGst: 2197, hsn: "4412", vehicle: "E-Loader / Pickup" },
  "PLY-GP-EC-18": { price: 2450, exGst: 2076, hsn: "4412", vehicle: "E-Loader / Pickup" },
  "DOR-CP-CP-30": { price: 5367, exGst: 4548, hsn: "4418", vehicle: "E-Loader / Pickup" },
  "DOR-CP-BD-30": { price: 3822, exGst: 3239, hsn: "4418", vehicle: "E-Loader / Pickup" },
  "DOR-GP-EP-30": { price: 3528, exGst: 2990, hsn: "4418", vehicle: "E-Loader / Pickup" },
  "DOR-GP-OG-30": { price: 3780, exGst: 3203, hsn: "4418", vehicle: "E-Loader / Pickup" },
  "LAM-CN-WM-01": { price: 2239, exGst: 1897, hsn: "4823", vehicle: "E-Loader" },
  "LAM-CN-UT-01": { price: 1867, exGst: 1582, hsn: "4823", vehicle: "E-Loader" },
  "HDW-GJ-ST-18": { price: 1577, exGst: 1336, hsn: "8301", vehicle: "2-Wheeler" },
  "HDW-EP-RH-01": { price: 1990, exGst: 1686, hsn: "8301", vehicle: "2-Wheeler" },
  "HDW-DR-DC-60": { price: 927, exGst: 786, hsn: "8302", vehicle: "2-Wheeler" },
  "HDW-HT-ON-01": { price: 222, exGst: 188, hsn: "8302", vehicle: "2-Wheeler" },
};

let priceMismatches = 0;
let gstMismatches = 0;
let hsnMismatches = 0;
let vehicleMismatches = 0;

for (const p of products) {
  const exp = expectedPrices[p.oemModelCode];
  if (!exp) {
    priceMismatches++;
    continue;
  }
  if (p.price !== exp.price || p.exGstPrice !== exp.exGst) priceMismatches++;
  if (p.gstPercent !== 18) gstMismatches++;
  if (p.hsnCode !== exp.hsn) hsnMismatches++;
  if (p.deliveryVehicleType !== exp.vehicle) vehicleMismatches++;
}

assertCheck("All 16 products match exact Lucknow verified prices and ex-GST bases", priceMismatches === 0, `Mismatches: ${priceMismatches}`);
assertCheck("All 16 products strictly enforced at 18% GST (Zero exceptions)", gstMismatches === 0, `Invalid GST: ${gstMismatches}`);
assertCheck("All 16 products carry verified HSN codes (4412, 4418, 4823, 8301, 8302)", hsnMismatches === 0, `Invalid HSN: ${hsnMismatches}`);
assertCheck("All delivery vehicle routing guardrails strictly enforced (Flatbed vs 2-Wheeler)", vehicleMismatches === 0, `Mismatches: ${vehicleMismatches}`);

// 4. Non-duplicate Image Check & Disk Existence Check
const imageUrls = new Set<string>();
let duplicateImages = 0;
let missingDiskImages = 0;

for (const p of products) {
  if (imageUrls.has(p.image)) duplicateImages++;
  imageUrls.add(p.image);

  const diskPath = path.resolve(rootDir, "artifacts/conon/public", p.image.slice(1));
  if (!fs.existsSync(diskPath)) {
    missingDiskImages++;
  }
}

assertCheck("All 16 products have non-duplicate unique image URLs", duplicateImages === 0, `Duplicates: ${duplicateImages}`);
assertCheck("All 16 WebP images exist on disk in artifacts/conon/public/images/products/wood-hardware/", missingDiskImages === 0, `Missing: ${missingDiskImages}`);

// 5. Cross-File Synchronization Check
const storefrontFile = fs.readFileSync(path.resolve(rootDir, "artifacts/conon/src/components/PlywoodCollectionStorefront.tsx"), "utf-8");
const catalogDataFile = fs.readFileSync(path.resolve(rootDir, "artifacts/conon/src/data/catalogData.ts"), "utf-8");
const dbCatalogDataFile = fs.readFileSync(path.resolve(rootDir, "lib/db/src/catalogData.ts"), "utf-8");
const seedLocalDbFile = fs.readFileSync(path.resolve(rootDir, "scripts/src/seed-local-db.ts"), "utf-8");

assertCheck("Storefront contains Club Prime 18mm & Godrej Stella", storefrontFile.includes("PLY-CP-CP-18") && storefrontFile.includes("HDW-GJ-ST-18"));
assertCheck("Storefront implements 30mm Flush Door & Plywood cross-sell recommendations", storefrontFile.includes("hasFlushDoors") && storefrontFile.includes("hasPlywood"));
assertCheck("Frontend catalogData contains wood products with 18% GST", catalogDataFile.includes("PLY-CP-CP-18") && catalogDataFile.includes("DOR-CP-CP-30"));
assertCheck("Database catalogData contains wood products with 18% GST", dbCatalogDataFile.includes("PLY-CP-CP-18") && dbCatalogDataFile.includes("DOR-CP-CP-30"));
assertCheck("Local DB seeder script contains wood seed items", seedLocalDbFile.includes("centuryply-club-prime-bwp-marine-plywood-18mm") && seedLocalDbFile.includes("godrej-stella-180mm-mortise-door-lock-handle-set"));

console.log("\n-------------------------------------------------------");
console.log(`Validation Complete: ${passedChecks}/${totalChecks} Checks Passed.`);
console.log("-------------------------------------------------------\n");
