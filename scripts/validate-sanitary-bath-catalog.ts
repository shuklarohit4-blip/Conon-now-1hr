import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { ALL_28_SANITARY_BATH_PRODUCTS } from "../artifacts/conon/src/data/sanitaryBathData";
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
console.log(" CONON-NOW: SANITARY & BATH FITTINGS 28-SKU VALIDATION SUITE                   ");
console.log("================================================================================");

// 1. Array count checks
assert(
  ALL_28_SANITARY_BATH_PRODUCTS.length === 28,
  `ALL_28_SANITARY_BATH_PRODUCTS length is ${ALL_28_SANITARY_BATH_PRODUCTS.length}, expected 28`
);

const feProducts = CATALOG_PRODUCTS.filter((p) => p.categorySlug === "sanitary-bath-fittings");
assert(
  feProducts.length === 28,
  `Frontend CATALOG_PRODUCTS with slug 'sanitary-bath-fittings' is ${feProducts.length}, expected 28`
);

const beProducts = BACKEND_PRODUCTS.filter((p) => p.categorySlug === "sanitary-bath-fittings");
assert(
  beProducts.length === 28,
  `Backend CATALOG_PRODUCTS with slug 'sanitary-bath-fittings' is ${beProducts.length}, expected 28`
);

// 2. Subcategory breakdown
const subcatCounts: Record<string, number> = {};
for (const p of ALL_28_SANITARY_BATH_PRODUCTS) {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
}

assert(
  subcatCounts["Wall-Hung WCs & One-Piece Commodes"] === 6,
  `Subcategory 'Wall-Hung WCs & One-Piece Commodes' count is ${subcatCounts["Wall-Hung WCs & One-Piece Commodes"]}, expected 6`
);
assert(
  subcatCounts["Concealed Cisterns & Dual-Flush Plates"] === 5,
  `Subcategory 'Concealed Cisterns & Dual-Flush Plates' count is ${subcatCounts["Concealed Cisterns & Dual-Flush Plates"]}, expected 5`
);
assert(
  subcatCounts["Countertop & Vanity Ceramic Basins"] === 6,
  `Subcategory 'Countertop & Vanity Ceramic Basins' count is ${subcatCounts["Countertop & Vanity Ceramic Basins"]}, expected 6`
);
assert(
  subcatCounts["Shower Diverters, Rain Showers & Spouts"] === 6,
  `Subcategory 'Shower Diverters, Rain Showers & Spouts' count is ${subcatCounts["Shower Diverters, Rain Showers & Spouts"]}, expected 6`
);
assert(
  subcatCounts["Health Faucets, Angle Valves & Bath Brassware"] === 5,
  `Subcategory 'Health Faucets, Angle Valves & Bath Brassware' count is ${subcatCounts["Health Faucets, Angle Valves & Bath Brassware"]}, expected 5`
);

// 3. Category in CATALOG_CATEGORIES
const cat = CATALOG_CATEGORIES.find((c) => c.slug === "sanitary-bath-fittings");
assert(!!cat, "Category 'sanitary-bath-fittings' exists in CATALOG_CATEGORIES");
assert(cat?.subcategories?.length === 5, `Category subcategories count is ${cat?.subcategories?.length}, expected 5`);

// 4. Master Specifications Check for All 28 SKUs
const EXPECTED_PRODUCTS: Record<
  string,
  {
    price: number;
    exGstPrice: number;
    hsnCode: string;
    vehicle: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
    subcatCode:
      | "WALL_HUNG_AND_ONE_PIECE_WC"
      | "CONCEALED_CISTERN_FLUSH_PLATE"
      | "COUNTERTOP_CERAMIC_BASIN"
      | "DIVERTER_SHOWER_SPOUT"
      | "FAUCET_VALVE_ACCESSORY";
    mountingType: string;
    trapSpec: string;
    oemModelCode?: string;
  }
> = {
  // Subcat 1: Wall-Hung WCs & Commodes (6 SKUs)
  "prod-san-jaquar-kubix-prime-rimless-wc": {
    price: 9450,
    exGstPrice: 8008,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "WALL_HUNG_AND_ONE_PIECE_WC",
    mountingType: "WALL_HUNG",
    trapSpec: "P-Trap 180mm",
    oemModelCode: "KWS-WHT-01",
  },
  "prod-san-cera-victor-one-piece-s-trap": {
    price: 6990,
    exGstPrice: 5924,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "WALL_HUNG_AND_ONE_PIECE_WC",
    mountingType: "FLOOR_MOUNT_S_TRAP",
    trapSpec: "S-Trap 300mm Floor Outlet",
    oemModelCode: "S1013101",
  },
  "prod-san-parryware-cruz-wall-mounted-wc": {
    price: 7490,
    exGstPrice: 6347,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "WALL_HUNG_AND_ONE_PIECE_WC",
    mountingType: "WALL_HUNG",
    trapSpec: "P-Trap 180mm",
    oemModelCode: "C0279",
  },
  "prod-san-hindware-element-one-piece-wc": {
    price: 7850,
    exGstPrice: 6653,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "WALL_HUNG_AND_ONE_PIECE_WC",
    mountingType: "FLOOR_MOUNT_S_TRAP",
    trapSpec: "S-Trap 300mm Core Fit",
    oemModelCode: "20021",
  },
  "prod-san-kohler-veil-wall-hung-wc": {
    price: 22990,
    exGstPrice: 19483,
    hsnCode: "6910",
    vehicle: "E-Loader / Pickup",
    subcatCode: "WALL_HUNG_AND_ONE_PIECE_WC",
    mountingType: "WALL_HUNG",
    trapSpec: "P-Trap 180mm",
    oemModelCode: "K-21782IN",
  },
  "prod-san-cera-calisto-rimless-wall-hung": {
    price: 8200,
    exGstPrice: 6949,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "WALL_HUNG_AND_ONE_PIECE_WC",
    mountingType: "WALL_HUNG",
    trapSpec: "P-Trap 180mm",
    oemModelCode: "S1043151",
  },

  // Subcat 2: Concealed Cisterns & Dual-Flush Plates (5 SKUs)
  "prod-san-jaquar-cistern-frame-tank": {
    price: 4850,
    exGstPrice: 4110,
    hsnCode: "3922",
    vehicle: "E-Loader",
    subcatCode: "CONCEALED_CISTERN_FLUSH_PLATE",
    mountingType: "CONCEALED_IN_WALL",
    trapSpec: "Fits 180mm / 230mm Wall-Hung WC Bolts",
    oemModelCode: "JCC-WHT-01",
  },
  "prod-san-cera-slim-cistern-tank-80mm": {
    price: 4290,
    exGstPrice: 3636,
    hsnCode: "3922",
    vehicle: "E-Loader",
    subcatCode: "CONCEALED_CISTERN_FLUSH_PLATE",
    mountingType: "CONCEALED_IN_WALL",
    trapSpec: "Fits 180mm WC Mounting Centers",
    oemModelCode: "F8015101",
  },
  "prod-san-jaquar-kubix-flush-plate-chr": {
    price: 1450,
    exGstPrice: 1229,
    hsnCode: "3922",
    vehicle: "2-Wheeler",
    subcatCode: "CONCEALED_CISTERN_FLUSH_PLATE",
    mountingType: "WALL_SURFACE",
    trapSpec: "Fits Jaquar Mechanical Concealed Cisterns",
    oemModelCode: "JCP-CHR-01",
  },
  "prod-san-jaquar-alive-flush-plate-blk": {
    price: 2290,
    exGstPrice: 1941,
    hsnCode: "3922",
    vehicle: "2-Wheeler",
    subcatCode: "CONCEALED_CISTERN_FLUSH_PLATE",
    mountingType: "WALL_SURFACE",
    trapSpec: "Fits Jaquar Pneumatic Concealed Cisterns",
    oemModelCode: "JCP-BLM-02",
  },
  "prod-san-cera-qtype-flush-plate-chr": {
    price: 1150,
    exGstPrice: 975,
    hsnCode: "3922",
    vehicle: "2-Wheeler",
    subcatCode: "CONCEALED_CISTERN_FLUSH_PLATE",
    mountingType: "WALL_SURFACE",
    trapSpec: "Fits Cera Slim & Standard Concealed Cisterns",
    oemModelCode: "F8020101",
  },

  // Subcat 3: Countertop & Vanity Ceramic Basins (6 SKUs)
  "prod-san-cera-careo-thin-rim-basin": {
    price: 3250,
    exGstPrice: 2754,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "COUNTERTOP_CERAMIC_BASIN",
    mountingType: "TABLETOP_COUNTER",
    trapSpec: "Fits Standard 32mm Waste Coupling",
    oemModelCode: "S2040112",
  },
  "prod-san-jaquar-continental-thin-rim-basin": {
    price: 4150,
    exGstPrice: 3517,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "COUNTERTOP_CERAMIC_BASIN",
    mountingType: "TABLETOP_COUNTER",
    trapSpec: "Fits 32mm Pop-Up Waste Coupling",
    oemModelCode: "JBS-WHT-01",
  },
  "prod-san-parryware-jordon-basin": {
    price: 2890,
    exGstPrice: 2449,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "COUNTERTOP_CERAMIC_BASIN",
    mountingType: "TABLETOP_COUNTER",
    trapSpec: "Fits 32mm Waste Coupling",
    oemModelCode: "C0485",
  },
  "prod-san-hindware-venice-round-basin": {
    price: 3450,
    exGstPrice: 2924,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "COUNTERTOP_CERAMIC_BASIN",
    mountingType: "TABLETOP_COUNTER",
    trapSpec: "Fits 32mm Waste Coupling",
    oemModelCode: "10045",
  },
  "prod-san-kohler-forefront-basin": {
    price: 11990,
    exGstPrice: 10161,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "COUNTERTOP_CERAMIC_BASIN",
    mountingType: "TABLETOP_COUNTER",
    trapSpec: "Fits 32mm Pop-Up Drain",
    oemModelCode: "K-2660X-1",
  },
  "prod-san-cera-victor-corner-basin": {
    price: 1490,
    exGstPrice: 1263,
    hsnCode: "6910",
    vehicle: "E-Loader",
    subcatCode: "COUNTERTOP_CERAMIC_BASIN",
    mountingType: "WALL_HUNG",
    trapSpec: "Fits 32mm Bottle Trap or PVC Waste Pipe",
    oemModelCode: "S2010101",
  },

  // Subcat 4: Shower Diverters, Rain Showers & Spouts (6 SKUs)
  "prod-san-jaquar-highflow-diverter-body": {
    price: 3150,
    exGstPrice: 2669,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "DIVERTER_SHOWER_SPOUT",
    mountingType: "CONCEALED_IN_WALL",
    trapSpec: "1/2\" & 3/4\" High-Flow BSP Inlets",
    oemModelCode: "AQC-CHR-079N",
  },
  "prod-san-jaquar-kubix-diverter-trim-kit": {
    price: 2209,
    exGstPrice: 1872,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "DIVERTER_SHOWER_SPOUT",
    mountingType: "WALL_SURFACE",
    trapSpec: "Fits Jaquar High-Flow Concealed Diverter Body",
    oemModelCode: "KLP-CHR-35079",
  },
  "prod-san-jaquar-alive-diverter-trim-kit": {
    price: 2490,
    exGstPrice: 2110,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "DIVERTER_SHOWER_SPOUT",
    mountingType: "WALL_SURFACE",
    trapSpec: "Fits Jaquar High-Flow Concealed Diverter Body",
    oemModelCode: "ALV-CHR-34065",
  },
  "prod-san-jaquar-maze-hand-shower-120mm": {
    price: 1822,
    exGstPrice: 1544,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "DIVERTER_SHOWER_SPOUT",
    mountingType: "WALL_SURFACE",
    trapSpec: "Standard 1/2\" BSP Thread",
    oemModelCode: "MSH-CHR-120",
  },
  "prod-san-jaquar-rain-shower-8in": {
    price: 2850,
    exGstPrice: 2415,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "DIVERTER_SHOWER_SPOUT",
    mountingType: "WALL_SURFACE",
    trapSpec: "1/2\" BSP Female Swivel Ball Joint",
    oemModelCode: "OHS-CHR-1755",
  },
  "prod-san-jaquar-kubix-bath-spout": {
    price: 1890,
    exGstPrice: 1602,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "DIVERTER_SHOWER_SPOUT",
    mountingType: "WALL_SURFACE",
    trapSpec: "1/2\" BSP Male Thread Wall Mount",
    oemModelCode: "KUP-CHR-35429",
  },

  // Subcat 5: Health Faucets, Angle Valves & Bath Brassware (5 SKUs)
  "prod-san-jaquar-health-faucet-abs": {
    price: 1120,
    exGstPrice: 949,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "FAUCET_VALVE_ACCESSORY",
    mountingType: "WALL_SURFACE",
    trapSpec: "1/2\" BSP Standard Thread",
    oemModelCode: "ALD-CHR-565",
  },
  "prod-san-cera-garnet-2way-bibcock": {
    price: 1260,
    exGstPrice: 1068,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "FAUCET_VALVE_ACCESSORY",
    mountingType: "WALL_SURFACE",
    trapSpec: "1/2\" BSP Thread Inlet with Dual Outlets",
    oemModelCode: "F2002153",
  },
  "prod-san-jaquar-florentine-angle-cock": {
    price: 850,
    exGstPrice: 720,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "FAUCET_VALVE_ACCESSORY",
    mountingType: "WALL_SURFACE",
    trapSpec: "1/2\" BSP Male × 1/2\" BSP Male",
    oemModelCode: "FLR-CHR-5053",
  },
  "prod-san-cera-bottle-trap-32mm": {
    price: 2016,
    exGstPrice: 1708,
    hsnCode: "8481",
    vehicle: "2-Wheeler",
    subcatCode: "FAUCET_VALVE_ACCESSORY",
    mountingType: "WALL_SURFACE",
    trapSpec: "32mm (1.25\") Standard Waste Connection",
    oemModelCode: "F8040101",
  },
  "prod-san-futura-linear-drain-600mm": {
    price: 2450,
    exGstPrice: 2076,
    hsnCode: "7324",
    vehicle: "2-Wheeler",
    subcatCode: "FAUCET_VALVE_ACCESSORY",
    mountingType: "FLOOR_MOUNT_S_TRAP",
    trapSpec: "50mm / 75mm SWR Drain Outlet",
    oemModelCode: "FLR-600",
  },
};

// 5. Image manifest check
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

async function runValidation() {
  for (const prod of ALL_28_SANITARY_BATH_PRODUCTS) {
    const exp = EXPECTED_PRODUCTS[prod.id];
    assert(!!exp, `Product ${prod.id} exists in expected master map`);
    if (!exp) continue;

    // Price & GST
    assert(prod.price === exp.price, `${prod.id}: Price is ${prod.price}, expected ${exp.price}`);
    assert(
      prod.exGstPrice === exp.exGstPrice,
      `${prod.id}: Ex-GST price is ${prod.exGstPrice}, expected ${exp.exGstPrice}`
    );
    assert(prod.gstPercent === 18, `${prod.id}: GST is 18%`);
    assert(prod.hsnCode === exp.hsnCode, `${prod.id}: HSN is ${prod.hsnCode}, expected ${exp.hsnCode}`);

    // Vehicle
    assert(
      prod.deliveryVehicleType === exp.vehicle,
      `${prod.id}: Vehicle is ${prod.deliveryVehicleType}, expected ${exp.vehicle}`
    );

    // Subcategory & Mounting
    assert(
      prod.sanitarySubcategory === exp.subcatCode,
      `${prod.id}: sanitarySubcategory is ${prod.sanitarySubcategory}, expected ${exp.subcatCode}`
    );
    assert(
      prod.mountingType === exp.mountingType,
      `${prod.id}: mountingType is ${prod.mountingType}, expected ${exp.mountingType}`
    );
    assert(
      prod.trapOrWasteSpec === exp.trapSpec,
      `${prod.id}: trapOrWasteSpec is ${prod.trapOrWasteSpec}, expected ${exp.trapSpec}`
    );

    // OEM Code if defined
    if (exp.oemModelCode) {
      assert(
        prod.oemModelCode === exp.oemModelCode,
        `${prod.id}: oemModelCode is ${prod.oemModelCode}, expected ${exp.oemModelCode}`
      );
    }

    // Image Verification
    const relKey = `images/products/sanitary-bath-fittings/${prod.slug}.webp`;
    assert(prod.image === `/${relKey}`, `${prod.id}: image path is /${relKey}`);

    const fullImgPath = path.join(publicDir, relKey);
    assert(fs.existsSync(fullImgPath), `${prod.id}: Image file exists on disk at ${relKey}`);

    if (fs.existsSync(fullImgPath)) {
      const meta = await sharp(fullImgPath).metadata();
      assert(
        meta.width === 800 && meta.height === 800 && meta.format === "webp",
        `${prod.id}: Image is 800x800 WebP (got ${meta.width}x${meta.height} ${meta.format})`
      );

      const fileBuf = fs.readFileSync(fullImgPath);
      const actualHash = getSha256(fileBuf);

      const manifestEntry = manifest[relKey];
      assert(!!manifestEntry, `${prod.id}: Manifest entry exists for ${relKey}`);
      if (manifestEntry) {
        assert(
          manifestEntry.sha256 === actualHash,
          `${prod.id}: SHA-256 match (Manifest: ${manifestEntry.sha256?.substring(0, 10)}..., Disk: ${actualHash.substring(0, 10)}...)`
        );
      }
    }
  }

  console.log("================================================================================");
  console.log(`VALIDATION RESULTS: ${passes} PASSED, ${failures} FAILED`);
  console.log("================================================================================");

  if (failures > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL CHECKS PASSED PERFECTLY!");
  }
}

runValidation().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
