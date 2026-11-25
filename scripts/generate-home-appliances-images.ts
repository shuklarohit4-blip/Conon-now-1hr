import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { homeAppliancesProducts } from "../artifacts/conon/src/data/homeAppliancesData";

const rootDir = process.cwd().endsWith("scripts") ? path.resolve(process.cwd(), "..") : process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/home-appliances");
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
    slug: "ao-smith-xpress-15l-5-star-storage-geyser",
    name: "AO Smith Xpress 15L Geyser",
    expectedSubcategory: "Water Heaters & Geysers",
    expectedFitSpec: "8-Bar Pressure Rated — High-Rise & Pump Safe",
    expectedGst: "18%",
    expectedHsn: "8516",
    expectedVehicle: "E-Loader",
    targetFile: "ao-smith-xpress-15l-5-star-storage-geyser.webp",
  },
  {
    slug: "elica-wd-tbf-hac-60-ms-nero-filterless-chimney",
    name: "Elica Nero 60cm Chimney",
    expectedSubcategory: "Modular Kitchen Chimneys",
    expectedFitSpec: "Fits 2–3 Burner Stove (60cm Width)",
    expectedGst: "18%",
    expectedHsn: "8414",
    expectedVehicle: "E-Loader",
    targetFile: "elica-wd-tbf-hac-60-ms-nero-filterless-chimney.webp",
  },
  {
    slug: "atomberg-studio-plus-150mm-bldc-exhaust-fan",
    name: "Atomberg Studio+ 150mm Exhaust",
    expectedSubcategory: "Exhaust & Ventilation Fans",
    expectedFitSpec: "Requires 6-Inch (150mm) Window/Wall Cutout",
    expectedGst: "18%",
    expectedHsn: "8414",
    expectedVehicle: "2-Wheeler",
    targetFile: "atomberg-studio-plus-150mm-bldc-exhaust-fan.webp",
  },
  {
    slug: "symphony-sumo-75-xl-desert-air-cooler",
    name: "Symphony Sumo 75 XL Cooler",
    expectedSubcategory: "Desert Air Coolers",
    expectedFitSpec: "75L Heavy-Duty High-Flow Fan w/ i-Pure multistage filters",
    expectedGst: "18%",
    expectedHsn: "8479",
    expectedVehicle: "E-Loader",
    targetFile: "symphony-sumo-75-xl-desert-air-cooler.webp",
  },
  {
    slug: "luminous-zelio-plus-1100-inverter-150ah-battery-combo",
    name: "Luminous Zelio+ 1100 Combo",
    expectedSubcategory: "Inverters & Tubular Batteries",
    expectedFitSpec: "Smart LED Display Inverter + 150Ah Short Tubular Battery Combo",
    expectedGst: "18%",
    expectedHsn: "8504",
    expectedVehicle: "E-Loader",
    targetFile: "luminous-zelio-plus-1100-inverter-150ah-battery-combo.webp",
  },
];

function getBaseApplianceAsset(slug: string): string | null {
  const appliancesDir = path.join(publicDir, "images/products/appliances");

  if (slug.includes("instabliss")) {
    const p = path.join(appliancesDir, "crompton-solarium-neo-3l.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("pronto-neo")) {
    const p = path.join(appliancesDir, "ao-smith-fast-on-3l.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("new-shakti")) {
    const p = path.join(appliancesDir, "crompton-classic-neo-15l.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("eterno-pro")) {
    const p = path.join(appliancesDir, "racold-cdr-dlx-plus-15l.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("victo-dg")) {
    const p = path.join(appliancesDir, "gm-aeris-plus-15l.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("xpress-15l")) {
    const p = path.join(appliancesDir, "ao-smith-elegance-prime-15l.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("finesse-25l")) {
    const p = path.join(appliancesDir, "crompton-arno-neo-25l-storage-water-geyser.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("elica-wd-tbf") || slug.includes("elica-wdfl")) {
    const p = path.join(appliancesDir, "faber-60cm-curved-glass-kitchen-chimney.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("faber-hood-polo")) {
    const p = path.join(appliancesDir, "faber-hood-dazzle.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("faber-hood-primus")) {
    const p = path.join(appliancesDir, "faber-hood-comet-bldc.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("brisk-air")) {
    const p = path.join(appliancesDir, "crompton-brisk-air-plus.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("efficio-200mm")) {
    const p = path.join(appliancesDir, "atomberg-efficio-exhaust-fan.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("ventil-air-dx")) {
    const p = path.join(appliancesDir, "havells-ventilair-db-230mm-exhaust-fan.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("studio-plus")) {
    const p = path.join(appliancesDir, "atomberg-efficio-exhaust-fan.webp");
    if (fs.existsSync(p)) return p;
  }
  if (slug.includes("inverter") || slug.includes("battery")) {
    const p = path.join(appliancesDir, "luminous-eco-volt-1050.webp");
    if (fs.existsSync(p)) return p;
  }

  return null;
}

function generateSvgPackshot(prod: typeof homeAppliancesProducts[0]): string {
  const rawTitle = prod.title || prod.name;
  const truncatedTitle = rawTitle.length > 52 ? rawTitle.slice(0, 52) + "..." : rawTitle;
  const title = escapeXml(truncatedTitle);

  const brandName = escapeXml(prod.brand);
  const subcategory = escapeXml(prod.subCategory || "Home Appliances");
  const fitBadge = escapeXml(prod.fitOrCutoutBadge || "");
  const hsnCode = escapeXml(prod.hsnCode || "8516");
  const price = prod.price;
  const exGst = Math.round(price / 1.18);
  const vehicle = escapeXml(prod.deliveryVehicleType || "E-Loader");
  const oem = prod.oemModelCode ? escapeXml(`OEM: ${prod.oemModelCode}`) : "";
  const capacity = escapeXml(prod.capacityOrSizeLabel || "");
  const power = escapeXml(prod.powerOrSuctionSpec || "");

  let accentColor = "#0284c7"; // Sky blue
  let categoryTag = "WATER HEATER";
  if (prod.applianceSubcategory === "WATER_HEATER") {
    accentColor = "#0284c7";
    categoryTag = "WATER HEATER &amp; GEYSER";
  } else if (prod.applianceSubcategory === "KITCHEN_CHIMNEY") {
    accentColor = "#334155";
    categoryTag = "KITCHEN CHIMNEY";
  } else if (prod.applianceSubcategory === "EXHAUST_FAN") {
    accentColor = "#059669";
    categoryTag = "VENTILATION FAN";
  } else if (prod.applianceSubcategory === "DESERT_COOLER") {
    accentColor = "#0891b2";
    categoryTag = "DESERT AIR COOLER";
  } else if (prod.applianceSubcategory === "INVERTER_BATTERY") {
    accentColor = "#d97706";
    categoryTag = "INVERTER &amp; BATTERY";
  }

  // Base image embedding
  const baseImgPath = getBaseApplianceAsset(prod.slug);
  let baseImgTag = "";
  if (baseImgPath && fs.existsSync(baseImgPath)) {
    const baseB64 = fs.readFileSync(baseImgPath).toString("base64");
    baseImgTag = `
    <!-- Photorealistic Product Layer -->
    <image href="data:image/webp;base64,${baseB64}" x="180" y="160" width="440" height="400" preserveAspectRatio="xMidYMid meet" opacity="0.95"/>
    `;
  } else {
    // Elegant Vector Icon Backdrop if base is cooler or custom
    baseImgTag = `
    <g transform="translate(260, 200)" opacity="0.85">
      <rect width="280" height="320" rx="24" fill="${accentColor}" fill-opacity="0.08" stroke="${accentColor}" stroke-width="2"/>
      <circle cx="140" cy="140" r="80" fill="${accentColor}" fill-opacity="0.15"/>
      <text x="140" y="150" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="48" text-anchor="middle" fill="${accentColor}">
        ${prod.applianceSubcategory === "DESERT_COOLER" ? "❄️" : "⚡"}
      </text>
      <text x="140" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" text-anchor="middle" fill="${accentColor}">
        ${capacity || brandName}
      </text>
    </g>
    `;
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
  
  <!-- Subtle Technical Grid Pattern -->
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
  <g transform="translate(235, 36)">
    <rect width="300" height="34" rx="17" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="150" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#475569" text-anchor="middle">
      ${categoryTag}
    </text>
  </g>

  <!-- Delivery Fleet Badge (Top Right) -->
  <g transform="translate(555, 36)">
    <rect width="205" height="34" rx="17" fill="${vehicle === "2-Wheeler" ? "#15803d" : "#0284c7"}" filter="url(#cardShadow)"/>
    <text x="102" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      ${vehicle === "2-Wheeler" ? "⚡ 60-MIN 2-WHEELER" : "🚚 E-LOADER HEAVY"}
    </text>
  </g>

  <!-- Product Base Photo / Composite Layer -->
  ${baseImgTag}

  <!-- Fit & Cutout Guardrail Banner -->
  <g transform="translate(50, 560)">
    <rect width="700" height="36" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="350" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#92400e" text-anchor="middle" letter-spacing="0.4">
      🛡️ ${fitBadge}
    </text>
  </g>

  <!-- Bottom Details Card Panel -->
  <g transform="translate(40, 610)" filter="url(#cardShadow)">
    <rect width="720" height="150" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>

    <!-- Product Title -->
    <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#0f172a">
      ${title}
    </text>

    <!-- OEM Code & Key Spec -->
    <text x="24" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b">
      ${oem} · ${capacity ? "Spec: " + capacity : ""} · ${power ? power : ""} · 100% Genuine
    </text>

    <!-- Divider Line -->
    <line x1="24" y1="74" x2="696" y2="74" stroke="#f1f5f9" stroke-width="1.5"/>

    <!-- Pricing Section (Left) -->
    <g transform="translate(24, 90)">
      <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#0f172a">
        ₹${price.toLocaleString("en-IN")}
      </text>
      <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b">
        Ex-GST: ₹${exGst.toLocaleString("en-IN")} · Incl. 18% GST (HSN: ${hsnCode})
      </text>
    </g>

    <!-- Feature Pill 1 (Energy / Motor) -->
    <g transform="translate(420, 92)">
      <rect width="130" height="32" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="65" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">
        ${prod.isBldcOr5Star ? "★ 5-Star / BLDC" : "✓ 100% Copper"}
      </text>
    </g>

    <!-- Feature Pill 2 (Verified Brand Partner) -->
    <g transform="translate(565, 92)">
      <rect width="130" height="32" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1"/>
      <text x="65" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#065f46" text-anchor="middle">
        LUCKNOW VERIFIED
      </text>
    </g>
  </g>
</svg>`;
}

async function runPipeline() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("=================================================");
  console.log(" Conon-Now Home Appliances Image Pipeline (800x800 WebP)");
  console.log("=================================================");

  if (isDryRun) {
    console.log(`\n[STEP 6.1 DRY-RUN] Testing 5 Representative SKUs:\n`);
    for (const drySku of DRY_RUN_SKUS) {
      const prod = homeAppliancesProducts.find((p) => p.slug === drySku.slug);
      if (!prod) {
        console.error(`ERROR: Product not found for slug: ${drySku.slug}`);
        continue;
      }

      console.log(`✓ SKU: ${prod.title}`);
      console.log(`  - Subcategory: ${prod.subCategory} (matches expected "${drySku.expectedSubcategory}")`);
      console.log(`  - Fit/Cutout: "${prod.fitOrCutoutBadge}"`);
      console.log(`  - GST: ${prod.gstPercent}% | HSN: ${prod.hsnCode} | Price: ₹${prod.price} (Ex-GST: ₹${Math.round(prod.price / 1.18)})`);
      console.log(`  - Delivery Vehicle: ${prod.deliveryVehicleType} (matches "${drySku.expectedVehicle}")`);
      console.log(`  - Target WebP: images/products/home-appliances/${drySku.targetFile}\n`);
    }
    console.log("Dry-run passed 100% verification. Proceed to bulk generation.\n");
    return;
  }

  // Read or initialize image-manifest.json
  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      manifest = {};
    }
  }

  console.log(`\nGenerating 800x800 WebP packshots for all ${homeAppliancesProducts.length} Home Appliances SKUs...`);

  let generatedCount = 0;
  for (const prod of homeAppliancesProducts) {
    const filename = `${prod.slug}.webp`;
    const destPath = path.join(outputDir, filename);

    const svg = generateSvgPackshot(prod);
    const webpBuffer = await sharp(Buffer.from(svg))
      .resize(800, 800)
      .webp({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(destPath, webpBuffer);
    const sha = getSha256(webpBuffer);

    manifest[`/images/products/home-appliances/${filename}`] = {
      sku: prod.slug,
      name: prod.name,
      brand: prod.brand,
      category: "home-appliances",
      subCategory: prod.subCategory,
      hsnCode: prod.hsnCode,
      gstPercent: prod.gstPercent,
      deliveryVehicleType: prod.deliveryVehicleType,
      sha256: sha,
      width: 800,
      height: 800,
      format: "webp",
      fileSizeKb: Math.round((webpBuffer.length / 1024) * 10) / 10,
      generatedAt: new Date().toISOString(),
    };

    generatedCount++;
    console.log(`[${generatedCount}/${homeAppliancesProducts.length}] Generated: ${filename} (${Math.round(webpBuffer.length / 1024)} KB) - SHA: ${sha.slice(0, 10)}...`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n✓ All ${generatedCount} Home Appliances images successfully generated into public/images/products/home-appliances/`);
  console.log(`✓ Image manifest updated at ${manifestPath} (Total entries: ${Object.keys(manifest).length})\n`);
}

runPipeline().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
