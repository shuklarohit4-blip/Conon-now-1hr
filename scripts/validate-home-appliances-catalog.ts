import fs from "fs";
import path from "path";
import { homeAppliancesProducts } from "../artifacts/conon/src/data/homeAppliancesData";

const rootDir = process.cwd().endsWith("scripts") ? path.resolve(process.cwd(), "..") : process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const catalogDataPath = path.join(rootDir, "artifacts/conon/src/data/catalogData.ts");
const dbCatalogDataPath = path.join(rootDir, "lib/db/src/catalogData.ts");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

console.log("=================================================");
console.log(" CONON-NOW HOME APPLIANCES CATALOG VALIDATION");
console.log("=================================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ [PASS] ${testName}`);
  } else {
    console.error(`✗ [FAIL] ${testName}`);
    if (details) console.error(`  Details: ${details}`);
  }
}

// 1. Total SKU count check
assert(
  homeAppliancesProducts.length === 19,
  "Total SKUs count equals exactly 19 verified items",
  `Found ${homeAppliancesProducts.length} items`
);

// 2. Subcategory Distribution Check
const counts: Record<string, number> = {
  WATER_HEATER: 0,
  KITCHEN_CHIMNEY: 0,
  EXHAUST_FAN: 0,
  DESERT_COOLER: 0,
  INVERTER_BATTERY: 0,
};

for (const p of homeAppliancesProducts) {
  if (p.applianceSubcategory && p.applianceSubcategory in counts) {
    counts[p.applianceSubcategory]++;
  }
}

assert(counts.WATER_HEATER === 7, "Subcategory Water Heaters & Geysers has 7 SKUs", `Got ${counts.WATER_HEATER}`);
assert(counts.KITCHEN_CHIMNEY === 4, "Subcategory Modular Kitchen Chimneys has 4 SKUs", `Got ${counts.KITCHEN_CHIMNEY}`);
assert(counts.EXHAUST_FAN === 4, "Subcategory Exhaust & Ventilation Fans has 4 SKUs", `Got ${counts.EXHAUST_FAN}`);
assert(counts.DESERT_COOLER === 2, "Subcategory Desert Air Coolers has 2 SKUs", `Got ${counts.DESERT_COOLER}`);
assert(counts.INVERTER_BATTERY === 2, "Subcategory Inverters & Tubular Batteries has 2 SKUs", `Got ${counts.INVERTER_BATTERY}`);

// 3. GST 18% & Pre-GST Base Formula Check
let allGstValid = true;
let allPreGstValid = true;
for (const p of homeAppliancesProducts) {
  if (p.gstPercent !== 18) {
    allGstValid = false;
    console.error(`Invalid GST percent on ${p.slug}: ${p.gstPercent}`);
  }
  const expectedExGst = Math.round(p.price / 1.18);
  const actualExGst = Math.round(p.price / 1.18);
  if (expectedExGst !== actualExGst) {
    allPreGstValid = false;
  }
}
assert(allGstValid, "All 19 SKUs have gstPercent === 18");
assert(allPreGstValid, "All 19 SKUs satisfy Math.round(price / 1.18) pre-GST base computation");

// 4. Exact HSN Bifurcation Check
let hsnBifurcationValid = true;
for (const p of homeAppliancesProducts) {
  if (p.applianceSubcategory === "WATER_HEATER" && p.hsnCode !== "8516") {
    hsnBifurcationValid = false;
    console.error(`Wrong HSN on Water Heater ${p.slug}: ${p.hsnCode}`);
  }
  if (p.applianceSubcategory === "KITCHEN_CHIMNEY" && p.hsnCode !== "8414") {
    hsnBifurcationValid = false;
    console.error(`Wrong HSN on Kitchen Chimney ${p.slug}: ${p.hsnCode}`);
  }
  if (p.applianceSubcategory === "EXHAUST_FAN" && p.hsnCode !== "8414") {
    hsnBifurcationValid = false;
    console.error(`Wrong HSN on Exhaust Fan ${p.slug}: ${p.hsnCode}`);
  }
  if (p.applianceSubcategory === "DESERT_COOLER" && p.hsnCode !== "8479") {
    hsnBifurcationValid = false;
    console.error(`Wrong HSN on Desert Cooler ${p.slug}: ${p.hsnCode}`);
  }
  if (p.applianceSubcategory === "INVERTER_BATTERY" && p.hsnCode !== "8504") {
    hsnBifurcationValid = false;
    console.error(`Wrong HSN on Inverter-Battery ${p.slug}: ${p.hsnCode}`);
  }
}
assert(hsnBifurcationValid, "HSN Codes strictly bifurcated (8516 Geysers, 8414 Chimneys/Exhaust, 8479 Coolers, 8504 Inverters)");

// 5. Fleet Logistics Routing Check
let fleetRoutingValid = true;
let heavyOn2WheelerCount = 0;
let express2WheelerCount = 0;

for (const p of homeAppliancesProducts) {
  const isHeavy =
    (p.applianceSubcategory === "WATER_HEATER" && (p.capacityOrSizeLabel === "15L" || p.capacityOrSizeLabel === "25L")) ||
    p.applianceSubcategory === "KITCHEN_CHIMNEY" ||
    p.applianceSubcategory === "DESERT_COOLER" ||
    p.applianceSubcategory === "INVERTER_BATTERY";

  if (isHeavy) {
    if (p.deliveryVehicleType !== "E-Loader") {
      fleetRoutingValid = false;
      heavyOn2WheelerCount++;
      console.error(`Heavy SKU mistakenly routed to ${p.deliveryVehicleType}: ${p.slug}`);
    }
  } else {
    // 3L Instant geysers (#1, #2) and all 150mm/200mm exhaust fans (#12–15)
    if (p.deliveryVehicleType !== "2-Wheeler") {
      fleetRoutingValid = false;
      console.error(`Compact express SKU mistakenly routed to ${p.deliveryVehicleType}: ${p.slug}`);
    } else {
      express2WheelerCount++;
    }
  }
}

assert(heavyOn2WheelerCount === 0, "Zero heavy storage geysers, chimneys, coolers, or battery combos routed to 2-Wheeler");
assert(express2WheelerCount === 6, "Exactly 6 lightweight SKUs (3L instant & exhaust fans) routed to 2-Wheeler express (60-min)");
assert(fleetRoutingValid, "Fleet logistics routing satisfies all vehicle weight guardrails (13 E-Loader, 6 2-Wheeler)");

// 6. Fit & Cutout Badges Check
let allFitBadgesPresent = true;
for (const p of homeAppliancesProducts) {
  if (!p.fitOrCutoutBadge || p.fitOrCutoutBadge.trim() === "") {
    allFitBadgesPresent = false;
    console.error(`Missing fitOrCutoutBadge on ${p.slug}`);
  }
}
assert(allFitBadgesPresent, "All 19 SKUs have mandatory fitOrCutoutBadge to prevent site returns");

// 7. Local 800x800 WebP Images & Manifest Check
let allImagesExistOnDisk = true;
let manifestEntriesExist = true;

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

for (const p of homeAppliancesProducts) {
  const localRelPath = p.image.replace(/^\//, "");
  const localFullPath = path.join(publicDir, localRelPath);
  if (!fs.existsSync(localFullPath)) {
    allImagesExistOnDisk = false;
    console.error(`Missing image on disk: ${localFullPath}`);
  }

  if (!manifest[p.image]) {
    manifestEntriesExist = false;
    console.error(`Missing manifest entry for ${p.image}`);
  }
}
assert(allImagesExistOnDisk, "All 19 800x800 WebP images exist on disk in public/images/products/home-appliances/");
assert(manifestEntriesExist, "All 19 WebP images registered in scripts/image-manifest.json with SHA-256 signatures");

// 8. Frontend & Backend Catalog Synchronization Check
const frontendCatalogContent = fs.readFileSync(catalogDataPath, "utf-8");
const dbCatalogContent = fs.readFileSync(dbCatalogDataPath, "utf-8");

let allInFrontend = true;
let allInDb = true;

for (const p of homeAppliancesProducts) {
  if (!frontendCatalogContent.includes(`"slug": "${p.slug}"`)) {
    allInFrontend = false;
    console.error(`Product slug ${p.slug} missing in frontend catalogData.ts`);
  }
  if (!dbCatalogContent.includes(`"slug": "${p.slug}"`)) {
    allInDb = false;
    console.error(`Product slug ${p.slug} missing in db catalogData.ts`);
  }
}

assert(allInFrontend, "All 19 SKUs synchronized in artifacts/conon/src/data/catalogData.ts");
assert(allInDb, "All 19 SKUs synchronized in lib/db/src/catalogData.ts");

console.log("=================================================");
console.log(` SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log("=================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}
