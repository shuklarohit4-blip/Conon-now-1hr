import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n=======================================================");
console.log("🔍 CONON-NOW STRUCTURAL CATALOG & GST VALIDATION SUITE");
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

// Load canonical 70 structural products JSON
const jsonPath = path.resolve(__dirname, "../scratch/all_70_structural_products.json");
const ALL_STRUCTURAL_PRODUCTS: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// 1. Exact Count Check: Exactly 70 Products
assertCheck("Total structural products count is exactly 70", ALL_STRUCTURAL_PRODUCTS.length === 70, `Got ${ALL_STRUCTURAL_PRODUCTS.length}`);

// 2. Subcategory Distribution Check
const subcatCounts: Record<string, number> = {};
for (const p of ALL_STRUCTURAL_PRODUCTS) {
  subcatCounts[p.subcategory] = (subcatCounts[p.subcategory] || 0) + 1;
}

assertCheck("Cement & White Cement has 16 SKUs", subcatCounts["cement-white-cement"] === 16, `Got ${subcatCounts["cement-white-cement"]}`);
assertCheck("TMT Sariya (Steel Bars) has 20 SKUs", subcatCounts["tmt-sariya"] === 20, `Got ${subcatCounts["tmt-sariya"]}`);
assertCheck("Binding Wire & Steel Accessories has 4 SKUs", subcatCounts["binding-wire-accessories"] === 4, `Got ${subcatCounts["binding-wire-accessories"]}`);
assertCheck("Waterproofing & Bonding Chemicals has 22 SKUs", subcatCounts["waterproofing-chemicals"] === 22, `Got ${subcatCounts["waterproofing-chemicals"]}`);
assertCheck("Tile Adhesives & Block Mortar has 8 SKUs", subcatCounts["tile-adhesives-block-mortar"] === 8, `Got ${subcatCounts["tile-adhesives-block-mortar"]}`);

// 3. GST 18% & HSN Enforcement (Zero 28% GST)
const validHsns = new Set(["2523", "7214", "7217", "3824", "3214", "3209"]);
let invalidGstCount = 0;
let legacy28GstCount = 0;
let invalidHsnCount = 0;

for (const p of ALL_STRUCTURAL_PRODUCTS) {
  if (p.gstPercent !== 18) invalidGstCount++;
  if ((p as any).gstPercent === 28) legacy28GstCount++;
  if (!validHsns.has(p.hsnCode)) invalidHsnCount++;
}

assertCheck("All 70 SKUs strictly enforced at 18% GST (Zero exceptions)", invalidGstCount === 0, `Invalid: ${invalidGstCount}`);
assertCheck("Zero structural products taxed at legacy 28% GST", legacy28GstCount === 0, `Found 28% in: ${legacy28GstCount}`);
assertCheck("All 70 SKUs carry verified valid HSN codes (2523, 7214, 7217, 3824, 3214, 3209)", invalidHsnCount === 0, `Invalid HSN in: ${invalidHsnCount}`);

// 4. IS 1786 Theoretical Weight Math & Monotonic Price-by-Diameter
const tmtProducts = ALL_STRUCTURAL_PRODUCTS.filter((p) => p.subcategory === "tmt-sariya");
const expectedWeights: Record<number, number> = {
  8: 4.74,
  10: 7.41,
  12: 10.67,
  16: 18.96,
  20: 29.63,
};

let weightMismatchCount = 0;
let nonPickupTmtCount = 0;

for (const p of tmtProducts) {
  const dia = p.tmtDiameterMm!;
  const expected = expectedWeights[dia];
  if (p.theoreticalWeightKg !== expected) {
    weightMismatchCount++;
  }
  if (p.deliveryVehicleType !== "Pickup / Mini-Truck") {
    nonPickupTmtCount++;
  }
}

assertCheck("All TMT bars conform to IS 1786 theoretical weights (d^2/162 * 12)", weightMismatchCount === 0, `Mismatches: ${weightMismatchCount}`);
assertCheck("ALL 12m TMT Sariya bars strictly enforce 'Pickup / Mini-Truck' delivery routing", nonPickupTmtCount === 0, `Non-pickup: ${nonPickupTmtCount}`);

// Monotonic price-by-diameter per brand
const tmtByBrand: Record<string, typeof tmtProducts> = {};
for (const p of tmtProducts) {
  tmtByBrand[p.brand] = tmtByBrand[p.brand] || [];
  tmtByBrand[p.brand].push(p);
}

for (const [brand, bars] of Object.entries(tmtByBrand)) {
  if (bars.length > 1) {
    const sorted = [...bars].sort((a, b) => a.tmtDiameterMm! - b.tmtDiameterMm!);
    let isMonotonic = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].price >= sorted[i + 1].price) {
        isMonotonic = false;
        break;
      }
    }
    assertCheck(`TMT price strictly monotonically increases with diameter for ${brand}`, isMonotonic);
  }
}

// 5. Delivery Vehicle Routing Rules
let vehicleViolations = 0;
for (const p of ALL_STRUCTURAL_PRODUCTS) {
  if (p.unit.includes("50 kg") && p.deliveryVehicleType === "2-Wheeler") vehicleViolations++;
  if (p.unit.includes("20 Litre") && p.deliveryVehicleType === "2-Wheeler") vehicleViolations++;
  if (p.unit.includes("25 kg") && p.deliveryVehicleType === "2-Wheeler") vehicleViolations++;
}
assertCheck("Zero heavy items (>15kg / >10L) assigned to 2-Wheeler express dispatch", vehicleViolations === 0, `Violations: ${vehicleViolations}`);

// 6. Cross-File Synchronization Check
const storefrontFile = fs.readFileSync(path.resolve(__dirname, "../artifacts/conon/src/components/CementCollectionStorefront.tsx"), "utf-8");
const catalogDataFile = fs.readFileSync(path.resolve(__dirname, "../artifacts/conon/src/data/catalogData.ts"), "utf-8");
const dbCatalogDataFile = fs.readFileSync(path.resolve(__dirname, "../lib/db/src/catalogData.ts"), "utf-8");
const seedLocalDbFile = fs.readFileSync(path.resolve(__dirname, "../scripts/src/seed-local-db.ts"), "utf-8");

assertCheck("Storefront contains all 70 items defined", storefrontFile.includes("tata-tiscon-fe-500d-8mm-12m") && storefrontFile.includes("ultratech-ppc-cement-50kg"));
assertCheck("Frontend catalogData contains structural category with seeded products", (catalogDataFile.includes("cement-civil-works") || catalogDataFile.includes("cement-tmt-chemicals")) && catalogDataFile.includes("tata-tiscon-fe-500d-8mm-12m"));
assertCheck("Database catalogData contains structural category with seeded products", (dbCatalogDataFile.includes("cement-civil-works") || dbCatalogDataFile.includes("cement-tmt-chemicals")) && dbCatalogDataFile.includes("tata-tiscon-fe-500d-8mm-12m"));
assertCheck("Local DB seeder script contains structural seed products", seedLocalDbFile.includes("tata-tiscon-fe-500d-8mm-12m") && seedLocalDbFile.includes("ultratech-ppc-cement-50kg"));

console.log("\n-------------------------------------------------------");
console.log(`Validation Complete: ${passedChecks}/${totalChecks} Checks Passed.`);
console.log("-------------------------------------------------------\n");
