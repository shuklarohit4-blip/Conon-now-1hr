import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { ALL_26_DOOR_HARDWARE_PRODUCTS } from "../artifacts/conon/src/data/doorHardwareData";
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
console.log(" CONON-NOW: DOOR HARDWARE & LOCKS 26-SKU VALIDATION SUITE                      ");
console.log("================================================================================");

// 1. Array count checks
assert(
  ALL_26_DOOR_HARDWARE_PRODUCTS.length === 26,
  `ALL_26_DOOR_HARDWARE_PRODUCTS length is ${ALL_26_DOOR_HARDWARE_PRODUCTS.length}, expected 26`
);

const feProducts = CATALOG_PRODUCTS.filter((p) => p.categorySlug === "door-hardware-locks");
assert(
  feProducts.length === 26,
  `Frontend CATALOG_PRODUCTS with slug 'door-hardware-locks' is ${feProducts.length}, expected 26`
);

const beProducts = BACKEND_PRODUCTS.filter((p) => p.categorySlug === "door-hardware-locks");
assert(
  beProducts.length === 26,
  `Backend CATALOG_PRODUCTS with slug 'door-hardware-locks' is ${beProducts.length}, expected 26`
);

// 2. Subcategory breakdown
const subcatCounts: Record<string, number> = {};
for (const p of ALL_26_DOOR_HARDWARE_PRODUCTS) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
}

assert(
  subcatCounts["Smart Digital Locks"] === 6,
  `Subcategory 'Smart Digital Locks' count is ${subcatCounts["Smart Digital Locks"]}, expected 6`
);
assert(
  subcatCounts["Main Door Rim Locks, Mortise Sets & Padlocks"] === 10,
  `Subcategory 'Main Door Rim Locks, Mortise Sets & Padlocks' count is ${subcatCounts["Main Door Rim Locks, Mortise Sets & Padlocks"]}, expected 10`
);
assert(
  subcatCounts["Aldrops, Tower Bolts, Stoppers & Pull Handles"] === 5,
  `Subcategory 'Aldrops, Tower Bolts, Stoppers & Pull Handles' count is ${subcatCounts["Aldrops, Tower Bolts, Stoppers & Pull Handles"]}, expected 5`
);
assert(
  subcatCounts["SS 304 Hinges, Door Closers & Floor Springs"] === 5,
  `Subcategory 'SS 304 Hinges, Door Closers & Floor Springs' count is ${subcatCounts["SS 304 Hinges, Door Closers & Floor Springs"]}, expected 5`
);

// 3. Category in CATALOG_CATEGORIES
const cat = CATALOG_CATEGORIES.find((c) => c.slug === "door-hardware-locks");
assert(!!cat, "Category 'door-hardware-locks' exists in CATALOG_CATEGORIES");
assert(cat?.subcategories?.length === 4, `Category subcategories count is ${cat?.subcategories?.length}, expected 4`);

// 4. Expected Master Specifications
const EXPECTED_PRODUCTS: Record<
  string,
  {
    price: number;
    exGstPrice: number;
    hsnCode: string;
    vehicle: "2-Wheeler";
    subcatCode: "SMART_DIGITAL_LOCK" | "MAIN_DOOR_MORTISE_PADLOCK" | "BOLT_ALDROP_STOPPER" | "HINGE_CLOSER_SPRING";
    expectedDoorThickness: string;
    oemModelCode?: string;
  }
> = {
  // Subcat 1: Smart Digital Locks (6 SKUs)
  "prod-door-godrej-neo-prime-9686": {
    price: 9099,
    exGstPrice: 7711,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "SMART_DIGITAL_LOCK",
    expectedDoorThickness: "Requires 35–65mm Wooden Door",
    oemModelCode: "9686",
  },
  "prod-door-yale-ydme-50nxt-brown": {
    price: 9282,
    exGstPrice: 7866,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "SMART_DIGITAL_LOCK",
    expectedDoorThickness: "Requires 35–65mm Wooden Door",
    oemModelCode: "YDME 50NxT",
  },
  "prod-door-godrej-catus-touch-plus-4200": {
    price: 10900,
    exGstPrice: 9237,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "SMART_DIGITAL_LOCK",
    expectedDoorThickness: "Requires 35–65mm Wooden Door",
    oemModelCode: "4200",
  },
  "prod-door-godrej-advantis-gsld1-4406": {
    price: 16099,
    exGstPrice: 13643,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "SMART_DIGITAL_LOCK",
    expectedDoorThickness: "Requires 35–65mm Wooden Door",
    oemModelCode: "4406",
  },
  "prod-door-yale-ydr-41a-biometric": {
    price: 34966,
    exGstPrice: 29632,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "SMART_DIGITAL_LOCK",
    expectedDoorThickness: "Requires 35–65mm Wooden Door",
    oemModelCode: "YDR 41A",
  },
  "prod-door-godrej-advantis-iot9": {
    price: 43157,
    exGstPrice: 36574,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "SMART_DIGITAL_LOCK",
    expectedDoorThickness: "Requires 35–65mm Wooden Door",
  },

  // Subcat 2: Main Door Rim Locks, Mortise Sets & Padlocks (10 SKUs)
  "prod-door-godrej-vertibolt-4291": {
    price: 2199,
    exGstPrice: 1864,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 30–60mm Wooden Door",
    oemModelCode: "4291",
  },
  "prod-door-godrej-tribolt-1ck-8111": {
    price: 3300,
    exGstPrice: 2797,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 30–60mm Wooden Door",
    oemModelCode: "8111",
  },
  "prod-door-europa-parma-v321": {
    price: 3474,
    exGstPrice: 2944,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 30–60mm Wooden Door",
    oemModelCode: "V321",
  },
  "prod-door-godrej-tribolt-2c-8131": {
    price: 3820,
    exGstPrice: 3237,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 30–60mm Wooden Door",
    oemModelCode: "8131",
  },
  "prod-door-godrej-centaur-9143": {
    price: 4010,
    exGstPrice: 3398,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 30–60mm Wooden Door",
    oemModelCode: "9143",
  },
  "prod-door-godrej-stella-180mm": {
    price: 1577,
    exGstPrice: 1336,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 28–45mm Door",
  },
  "prod-door-europa-mortise-rose-m516961r692ab": {
    price: 1990,
    exGstPrice: 1686,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 32–45mm Door",
    oemModelCode: "M516961R692AB",
  },
  "prod-door-dorset-kaira-10in": {
    price: 2017,
    exGstPrice: 1709,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 32–45mm Door",
  },
  "prod-door-godrej-cylindrical-5805": {
    price: 853,
    exGstPrice: 723,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits 25–45mm Door",
    oemModelCode: "5805",
  },
  "prod-door-godrej-navtal-65mm-brass": {
    price: 800,
    exGstPrice: 678,
    hsnCode: "8301",
    vehicle: "2-Wheeler",
    subcatCode: "MAIN_DOOR_MORTISE_PADLOCK",
    expectedDoorThickness: "Fits Standard 8–14mm Aldrop / Hasp Staples",
  },

  // Subcat 3: Aldrops, Tower Bolts, Stoppers & Pull Handles (5 SKUs)
  "prod-door-cent-style-aldrop-12in": {
    price: 1299,
    exGstPrice: 1101,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "BOLT_ALDROP_STOPPER",
    expectedDoorThickness: "Universal (Through-Bolt Fitting)",
  },
  "prod-door-bling-queen-aldrop-12in": {
    price: 2049,
    exGstPrice: 1736,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "BOLT_ALDROP_STOPPER",
    expectedDoorThickness: "Universal (Through-Bolt Fitting)",
  },
  "prod-door-apace-tower-bolt-8in-apstb89ss": {
    price: 98,
    exGstPrice: 83,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "BOLT_ALDROP_STOPPER",
    expectedDoorThickness: "Universal Flush / Surface Mount",
    oemModelCode: "APSTB89SS",
  },
  "prod-door-met-craft-magnetic-stopper": {
    price: 435,
    exGstPrice: 369,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "BOLT_ALDROP_STOPPER",
    expectedDoorThickness: "Universal Floor / Baseboard Mount",
  },
  "prod-door-falna-pull-handle-ss304": {
    price: 500,
    exGstPrice: 424,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "BOLT_ALDROP_STOPPER",
    expectedDoorThickness: "Fits 30–55mm Doors (Back-to-Back or Through-Bolt)",
  },

  // Subcat 4: SS 304 Hinges, Door Closers & Floor Springs (5 SKUs)
  "prod-door-hafele-butt-hinge-5x3x3": {
    price: 349,
    exGstPrice: 296,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "HINGE_CLOSER_SPRING",
    expectedDoorThickness: "Fits 35–55mm Heavy Wooden / Metal Doors",
  },
  "prod-door-godrej-butt-hinge-5in-12g-black": {
    price: 648,
    exGstPrice: 549,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "HINGE_CLOSER_SPRING",
    expectedDoorThickness: "Fits 35–55mm Heavy Doors",
  },
  "prod-door-dorset-dc60sm-closer": {
    price: 927,
    exGstPrice: 786,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "HINGE_CLOSER_SPRING",
    expectedDoorThickness: "Fits up to 950mm Width Doors",
    oemModelCode: "DC60SM",
  },
  "prod-door-godrej-hercules-closer-60kg": {
    price: 1299,
    exGstPrice: 1101,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "HINGE_CLOSER_SPRING",
    expectedDoorThickness: "Fits up to 950mm Width Doors",
  },
  "prod-door-ozone-fs8400-floor-spring": {
    price: 8847,
    exGstPrice: 7497,
    hsnCode: "8302",
    vehicle: "2-Wheeler",
    subcatCode: "HINGE_CLOSER_SPRING",
    expectedDoorThickness: "Fits 10–12mm Toughened Glass & 40–55mm Heavy Wooden Doors",
    oemModelCode: "FS-8400",
  },
};

// Check image manifest
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

async function validateAllProducts() {
  for (const prod of ALL_26_DOOR_HARDWARE_PRODUCTS) {
    const exp = EXPECTED_PRODUCTS[prod.id];
    assert(!!exp, `Product ${prod.id} exists in EXPECTED_PRODUCTS dictionary`);
    if (!exp) continue;

    // Price checks
    assert(prod.price === exp.price, `${prod.id} price is ₹${prod.price}, expected ₹${exp.price}`);
    assert(
      prod.exGstPrice === exp.exGstPrice,
      `${prod.id} exGstPrice is ₹${prod.exGstPrice}, expected ₹${exp.exGstPrice}`
    );
    assert(
      prod.exGstPrice === Math.round(prod.price / 1.18),
      `${prod.id} exGstPrice correctly follows 18% GST formula`
    );
    assert(prod.gstPercent === 18, `${prod.id} gstPercent is 18`);

    // HSN Code
    assert(prod.hsnCode === exp.hsnCode, `${prod.id} HSN is ${prod.hsnCode}, expected ${exp.hsnCode}`);

    // Vehicle
    assert(
      prod.deliveryVehicleType === exp.vehicle,
      `${prod.id} deliveryVehicleType is ${prod.deliveryVehicleType}, expected ${exp.vehicle}`
    );

    // Subcategory code
    assert(
      prod.doorSubcategory === exp.subcatCode,
      `${prod.id} doorSubcategory is ${prod.doorSubcategory}, expected ${exp.subcatCode}`
    );

    // Door Thickness Guardrail
    assert(
      prod.doorThicknessRangeMm === exp.expectedDoorThickness,
      `${prod.id} doorThicknessRangeMm is "${prod.doorThicknessRangeMm}", expected "${exp.expectedDoorThickness}"`
    );

    // OEM Model Code check if applicable
    if (exp.oemModelCode) {
      assert(
        prod.oemModelCode === exp.oemModelCode,
        `${prod.id} OEM Model Code is ${prod.oemModelCode}, expected ${exp.oemModelCode}`
      );
    }

    // Cross sell check
    assert(
      (prod.crossSellSkus || []).length >= 2,
      `${prod.id} has at least 2 cross-sell items (${prod.crossSellSkus?.length || 0})`
    );

    // Image file checks
    const filename = path.basename(prod.image);
    const diskPath = path.join(publicDir, "images/products/door-hardware-locks", filename);
    const fileExists = fs.existsSync(diskPath);
    assert(fileExists, `${prod.id} image exists on disk: ${filename}`);

    if (fileExists) {
      const buf = fs.readFileSync(diskPath);
      const sha256 = getSha256(buf);
      const relKey = `images/products/door-hardware-locks/${filename}`;
      const inManifest = !!manifest[relKey];
      assert(inManifest, `${prod.id} image recorded in manifest: ${relKey}`);
      if (inManifest) {
        assert(manifest[relKey].sha256 === sha256, `${prod.id} image SHA-256 matches manifest (${sha256.substring(0, 8)}...)`);
      }

      // Metadata dimensions check
      const meta = await sharp(diskPath).metadata();
      assert(meta.format === "webp", `${prod.id} image is WebP format`);
      assert(meta.width === 800 && meta.height === 800, `${prod.id} image is exactly 800x800 (${meta.width}x${meta.height})`);
    }
  }

  // Frontend and backend exact matching
  for (const feProd of feProducts) {
    const dataProd = ALL_26_DOOR_HARDWARE_PRODUCTS.find((p) => p.id === feProd.id);
    assert(!!dataProd, `Frontend catalog item ${feProd.id} exists in doorHardwareData`);
    if (dataProd) {
      assert(feProd.price === dataProd.price, `Frontend item ${feProd.id} price matches data`);
      assert(feProd.hsnCode === dataProd.hsnCode, `Frontend item ${feProd.id} HSN matches data`);
    }
  }

  for (const beProd of beProducts) {
    const dataProd = ALL_26_DOOR_HARDWARE_PRODUCTS.find((p) => p.id === beProd.id);
    assert(!!dataProd, `Backend catalog item ${beProd.id} exists in doorHardwareData`);
    if (dataProd) {
      assert(beProd.price === dataProd.price, `Backend item ${beProd.id} price matches data`);
      assert(beProd.hsnCode === dataProd.hsnCode, `Backend item ${beProd.id} HSN matches data`);
    }
  }

  console.log("================================================================================");
  console.log(`TOTAL PASSES: ${passes} | FAILURES: ${failures}`);
  console.log("================================================================================");

  if (failures > 0) {
    console.error("❌ DOOR HARDWARE & LOCKS VALIDATION FAILED!");
    process.exit(1);
  } else {
    console.log("✅ DOOR HARDWARE & LOCKS VALIDATION SUITE PASSED 100%!");
  }
}

validateAllProducts().catch((err) => {
  console.error("Fatal error running validation:", err);
  process.exit(1);
});
