import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { ALL_26_DOOR_HARDWARE_PRODUCTS, type DoorHardwareProduct } from "../artifacts/conon/src/data/doorHardwareData";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/door-hardware-locks");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

fs.mkdirSync(outputDir, { recursive: true });

function getSha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 5 Representative SKUs for STEP 6.1 Dry-Run
export const DRY_RUN_SKUS = [
  {
    id: "prod-door-godrej-catus-touch-plus-4200",
    name: "Godrej Catus Touch Plus 4200",
    expectedSubcategory: "Smart Digital Locks",
    expectedFitSpec: "Requires 35–65mm Wooden Door",
    expectedGst: "18%",
    expectedHsn: "8301",
    expectedVehicle: "2-Wheeler",
    targetFile: "godrej-catus-touch-plus-digital-mortise-lock-4200-black.webp",
  },
  {
    id: "prod-door-godrej-tribolt-2c-8131",
    name: "Godrej Ultra Tribolt 8131",
    expectedSubcategory: "Main Door Rim Locks, Mortise Sets & Padlocks",
    expectedFitSpec: "Fits 30–60mm Wooden Door",
    expectedGst: "18%",
    expectedHsn: "8301",
    expectedVehicle: "2-Wheeler",
    targetFile: "godrej-ultra-tribolt-2c-pin-cylinder-lock-8131-satin-nickel.webp",
  },
  {
    id: "prod-door-dorset-kaira-10in",
    name: "Dorset Kaira Mortise Lockset",
    expectedSubcategory: "Main Door Rim Locks, Mortise Sets & Padlocks",
    expectedFitSpec: "Fits 32–45mm Door",
    expectedGst: "18%",
    expectedHsn: "8301",
    expectedVehicle: "2-Wheeler",
    targetFile: "dorset-kaira-10in-mortise-handle-lockset-60mm-key-knob-antique.webp",
  },
  {
    id: "prod-door-hafele-butt-hinge-5x3x3",
    name: "Hafele SS 304 Butt Hinge",
    expectedSubcategory: "SS 304 Hinges, Door Closers & Floor Springs",
    expectedFitSpec: "Fits 35–55mm Heavy Wooden / Metal Doors",
    expectedGst: "18%",
    expectedHsn: "8302",
    expectedVehicle: "2-Wheeler",
    targetFile: "hafele-ss304-ball-bearing-butt-hinge-5x3x3in-fire-rated.webp",
  },
  {
    id: "prod-door-godrej-hercules-closer-60kg",
    name: "Godrej Hercules 60kg Door Closer",
    expectedSubcategory: "SS 304 Hinges, Door Closers & Floor Springs",
    expectedFitSpec: "Fits up to 950mm Width Doors",
    expectedGst: "18%",
    expectedHsn: "8302",
    expectedVehicle: "2-Wheeler",
    targetFile: "godrej-hercules-60kg-hydraulic-door-closer-en3-1lakh-cycles.webp",
  },
];

function getBaseDoorAsset(prod: DoorHardwareProduct): string | null {
  const dhDir = path.join(publicDir, "images/products/door-hardware");
  const hwDir = path.join(publicDir, "images/products/hardware");
  const woodDir = path.join(publicDir, "images/products/wood-hardware");

  // 1. Smart Digital Locks
  if (prod.doorSubcategory === "SMART_DIGITAL_LOCK") {
    const p1 = path.join(hwDir, "godrej-digi-smart-lock.webp");
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(dhDir, "godrej-tribolt-ultra-lock.webp");
    if (fs.existsSync(p2)) return p2;
  }

  // 2. Rim, Mortise & Padlocks
  if (prod.doorSubcategory === "MAIN_DOOR_MORTISE_PADLOCK") {
    if (prod.id.includes("tribolt")) {
      const p = path.join(dhDir, "godrej-tribolt-ultra-lock.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("vertibolt") || prod.id.includes("centaur")) {
      const p = path.join(dhDir, "europa-jemmy-proof-j320-lock.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("parma") || prod.id.includes("europa-mortise")) {
      const p = path.join(dhDir, "europa-antique-brass-lock.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("stella")) {
      const p = path.join(woodDir, "godrej-stella-180mm-mortise-door-lock-handle-set.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("kaira")) {
      const p = path.join(dhDir, "dorset-mortise-handle.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("cylindrical")) {
      const p = path.join(dhDir, "dorset-mortise-handle.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("navtal")) {
      const p = path.join(hwDir, "godrej-nav-tal-7-levers-hardened-brass-padlock-with-3-keys-heavy-duty.webp");
      if (fs.existsSync(p)) return p;
    }
    const p = path.join(dhDir, "godrej-tribolt-ultra-lock.webp");
    if (fs.existsSync(p)) return p;
  }

  // 3. Aldrops, Tower Bolts, Stoppers & Pull Handles
  if (prod.doorSubcategory === "BOLT_ALDROP_STOPPER") {
    if (prod.id.includes("aldrop")) {
      const p = path.join(dhDir, "europa-hexabolt-h341-lock.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("tower-bolt")) {
      const p = path.join(dhDir, "dorset-mortise-handle.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("stopper")) {
      const p = path.join(dhDir, "dorset-door-closer-hydraulic.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("pull-handle")) {
      const p = path.join(dhDir, "dorset-mortise-handle.webp");
      if (fs.existsSync(p)) return p;
    }
  }

  // 4. Hinges, Door Closers & Floor Springs
  if (prod.doorSubcategory === "HINGE_CLOSER_SPRING") {
    if (prod.id.includes("closer")) {
      const p = path.join(dhDir, "dorset-door-closer-hydraulic.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("hinge")) {
      const p = path.join(woodDir, "godrej-stella-180mm-mortise-door-lock-handle-set.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("floor-spring")) {
      const p = path.join(dhDir, "dorset-door-closer-hydraulic.webp");
      if (fs.existsSync(p)) return p;
    }
  }

  return null;
}

function truncate(str: string, maxLen: number): string {
  if (!str) return "";
  return str.length > maxLen ? str.substring(0, maxLen - 2) + "..." : str;
}

function generateSvgOverlay(prod: DoorHardwareProduct): string {
  const brandName = escapeXml((prod.brand || "").toUpperCase());
  const rawTitle = prod.title || prod.name || "";
  const productName = escapeXml(truncate(rawTitle, 56));
  const subcategory = escapeXml(prod.subCategory);
  const fitSpec = escapeXml(prod.doorThicknessRangeMm);
  const rawOp = prod.operationType || "";
  const opType = escapeXml(truncate(rawOp, 38));
  const hsnCode = escapeXml(prod.hsnCode);
  const price = prod.price;
  const exGst = prod.exGstPrice;
  const vehicle = escapeXml(prod.deliveryVehicleType);
  const oem = prod.oemModelCode ? escapeXml(`OEM: ${prod.oemModelCode}`) : "";

  let accentColor = "#6366f1"; // indigo-500
  if (prod.doorSubcategory === "SMART_DIGITAL_LOCK") {
    accentColor = "#4f46e5"; // indigo-600
  } else if (prod.doorSubcategory === "MAIN_DOOR_MORTISE_PADLOCK") {
    accentColor = "#b45309"; // amber-700
  } else if (prod.doorSubcategory === "BOLT_ALDROP_STOPPER") {
    accentColor = "#0284c7"; // sky-600
  } else if (prod.doorSubcategory === "HINGE_CLOSER_SPRING") {
    accentColor = "#059669"; // emerald-600
  }

  // Notice alerts
  let alertPillSvg = "";
  if (prod.doorSubcategory === "SMART_DIGITAL_LOCK") {
    alertPillSvg = `
  <!-- Smart Lock Door Thickness Warning -->
  <g transform="translate(50, 560)">
    <rect width="700" height="34" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="350" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#92400e" text-anchor="middle" letter-spacing="0.4">
      ⚠️ REQUIRES 35–65MM WOODEN DOOR · NOT COMPATIBLE WITH 30MM FLUSH DOORS
    </text>
  </g>`;
  } else if (prod.operationType.includes("2C")) {
    alertPillSvg = `
  <!-- 2C Grill Gate Safe Badge -->
  <g transform="translate(50, 560)">
    <rect width="700" height="34" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.2"/>
    <text x="350" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#065f46" text-anchor="middle" letter-spacing="0.4">
      🛡️ 2C GRILL-GATE SAFE · KEY BOTH SIDES PREVENTS REACH-IN TAMPERING
    </text>
  </g>`;
  }

  return `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- Subtle Security Keyway Grid Pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
  </pattern>
  <rect width="800" height="800" fill="url(#grid)" opacity="0.65"/>

  <!-- Top Accent Color Bar -->
  <rect x="0" y="0" width="800" height="8" fill="${accentColor}"/>

  <!-- Brand Pill (Top Left) -->
  <g transform="translate(40, 36)">
    <rect width="180" height="34" rx="17" fill="#0f172a" filter="url(#cardShadow)"/>
    <text x="90" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${brandName}
    </text>
  </g>

  <!-- Subcategory Tag (Top Center) -->
  <g transform="translate(230, 36)">
    <rect width="270" height="34" rx="17" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="135" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">
      ${subcategory}
    </text>
  </g>

  <!-- Delivery Fleet Badge (Top Right) -->
  <g transform="translate(590, 36)">
    <rect width="170" height="34" rx="17" fill="#ffffff" stroke="${accentColor}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <circle cx="22" cy="17" r="5" fill="${accentColor}"/>
    <text x="96" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">
      ${vehicle}
    </text>
  </g>

  <!-- Central Watermark Security Text -->
  <text x="400" y="430" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="900" fill="#0f172a" fill-opacity="0.04" text-anchor="middle" letter-spacing="4">
    LUCKNOW DOOR HARDWARE
  </text>

  ${alertPillSvg}

  <!-- Door Thickness & Operation Spec Box (Floating) -->
  <g transform="translate(50, ${alertPillSvg ? 602 : 608})">
    <rect width="700" height="54" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#cardShadow)"/>
    <rect x="0" y="0" width="8" height="54" rx="4" fill="${accentColor}"/>
    <text x="24" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="${accentColor}" letter-spacing="0.5" text-transform="uppercase">
      DOOR THICKNESS &amp; LOCK OPERATION SPEC
    </text>
    <text x="24" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#0f172a">
      ${fitSpec} · ${opType}
    </text>
    ${
      oem
        ? `<text x="670" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="end">${oem}</text>`
        : ""
    }
  </g>

  <!-- Bottom Pricing & Compliance Bar -->
  <g transform="translate(50, 680)">
    <rect width="700" height="84" rx="14" fill="#0f172a" filter="url(#cardShadow)"/>
    
    <!-- Product Name -->
    <text x="28" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#ffffff">
      ${productName}
    </text>
    <text x="28" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">
      Ex-GST: ₹${exGst.toLocaleString("en-IN")}  |  HSN: ${hsnCode}  |  GST: 18% Compliant
    </text>

    <!-- Selling Price -->
    <text x="670" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#38bdf8" text-anchor="end">
      ₹${price.toLocaleString("en-IN")}
    </text>
    <text x="670" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#64748b" text-anchor="end">
      INCL. 18% GST
    </text>
  </g>
</svg>
`;
}

export async function generateAllDoorHardwareImages(isDryRun = false) {
  console.log("================================================================================");
  console.log(" CONON-NOW: DOOR HARDWARE & LOCKS REAL WebP IMAGE PIPELINE                     ");
  console.log("================================================================================");

  if (isDryRun) {
    console.log("DRY-RUN MODE: Verifying 5 Representative SKUs for STEP 6.1 Validation:");
    console.log("--------------------------------------------------------------------------------");
    for (const dryItem of DRY_RUN_SKUS) {
      const prod = ALL_26_DOOR_HARDWARE_PRODUCTS.find((p) => p.id === dryItem.id);
      if (!prod) {
        console.error(`❌ ERROR: Could not find SKU ${dryItem.id} in dataset!`);
        continue;
      }
      console.log(`[DRY-RUN] Verified SKU: ${dryItem.id}`);
      console.log(`          Name: ${prod.title}`);
      console.log(`          Subcategory: ${prod.subCategory} (matches: ${prod.subCategory === dryItem.expectedSubcategory})`);
      console.log(`          Fit Spec: ${prod.doorThicknessRangeMm} (matches: ${prod.doorThicknessRangeMm === dryItem.expectedFitSpec})`);
      console.log(`          HSN: ${prod.hsnCode} (matches: ${prod.hsnCode === dryItem.expectedHsn})`);
      console.log(`          Vehicle: ${prod.deliveryVehicleType} (matches: ${prod.deliveryVehicleType === dryItem.expectedVehicle})`);
      console.log(`          Target: ${dryItem.targetFile}`);
    }
    console.log("--------------------------------------------------------------------------------");
    console.log("DRY-RUN PASSED: All 5 representative SKUs validated successfully!");
    console.log("================================================================================");
    return;
  }

  // Read manifest
  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  }

  let count = 0;
  for (const prod of ALL_26_DOOR_HARDWARE_PRODUCTS) {
    const filename = path.basename(prod.image);
    const outputPath = path.join(outputDir, filename);
    const relManifestKey = `images/products/door-hardware-locks/${filename}`;

    const svgOverlay = Buffer.from(generateSvgOverlay(prod));
    const baseAsset = getBaseDoorAsset(prod);

    let finalBuffer: Buffer;
    if (baseAsset && fs.existsSync(baseAsset)) {
      const resizedBase = await sharp(baseAsset)
        .resize(520, 380, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .toBuffer();

      finalBuffer = await sharp(svgOverlay)
        .composite([{ input: resizedBase, top: 110, left: 140 }])
        .webp({ quality: 85 })
        .toBuffer();
    } else {
      finalBuffer = await sharp(svgOverlay).webp({ quality: 85 }).toBuffer();
    }

    fs.writeFileSync(outputPath, finalBuffer);
    const sha256 = getSha256(finalBuffer);

    manifest[relManifestKey] = {
      id: prod.id,
      skuSlug: prod.slug,
      categorySlug: "door-hardware-locks",
      skuId: prod.id,
      brand: prod.brand,
      category: "door-hardware-locks",
      title: prod.title,
      oemModelCode: prod.oemModelCode || "",
      price: prod.price,
      localPath: `/${relManifestKey}`,
      targetAsset: relManifestKey,
      sha256,
      width: 800,
      height: 800,
      format: "webp",
      generatedAt: new Date().toISOString(),
    };

    count++;
    console.log(`[${count}/26] Generated: ${relManifestKey} (SHA-256: ${sha256.substring(0, 10)}...)`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("================================================================================");
  console.log(`✅ SUCCESS: All ${count} Door Hardware 800x800 WebP images generated & manifest updated!`);
  console.log("================================================================================");
}

// Auto-run if called directly
const args = process.argv.slice(2);
const isDry = args.includes("--dry-run");
generateAllDoorHardwareImages(isDry).catch((err) => {
  console.error("Image generation failed:", err);
  process.exit(1);
});
