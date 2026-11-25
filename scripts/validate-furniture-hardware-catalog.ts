import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ALL_20_FURNITURE_HARDWARE_PRODUCTS } from "../artifacts/conon/src/data/furnitureHardwareData.js";
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from "../artifacts/conon/src/data/catalogData.js";
import { CATALOG_PRODUCTS as BACKEND_PRODUCTS } from "../lib/db/src/catalogData.js";

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
console.log(" CONON-NOW: FURNITURE, WARDROBE & BED HARDWARE 20-SKU CATALOG VALIDATION SUITE ");
console.log("================================================================================");

// 1. Array count checks
assert(
  ALL_20_FURNITURE_HARDWARE_PRODUCTS.length === 20,
  `ALL_20_FURNITURE_HARDWARE_PRODUCTS length is ${ALL_20_FURNITURE_HARDWARE_PRODUCTS.length}, expected 20`
);

const feHardware = CATALOG_PRODUCTS.filter((p) => p.categorySlug === "furniture-wardrobe-bed-hardware");
assert(
  feHardware.length === 20,
  `Frontend CATALOG_PRODUCTS with slug 'furniture-wardrobe-bed-hardware' is ${feHardware.length}, expected 20`
);

const beHardware = BACKEND_PRODUCTS.filter((p) => p.categorySlug === "furniture-wardrobe-bed-hardware");
assert(
  beHardware.length === 20,
  `Backend CATALOG_PRODUCTS with slug 'furniture-wardrobe-bed-hardware' is ${beHardware.length}, expected 20`
);

// 2. Subcategory breakdown
const subcatCounts: Record<string, number> = {};
for (const p of ALL_20_FURNITURE_HARDWARE_PRODUCTS) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
}

assert(subcatCounts["Telescopic Channels"] === 6, `Subcategory 'Telescopic Channels' count is ${subcatCounts["Telescopic Channels"]}, expected 6`);
assert(subcatCounts["Soft-Close Hinges & Sliding Track"] === 5, `Subcategory 'Soft-Close Hinges & Sliding Track' count is ${subcatCounts["Soft-Close Hinges & Sliding Track"]}, expected 5`);
assert(subcatCounts["Hydraulic Bed & Wardrobe Lifts"] === 5, `Subcategory 'Hydraulic Bed & Wardrobe Lifts' count is ${subcatCounts["Hydraulic Bed & Wardrobe Lifts"]}, expected 5`);
assert(subcatCounts["Wardrobe Pipes & SS 304 Handles"] === 4, `Subcategory 'Wardrobe Pipes & SS 304 Handles' count is ${subcatCounts["Wardrobe Pipes & SS 304 Handles"]}, expected 4`);

// 3. Category existence in CATALOG_CATEGORIES
const cat = CATALOG_CATEGORIES.find((c) => c.slug === "furniture-wardrobe-bed-hardware");
assert(!!cat, "Category 'furniture-wardrobe-bed-hardware' exists in CATALOG_CATEGORIES");
assert(cat?.subcategories?.length === 4, `Category subcategories count is ${cat?.subcategories?.length}, expected 4`);

// 4. Expected Product Master Catalog
const EXPECTED_PRODUCTS: Record<
  string,
  {
    name: string;
    subcat: string;
    furnitureSubcategory: string;
    fitSpecBadge: string;
    price: number;
    exGstPrice: number;
    hsnCode: string;
    vehicle: "2-Wheeler" | "E-Loader";
  }
> = {
  "prod-fur-ebco-stds-i-35-20in": {
    name: "Ebco Regular Drawer Channel STDS-I-35 20 in (500mm, 35kg, 1 Pair)",
    subcat: "Telescopic Channels",
    furnitureSubcategory: "TELESCOPIC_CHANNEL",
    fitSpecBadge: '20" (500mm) · 35kg · Regular Close',
    price: 350,
    exGstPrice: 297,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-ebco-sleek-reg-20in": {
    name: "Ebco Sleek Telescopic Channel 20 in (500mm, 35kg Regular Close, 1 Pair)",
    subcat: "Telescopic Channels",
    furnitureSubcategory: "TELESCOPIC_CHANNEL",
    fitSpecBadge: '20" (500mm) · 35kg · Regular Close',
    price: 518,
    exGstPrice: 439,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-ebco-sleek-soft-20in": {
    name: "Ebco Sleek Telescopic Channel 20 in (500mm, 35kg Soft Close, 1 Pair)",
    subcat: "Telescopic Channels",
    furnitureSubcategory: "TELESCOPIC_CHANNEL",
    fitSpecBadge: '20" (500mm) · 35kg · Soft Close',
    price: 1074,
    exGstPrice: 910,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hettich-ka4532-18in-zinc": {
    name: "Hettich KA 4532 Telescopic Channel 18 in (450mm, 35kg Soft Close Zinc)",
    subcat: "Telescopic Channels",
    furnitureSubcategory: "TELESCOPIC_CHANNEL",
    fitSpecBadge: '18" (450mm) · 35kg · Soft Close Zinc',
    price: 985,
    exGstPrice: 835,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hettich-ka4732-18in-black": {
    name: "Hettich KA-4732 Telescopic Channel 18 in (450mm, 35kg Soft Close Black)",
    subcat: "Telescopic Channels",
    furnitureSubcategory: "TELESCOPIC_CHANNEL",
    fitSpecBadge: '18" (450mm) · 35kg · Soft Close Black',
    price: 1150,
    exGstPrice: 975,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hettich-ka4732-20in-black": {
    name: "Hettich KA-4732 Telescopic Channel 20 in (500mm, 35kg Soft Close Black)",
    subcat: "Telescopic Channels",
    furnitureSubcategory: "TELESCOPIC_CHANNEL",
    fitSpecBadge: '20" (500mm) · 35kg · Soft Close Black',
    price: 1194,
    exGstPrice: 1012,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hettich-onsys-0crank-105": {
    name: "Hettich Onsys 4447i Soft Close Hinge 105° 0 Crank (Full Overlay, 1 Pair)",
    subcat: "Soft-Close Hinges & Sliding Track",
    furnitureSubcategory: "HINGE_SLIDING",
    fitSpecBadge: "105° · 0 Crank · Full Overlay",
    price: 209,
    exGstPrice: 177,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hettich-onsys-8crank-105": {
    name: "Hettich Onsys 4447i Soft Close Hinge 105° 8 Crank (Half Overlay, 1 Pair)",
    subcat: "Soft-Close Hinges & Sliding Track",
    furnitureSubcategory: "HINGE_SLIDING",
    fitSpecBadge: "105° · 8 Crank · Half Overlay",
    price: 222,
    exGstPrice: 188,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hafele-metalla-110-full": {
    name: "Hafele Metalla 110° Clip-On Full Overlay Soft Close Hinge (315.07.075, 1 Pair)",
    subcat: "Soft-Close Hinges & Sliding Track",
    furnitureSubcategory: "HINGE_SLIDING",
    fitSpecBadge: "110° · Clip-On · Full Overlay",
    price: 3628,
    exGstPrice: 3075,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hafele-metalla-110-half": {
    name: "Hafele Metalla 110° Clip-On Half Overlay Soft Close Hinge (315.07.076, 1 Pair)",
    subcat: "Soft-Close Hinges & Sliding Track",
    furnitureSubcategory: "HINGE_SLIDING",
    fitSpecBadge: "110° · Clip-On · Half Overlay",
    price: 3676,
    exGstPrice: 3115,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-decoranddecor-sliding-12m": {
    name: "Decoranddecor Sliding Wardrobe Door Track Kit 2 Doors 1.2m (75kg/door)",
    subcat: "Soft-Close Hinges & Sliding Track",
    furnitureSubcategory: "HINGE_SLIDING",
    fitSpecBadge: "1.2m Track · 2 Doors · 75kg/Door",
    price: 11493,
    exGstPrice: 9740,
    hsnCode: "8302",
    vehicle: "E-Loader",
  },
  "prod-fur-hydraulic-lift-ottoman-1200n": {
    name: "Hydraulic Lift Ottoman Bed Lift Mechanism + 1200N Gas Strut Set (2x Pair)",
    subcat: "Hydraulic Bed & Wardrobe Lifts",
    furnitureSubcategory: "BED_WARDROBE_LIFT",
    fitSpecBadge: "1200N Gas Struts · Heavy Ottoman Set",
    price: 13700,
    exGstPrice: 11610,
    hsnCode: "8302",
    vehicle: "E-Loader",
  },
  "prod-fur-pneumatic-bed-lift-900mm": {
    name: "Pneumatic Lift Heavy-Duty Hydraulic Bed Storage Lid Lifter 900mm (1 Pair)",
    subcat: "Hydraulic Bed & Wardrobe Lifts",
    furnitureSubcategory: "BED_WARDROBE_LIFT",
    fitSpecBadge: "900mm Lift Mechanism · 1 Pair",
    price: 15680,
    exGstPrice: 13288,
    hsnCode: "8302",
    vehicle: "E-Loader",
  },
  "prod-fur-pneumatic-bed-lift-1500mm": {
    name: "Pneumatic Lift Heavy-Duty Hydraulic Bed Lift & Gas Strut Kit 1500mm (2 Pcs)",
    subcat: "Hydraulic Bed & Wardrobe Lifts",
    furnitureSubcategory: "BED_WARDROBE_LIFT",
    fitSpecBadge: "1500mm Lift Mechanism · King Size Bed",
    price: 41570,
    exGstPrice: 35229,
    hsnCode: "8302",
    vehicle: "E-Loader",
  },
  "prod-fur-hettich-wardrobe-lift-540-690": {
    name: "Hettich Hydraulic Pull-Down Wardrobe Garment Lift 540–690mm (Grey)",
    subcat: "Hydraulic Bed & Wardrobe Lifts",
    furnitureSubcategory: "BED_WARDROBE_LIFT",
    fitSpecBadge: "540–690mm · 12kg · Hydraulic Drop",
    price: 3942,
    exGstPrice: 3341,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-rigwell-closet-rod-850-1150": {
    name: "Rigwell Soft Close Pull-Down Closet Rod 850–1150mm (15kg Silver)",
    subcat: "Hydraulic Bed & Wardrobe Lifts",
    furnitureSubcategory: "BED_WARDROBE_LIFT",
    fitSpecBadge: "850–1150mm · 15kg · Soft Close",
    price: 4400,
    exGstPrice: 3729,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-heavy-duty-ss-closet-rod-36in": {
    name: "Heavy Duty SS 304 Stainless Steel 32mm Closet Rod w/ Flanges 36 in (Set of 2)",
    subcat: "Wardrobe Pipes & SS 304 Handles",
    furnitureSubcategory: "PIPE_HANDLE",
    fitSpecBadge: '32mm Dia · 36 in · SS-304 w/ Flanges',
    price: 7431,
    exGstPrice: 6297,
    hsnCode: "7306",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hw-depot-handle-96mm-black": {
    name: "Hardware Depot Luxury Knurled PVD Cabinet Handle 96mm SS-304 (Matte Black, 9409)",
    subcat: "Wardrobe Pipes & SS 304 Handles",
    furnitureSubcategory: "PIPE_HANDLE",
    fitSpecBadge: "96mm C.C. · Knurled SS-304 PVD",
    price: 554,
    exGstPrice: 469,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hw-depot-handle-160mm-zblack": {
    name: "Hardware Depot Luxury PVD Cabinet Handle 160mm SS-304 (Z Black, 9401)",
    subcat: "Wardrobe Pipes & SS 304 Handles",
    furnitureSubcategory: "PIPE_HANDLE",
    fitSpecBadge: "160mm C.C. · SS-304 Z-Black PVD",
    price: 640,
    exGstPrice: 542,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
  "prod-fur-hw-depot-handle-224mm-zblack": {
    name: "Hardware Depot Luxury PVD Cabinet Handle 224mm SS-304 (Z Black, 9401)",
    subcat: "Wardrobe Pipes & SS 304 Handles",
    furnitureSubcategory: "PIPE_HANDLE",
    fitSpecBadge: "224mm C.C. · SS-304 Z-Black PVD",
    price: 822,
    exGstPrice: 697,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
  },
};

// Load Manifest
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

for (const prod of ALL_20_FURNITURE_HARDWARE_PRODUCTS) {
  const exp = EXPECTED_PRODUCTS[prod.id];
  assert(!!exp, `SKU ${prod.id} is recognized in master specification`);
  if (!exp) continue;

  assert(prod.price === exp.price, `SKU ${prod.id} selling price is ₹${prod.price}, expected ₹${exp.price}`);
  assert(prod.gstPercent === 18, `SKU ${prod.id} has gstPercent 18, expected 18%`);
  assert(prod.exGstPrice === exp.exGstPrice, `SKU ${prod.id} exGstPrice is ₹${prod.exGstPrice}, expected ₹${exp.exGstPrice}`);
  assert(prod.hsnCode === exp.hsnCode, `SKU ${prod.id} HSN is ${prod.hsnCode}, expected ${exp.hsnCode}`);
  assert(prod.deliveryVehicleType === exp.vehicle, `SKU ${prod.id} vehicle is ${prod.deliveryVehicleType}, expected ${exp.vehicle}`);
  assert(prod.fitSpecBadge === exp.fitSpecBadge, `SKU ${prod.id} fitSpecBadge matches '${exp.fitSpecBadge}'`);
  assert(prod.furnitureSubcategory === exp.furnitureSubcategory, `SKU ${prod.id} furnitureSubcategory matches '${exp.furnitureSubcategory}'`);

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
const wronglyBikedLifts = ALL_20_FURNITURE_HARDWARE_PRODUCTS.filter(
  (p) => ["prod-fur-hydraulic-lift-ottoman-1200n", "prod-fur-pneumatic-bed-lift-900mm", "prod-fur-pneumatic-bed-lift-1500mm", "prod-fur-decoranddecor-sliding-12m"].includes(p.id) &&
    p.deliveryVehicleType === "2-Wheeler"
);
assert(wronglyBikedLifts.length === 0, `Zero long bed lifts or tracks mistakenly routed to 2-Wheeler (found ${wronglyBikedLifts.length})`);

console.log("================================================================================");
if (failures === 0) {
  console.log(`SUCCESS: All 20 SKUs verified! 100% Tax, Fitting, Fleet & Image Compliant! (${passes} checks passed)`);
  process.exit(0);
} else {
  console.error(`FAILED: ${failures} checks failed! (${passes} passed)`);
  process.exit(1);
}
