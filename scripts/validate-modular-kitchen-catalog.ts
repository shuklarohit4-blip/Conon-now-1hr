import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ALL_26_MODULAR_KITCHEN_PRODUCTS } from "../artifacts/conon/src/data/modularKitchenData";
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from "../artifacts/conon/src/data/catalogData";
import { CATALOG_PRODUCTS as BACKEND_PRODUCTS } from "../lib/db/src/catalogData";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

function getSha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

let failures = 0;
let passes = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passes++;
    console.log(`✓ PASS: ${msg}`);
  } else {
    failures++;
    console.error(`❌ FAIL: ${msg}`);
  }
}

console.log("================================================================================");
console.log(" CONON-NOW: MODULAR KITCHEN SYSTEMS & FITTINGS 26-SKU VALIDATION SUITE          ");
console.log("================================================================================");

// 1. Array count checks
assert(
  ALL_26_MODULAR_KITCHEN_PRODUCTS.length === 26,
  `ALL_26_MODULAR_KITCHEN_PRODUCTS length is ${ALL_26_MODULAR_KITCHEN_PRODUCTS.length}, expected 26`
);

const feProducts = CATALOG_PRODUCTS.filter((p) => p.categorySlug === "modular-kitchen-systems");
assert(
  feProducts.length === 26,
  `Frontend CATALOG_PRODUCTS with slug 'modular-kitchen-systems' is ${feProducts.length}, expected 26`
);

const beProducts = BACKEND_PRODUCTS.filter((p) => p.categorySlug === "modular-kitchen-systems");
assert(
  beProducts.length === 26,
  `Backend CATALOG_PRODUCTS with slug 'modular-kitchen-systems' is ${beProducts.length}, expected 26`
);

// 2. Subcategory breakdown
const subcatCounts: Record<string, number> = {};
for (const p of ALL_26_MODULAR_KITCHEN_PRODUCTS) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
}

assert(
  subcatCounts["Tandem Box Drawer Systems"] === 7,
  `Subcategory 'Tandem Box Drawer Systems' count is ${subcatCounts["Tandem Box Drawer Systems"]}, expected 7`
);
assert(
  subcatCounts["Bottle Pull-Outs, Corner Units & Tall Pantry"] === 8,
  `Subcategory 'Bottle Pull-Outs, Corner Units & Tall Pantry' count is ${subcatCounts["Bottle Pull-Outs, Corner Units & Tall Pantry"]}, expected 8`
);
assert(
  subcatCounts["SS 304 Baskets, Wicker & Organizers"] === 6,
  `Subcategory 'SS 304 Baskets, Wicker & Organizers' count is ${subcatCounts["SS 304 Baskets, Wicker & Organizers"]}, expected 6`
);
assert(
  subcatCounts["Rolling Shutters, Lift-Ups & Gola Profiles"] === 5,
  `Subcategory 'Rolling Shutters, Lift-Ups & Gola Profiles' count is ${subcatCounts["Rolling Shutters, Lift-Ups & Gola Profiles"]}, expected 5`
);

// 3. Category existence in CATALOG_CATEGORIES
const cat = CATALOG_CATEGORIES.find((c) => c.slug === "modular-kitchen-systems");
assert(!!cat, "Category 'modular-kitchen-systems' exists in CATALOG_CATEGORIES");
assert(cat?.subcategories?.length === 4, `Category subcategories count is ${cat?.subcategories?.length}, expected 4`);

// 4. Expected Product Master Catalog
const EXPECTED_PRODUCTS: Record<
  string,
  {
    price: number;
    exGstPrice: number;
    hsnCode: string;
    vehicle: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
    subcatCode: "TANDEM_BOX" | "PULLOUT_CORNER_PANTRY" | "BASKET_ORGANIZER" | "SHUTTER_LIFT_GOLA";
    oemModelCode?: string;
  }
> = {
  // Subcat 1: Tandem Box Drawer Systems (7 SKUs)
  "prod-mod-ebco-slim-s3-500-122": {
    price: 2700,
    exGstPrice: 2288,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
  },
  "prod-mod-hettich-innotech-cutlery-70mm": {
    price: 2850,
    exGstPrice: 2415,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
  },
  "prod-mod-hettich-innotech-cup-144mm": {
    price: 3099,
    exGstPrice: 2626,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
  },
  "prod-mod-hettich-atira-pot-pan-176mm": {
    price: 3544,
    exGstPrice: 3003,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
    oemModelCode: "9249744",
  },
  "prod-mod-hettich-atira-6in-anthracite": {
    price: 4034,
    exGstPrice: 3419,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
  },
  "prod-mod-hettich-atira-thali-pantry-200mm": {
    price: 4250,
    exGstPrice: 3602,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
  },
  "prod-mod-hafele-matrixbox-slim-ss-500-88": {
    price: 10808,
    exGstPrice: 9159,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "TANDEM_BOX",
  },

  // Subcat 2: Bottle Pull-Outs, Corner Units & Tall Pantry (8 SKUs)
  "prod-mod-ebco-frameless-side-pullout-150mm": {
    price: 1767,
    exGstPrice: 1497,
    hsnCode: "7323",
    vehicle: "2-Wheeler",
    subcatCode: "PULLOUT_CORNER_PANTRY",
  },
  "prod-mod-ebco-bpo2sc2-150mm": {
    price: 6176,
    exGstPrice: 5234,
    hsnCode: "7323",
    vehicle: "E-Loader",
    subcatCode: "PULLOUT_CORNER_PANTRY",
    oemModelCode: "BPO2SC2-150",
  },
  "prod-mod-ebco-bpo2sc2-200mm": {
    price: 6681,
    exGstPrice: 5662,
    hsnCode: "7323",
    vehicle: "E-Loader",
    subcatCode: "PULLOUT_CORNER_PANTRY",
    oemModelCode: "BPO2SC2-200",
  },
  "prod-mod-ebco-bpo2sc2-250mm": {
    price: 7223,
    exGstPrice: 6121,
    hsnCode: "7323",
    vehicle: "E-Loader",
    subcatCode: "PULLOUT_CORNER_PANTRY",
    oemModelCode: "BPO2SC2-250",
  },
  "prod-mod-ebco-corner-carousel-polymer": {
    price: 11119,
    exGstPrice: 9423,
    hsnCode: "8302",
    vehicle: "E-Loader",
    subcatCode: "PULLOUT_CORNER_PANTRY",
  },
  "prod-mod-ebco-magic-corner-mcdp90": {
    price: 23778,
    exGstPrice: 20151,
    hsnCode: "8302",
    vehicle: "E-Loader",
    subcatCode: "PULLOUT_CORNER_PANTRY",
    oemModelCode: "MCDP90",
  },
  "prod-mod-hettich-magic-corner-iron-grey": {
    price: 24016,
    exGstPrice: 20353,
    hsnCode: "8302",
    vehicle: "E-Loader",
    subcatCode: "PULLOUT_CORNER_PANTRY",
  },
  "prod-mod-kings-nimbus-tall-pantry-600mm": {
    price: 14990,
    exGstPrice: 12703,
    hsnCode: "8302",
    vehicle: "E-Loader / Pickup",
    subcatCode: "PULLOUT_CORNER_PANTRY",
  },

  // Subcat 3: SS 304 Baskets, Wicker & Organizers (6 SKUs)
  "prod-mod-hettich-cargoplus-ss304-thali": {
    price: 1445,
    exGstPrice: 1225,
    hsnCode: "7323",
    vehicle: "2-Wheeler",
    subcatCode: "BASKET_ORGANIZER",
  },
  "prod-mod-quba-symetry-plain-basket-ss304": {
    price: 1677,
    exGstPrice: 1421,
    hsnCode: "7323",
    vehicle: "2-Wheeler",
    subcatCode: "BASKET_ORGANIZER",
  },
  "prod-mod-zinc-plus-perforated-thali-basket": {
    price: 2119,
    exGstPrice: 1796,
    hsnCode: "7323",
    vehicle: "2-Wheeler",
    subcatCode: "BASKET_ORGANIZER",
  },
  "prod-mod-hettich-orgatray-560-cutlery": {
    price: 2930,
    exGstPrice: 2483,
    hsnCode: "3924",
    vehicle: "2-Wheeler",
    subcatCode: "BASKET_ORGANIZER",
  },
  "prod-mod-ebco-waste-bin-40l": {
    price: 5304,
    exGstPrice: 4495,
    hsnCode: "3924",
    vehicle: "E-Loader",
    subcatCode: "BASKET_ORGANIZER",
  },
  "prod-mod-ebco-livsmart-wicker-450": {
    price: 5518,
    exGstPrice: 4676,
    hsnCode: "8302",
    vehicle: "E-Loader",
    subcatCode: "BASKET_ORGANIZER",
  },

  // Subcat 4: Rolling Shutters, Lift-Ups & Gola Profiles (5 SKUs)
  "prod-mod-ebco-pro-lift-100n-gas-spring": {
    price: 239,
    exGstPrice: 203,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "SHUTTER_LIFT_GOLA",
  },
  "prod-mod-hettich-100n-gas-piston-0062316": {
    price: 7642,
    exGstPrice: 6476,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "SHUTTER_LIFT_GOLA",
    oemModelCode: "0062316",
  },
  "prod-mod-hettich-gola-profile-3000mm-black": {
    price: 2399,
    exGstPrice: 2033,
    hsnCode: "7604",
    vehicle: "E-Loader",
    subcatCode: "SHUTTER_LIFT_GOLA",
    oemModelCode: "9299225",
  },
  "prod-mod-ebco-roll-top-pro-shutter-600mm": {
    price: 12014,
    exGstPrice: 10181,
    hsnCode: "7604",
    vehicle: "E-Loader",
    subcatCode: "SHUTTER_LIFT_GOLA",
    oemModelCode: "RTPV",
  },
  "prod-mod-rehau-rauvolet-vetroline-glass-shutter": {
    price: 76699,
    exGstPrice: 64999,
    hsnCode: "7604",
    vehicle: "E-Loader / Pickup",
    subcatCode: "SHUTTER_LIFT_GOLA",
  },
};

// Load Manifest
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

for (const prod of ALL_26_MODULAR_KITCHEN_PRODUCTS) {
  const exp = EXPECTED_PRODUCTS[prod.id];
  assert(!!exp, `SKU ${prod.id} is recognized in master specification`);
  if (!exp) continue;

  assert(prod.price === exp.price, `SKU ${prod.id} selling price is ₹${prod.price}, expected ₹${exp.price}`);
  assert(prod.gstPercent === 18, `SKU ${prod.id} has gstPercent 18, expected 18%`);
  assert(prod.exGstPrice === exp.exGstPrice, `SKU ${prod.id} exGstPrice is ₹${prod.exGstPrice}, expected ₹${exp.exGstPrice}`);
  assert(prod.hsnCode === exp.hsnCode, `SKU ${prod.id} HSN is ${prod.hsnCode}, expected ${exp.hsnCode}`);
  assert(prod.deliveryVehicleType === exp.vehicle, `SKU ${prod.id} vehicle is ${prod.deliveryVehicleType}, expected ${exp.vehicle}`);
  assert(prod.modularSubcategory === exp.subcatCode, `SKU ${prod.id} modularSubcategory matches '${exp.subcatCode}'`);
  assert(!!prod.carcassFitBadge, `SKU ${prod.id} has carcassFitBadge '${prod.carcassFitBadge}'`);

  if (exp.oemModelCode) {
    assert(prod.oemModelCode === exp.oemModelCode, `SKU ${prod.id} OEM model code matches '${exp.oemModelCode}'`);
  }

  // Mandatory Tandem Box inclusions warning badge
  if (prod.modularSubcategory === "TANDEM_BOX") {
    assert(
      prod.inclusionsBadge === "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
      `SKU ${prod.id} has mandatory Tandem Box inclusions badge`
    );
  }

  // Image verification
  const imgRelPath = prod.image.startsWith("/") ? prod.image.slice(1) : prod.image;
  const imgFullPath = path.join(publicDir, imgRelPath);
  const exists = fs.existsSync(imgFullPath);
  assert(exists, `Image file exists on disk: ${imgFullPath}`);

  if (exists) {
    const fileBuf = fs.readFileSync(imgFullPath);
    const diskHash = getSha256(fileBuf);
    const manifestEntry = manifest[imgRelPath];
    assert(!!manifestEntry, `Manifest entry exists for: ${imgRelPath}`);
    if (manifestEntry) {
      assert(manifestEntry.sha256 === diskHash, `SHA-256 match for ${imgRelPath}`);
    }
  }
}

// 5. Negative guardrail tests
const wronglyBikedHeavy = ALL_26_MODULAR_KITCHEN_PRODUCTS.filter(
  (p) =>
    [
      "prod-mod-ebco-corner-carousel-polymer",
      "prod-mod-ebco-magic-corner-mcdp90",
      "prod-mod-hettich-magic-corner-iron-grey",
      "prod-mod-kings-nimbus-tall-pantry-600mm",
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-ebco-roll-top-pro-shutter-600mm",
      "prod-mod-rehau-rauvolet-vetroline-glass-shutter",
    ].includes(p.id) && p.deliveryVehicleType === "2-Wheeler"
);
assert(
  wronglyBikedHeavy.length === 0,
  `Zero heavy corner units, 3m Gola profiles, shutters or tall pantry routed to 2-Wheeler (found ${wronglyBikedHeavy.length})`
);

const missingTandemInclusions = ALL_26_MODULAR_KITCHEN_PRODUCTS.filter(
  (p) => p.modularSubcategory === "TANDEM_BOX" && !p.inclusionsBadge
);
assert(
  missingTandemInclusions.length === 0,
  `Zero Tandem Box SKUs missing mandatory inclusionsBadge (found ${missingTandemInclusions.length})`
);

console.log("================================================================================");
if (failures === 0) {
  console.log(`SUCCESS: All 26 SKUs verified! 100% Tax, Fitting, Fleet & Image Compliant! (${passes} checks passed)`);
  process.exit(0);
} else {
  console.error(`FAILED: ${failures} checks failed! (${passes} passed)`);
  process.exit(1);
}
