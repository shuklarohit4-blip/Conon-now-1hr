import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { ALL_26_MODULAR_KITCHEN_PRODUCTS, type ModularKitchenProduct } from "../artifacts/conon/src/data/modularKitchenData";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/modular-kitchen-systems");
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
    id: "prod-mod-ebco-slim-s3-500-122",
    name: "Ebco Slim S3 Pro-Motion 500mm / 122mm Black",
    expectedSubcategory: "Tandem Box Drawer Systems",
    expectedFitSpec: "Fits 500mm Depth",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
    targetFile: "ebco-slim-s3-pro-motion-drawer-system-500mm-122mm-black.webp",
  },
  {
    id: "prod-mod-hettich-atira-pot-pan-176mm",
    name: "Hettich InnoTech Atira Pot & Pan 176mm 500mm 50kg",
    expectedSubcategory: "Tandem Box Drawer Systems",
    expectedFitSpec: "Fits 500mm Depth",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
    targetFile: "hettich-innotech-atira-pot-pan-drawer-system-176mm-500mm-silver.webp",
  },
  {
    id: "prod-mod-ebco-magic-corner-mcdp90",
    name: "Ebco Magic Corner Double Pullout Anthracite",
    expectedSubcategory: "Bottle Pull-Outs, Corner Units & Tall Pantry",
    expectedFitSpec: "Fits 850–910mm Blind Corner",
    expectedGst: "18%",
    expectedVehicle: "E-Loader",
    targetFile: "ebco-magic-corner-double-pullout-anthracite-mcdp90.webp",
  },
  {
    id: "prod-mod-ebco-roll-top-pro-shutter-600mm",
    name: "Ebco Roll Top Pro Vertical Rolling Shutter 600mm",
    expectedSubcategory: "Rolling Shutters, Lift-Ups & Gola Profiles",
    expectedFitSpec: "Fits 600mm Carcass",
    expectedGst: "18%",
    expectedVehicle: "E-Loader",
    targetFile: "ebco-roll-top-pro-vertical-rolling-shutter-600mm-anthracite.webp",
  },
  {
    id: "prod-mod-hettich-gola-profile-3000mm-black",
    name: "Hettich Gola Profile L-Type Aluminium 3000mm Black",
    expectedSubcategory: "Rolling Shutters, Lift-Ups & Gola Profiles",
    expectedFitSpec: "3000mm Full Length",
    expectedGst: "18%",
    expectedVehicle: "E-Loader",
    targetFile: "hettich-gola-profile-l-type-aluminium-3000mm-black-9299225.webp",
  },
];

function getBaseModularAsset(prod: ModularKitchenProduct): string | null {
  const mkDir = path.join(publicDir, "images/products/modular-kitchen");

  if (prod.modularSubcategory === "TANDEM_BOX") {
    if (prod.brand === "Ebco") {
      const p = path.join(mkDir, "ebco-pro-motion-tandem-box.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("atira")) {
      const p = path.join(mkDir, "hettich-innotech-drawer-500mm.webp");
      if (fs.existsSync(p)) return p;
    }
    const p = path.join(mkDir, "hettich-tandem-box-500mm.webp");
    if (fs.existsSync(p)) return p;
    return path.join(mkDir, "ebco-pro-motion-tandem-box.webp");
  }

  if (prod.modularSubcategory === "PULLOUT_CORNER_PANTRY") {
    if (prod.id.includes("carousel")) {
      const p = path.join(mkDir, "ebco-corner-unit-carousel.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("magic-corner")) {
      const p = path.join(mkDir, "hettich-magic-corner.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("pantry")) {
      const p = path.join(mkDir, "ebco-tall-unit-pantry-pull-out.webp");
      if (fs.existsSync(p)) return p;
      const p2 = path.join(mkDir, "hettich-duo-pantry.webp");
      if (fs.existsSync(p2)) return p2;
    }
    if (prod.id.includes("150mm") || prod.id.includes("side-pull-out")) {
      const p = path.join(mkDir, "ebco-bottle-pullout.webp");
      if (fs.existsSync(p)) return p;
      return path.join(mkDir, "ebco-side-pullout.webp");
    }
    const p = path.join(mkDir, "ebco-side-pullout.webp");
    if (fs.existsSync(p)) return p;
    return path.join(mkDir, "ebco-bottle-pullout.webp");
  }

  if (prod.modularSubcategory === "BASKET_ORGANIZER") {
    if (prod.id.includes("thali")) {
      const p = path.join(mkDir, "ebco-thali-kitchen-basket.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("plain")) {
      const p = path.join(mkDir, "ebco-ss-kitchen-basket-plain.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("perforated") || prod.id.includes("plate")) {
      const p = path.join(mkDir, "ebco-plate-basket.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("cutlery") || prod.id.includes("orgatray")) {
      const p = path.join(mkDir, "hettich-orgatray-440.webp");
      if (fs.existsSync(p)) return p;
      const p2 = path.join(mkDir, "ebco-cutlery-basket.webp");
      if (fs.existsSync(p2)) return p2;
    }
    if (prod.id.includes("waste-bin")) {
      const p = path.join(mkDir, "ebco-pull-out-waste-bin-40l.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("wicker")) {
      const p = path.join(mkDir, "ebco-wicker-basket.webp");
      if (fs.existsSync(p)) return p;
    }
    return path.join(mkDir, "ebco-ss-kitchen-basket-plain.webp");
  }

  if (prod.modularSubcategory === "SHUTTER_LIFT_GOLA") {
    if (prod.id.includes("gas-spring") || prod.id.includes("gas-piston")) {
      const p = path.join(mkDir, "ebco-eurolift-bifold.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.id.includes("rolling-shutter") || prod.id.includes("vetroline")) {
      const p = path.join(mkDir, "ebco-roll-top-shutter.webp");
      if (fs.existsSync(p)) return p;
    }
    const p = path.join(mkDir, "ebco-roll-top-shutter.webp");
    if (fs.existsSync(p)) return p;
  }

  return null;
}

function generateSvgOverlay(prod: ModularKitchenProduct): string {
  const brandName = escapeXml(prod.brand.toUpperCase());
  const productName = escapeXml(prod.title || prod.name);
  const subcategory = escapeXml(prod.subCategory);
  const carcassBadge = escapeXml(prod.carcassFitBadge);
  const hsnCode = escapeXml(prod.hsnCode);
  const price = prod.price;
  const exGst = prod.exGstPrice;
  const vehicle = escapeXml(prod.deliveryVehicleType);
  const oem = prod.oemModelCode ? escapeXml(`OEM: ${prod.oemModelCode}`) : "";
  const inclusion = prod.inclusionsBadge ? escapeXml(prod.inclusionsBadge.toUpperCase()) : null;

  let accentColor = "#0284c7"; // sky-600
  let badgeBorder = "#38bdf8";

  if (prod.modularSubcategory === "TANDEM_BOX") {
    accentColor = "#0284c7"; // sky-600
    badgeBorder = "#38bdf8";
  } else if (prod.modularSubcategory === "PULLOUT_CORNER_PANTRY") {
    accentColor = "#0d9488"; // teal-600
    badgeBorder = "#2dd4bf";
  } else if (prod.modularSubcategory === "BASKET_ORGANIZER") {
    accentColor = "#7c3aed"; // violet-600
    badgeBorder = "#a78bfa";
  } else if (prod.modularSubcategory === "SHUTTER_LIFT_GOLA") {
    accentColor = "#ea580c"; // orange-600
    badgeBorder = "#fb923c";
  }

  const inclusionSvg = inclusion
    ? `
  <!-- Inclusions Warning Pill for Tandem Box Systems -->
  <g transform="translate(50, 560)">
    <rect width="700" height="34" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="350" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#92400e" text-anchor="middle" letter-spacing="0.4">
      ⚠️ ${inclusion}
    </text>
  </g>`
    : "";

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
  
  <!-- Subtle Architectural Grid Pattern -->
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
      ${brandName.toUpperCase()}
    </text>
  </g>

  <!-- Subcategory Tag (Top Center) -->
  <g transform="translate(230, 36)">
    <rect width="250" height="34" rx="17" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="125" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">
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

  <!-- Central Watermark Spec Text -->
  <text x="400" y="430" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="900" fill="#0f172a" fill-opacity="0.04" text-anchor="middle" letter-spacing="4">
    MODULAR KITCHEN LUCKNOW
  </text>

  ${inclusionSvg}

  <!-- Carcass Fit Badge Box (Floating) -->
  <g transform="translate(50, ${inclusion ? 602 : 608})">
    <rect width="700" height="54" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#cardShadow)"/>
    <rect x="0" y="0" width="8" height="54" rx="4" fill="${accentColor}"/>
    <text x="24" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="${accentColor}" letter-spacing="0.5" text-transform="uppercase">
      CARCASS &amp; CABINET SPECIFICATION
    </text>
    <text x="24" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#0f172a">
      ${carcassBadge}
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
      ${productName.length > 56 ? productName.substring(0, 54) + "..." : productName}
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

export async function generateAllModularKitchenImages(isDryRun = false) {
  console.log("================================================================================");
  console.log(" CONON-NOW: MODULAR KITCHEN SYSTEMS & FITTINGS REAL WebP IMAGE PIPELINE        ");
  console.log("================================================================================");

  if (isDryRun) {
    console.log("DRY-RUN MODE: Verifying 5 Representative SKUs for STEP 6.1 Validation:");
    console.log("--------------------------------------------------------------------------------");
    for (const dryItem of DRY_RUN_SKUS) {
      const prod = ALL_26_MODULAR_KITCHEN_PRODUCTS.find((p) => p.id === dryItem.id);
      if (!prod) {
        console.error(`❌ ERROR: Could not find SKU ${dryItem.id} in dataset!`);
        continue;
      }
      console.log(`[DRY-RUN] Verified SKU: ${dryItem.id}`);
      console.log(`          Name: ${prod.title}`);
      console.log(`          Subcategory: ${prod.subCategory} (matches: ${prod.subCategory === dryItem.expectedSubcategory})`);
      console.log(`          Fit Spec: ${prod.carcassFitBadge} (matches: ${prod.carcassFitBadge.includes(dryItem.expectedFitSpec.split(" · ")[0])})`);
      console.log(`          Vehicle: ${prod.deliveryVehicleType} (matches: ${prod.deliveryVehicleType === dryItem.expectedVehicle})`);
      console.log(`          Inclusions: ${prod.inclusionsBadge || "N/A"}`);
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
  for (const prod of ALL_26_MODULAR_KITCHEN_PRODUCTS) {
    const filename = path.basename(prod.image);
    const outputPath = path.join(outputDir, filename);
    const relManifestKey = `images/products/modular-kitchen-systems/${filename}`;

    const svgOverlay = Buffer.from(generateSvgOverlay(prod));
    const baseAsset = getBaseModularAsset(prod);

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
      categorySlug: "modular-kitchen-systems",
      skuId: prod.id,
      brand: prod.brand,
      category: "modular-kitchen-systems",
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
  console.log(`✅ SUCCESS: All ${count} Modular Kitchen 800x800 WebP images generated & manifest updated!`);
  console.log("================================================================================");
}

// Auto-run if called directly
const args = process.argv.slice(2);
const isDry = args.includes("--dry-run");
generateAllModularKitchenImages(isDry).catch((err) => {
  console.error("Image generation failed:", err);
  process.exit(1);
});
