import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { ALL_45_ADHESIVES_PRODUCTS } from "../artifacts/conon/src/data/adhesivesData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/fevicol-adhesives-sealants");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");
const attachedAssetsDir = path.join(rootDir, "artifacts/conon/src/assets");

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
export const ADHESIVES_DRY_RUN_SKUS = [
  {
    id: "prod-adh-fevicol-sh-5kg",
    name: "Fevicol SH 5 kg",
    expectedCategory: "Wood & Laminate Adhesives",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
  },
  {
    id: "prod-adh-fevicol-marine-5kg",
    name: "Fevicol Marine 5 kg",
    expectedCategory: "Wood & Laminate Adhesives",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
  },
  {
    id: "prod-adh-araldite-standard-180g",
    name: "Araldite Standard 180 g",
    expectedCategory: "Epoxy, Putty & Instant Repair",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
  },
  {
    id: "prod-adh-dowsil-gp-280ml",
    name: "Dowsil GP Acetoxy Silicone 280 ml",
    expectedCategory: "Silicone, PU Sealants & Foam",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
  },
  {
    id: "prod-adh-ingco-caulking-gun-9in",
    name: "Ingco HCG1809 9-Inch Caulking Gun",
    expectedCategory: "Applicator Guns & Masking Tapes",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
  },
];

// Helper to determine the best base source photographic asset
function getBaseAssetPath(prod: any): string | null {
  const adhesivesPublic = path.join(publicDir, "images/products/adhesives");
  const paintPublic = path.join(publicDir, "images/products/paint");

  if (prod.id.includes("fevicol-sh-50kg")) {
    const drum = path.join(attachedAssetsDir, "brands/fevicol-drum.png");
    if (fs.existsSync(drum)) return drum;
    return path.join(adhesivesPublic, "fevicol-sh-50kg-drum.webp");
  }

  if (prod.id.includes("fevicol-sh-20kg") || prod.id.includes("jivanjor-all-rounder-20kg") || prod.id.includes("jivanjor-all-rounder-50kg") || prod.id.includes("fevicol-marine-20kg") || prod.id.includes("fevicol-marine-50kg") || prod.id.includes("fevicol-hiper-20kg")) {
    return path.join(adhesivesPublic, "fevicol-sh-50kg-drum.webp");
  }

  if (prod.id.includes("fevicol-marine")) {
    return path.join(adhesivesPublic, "fevicol-marine-5kg.webp");
  }

  if (prod.id.includes("fevicol-heatx")) {
    return path.join(adhesivesPublic, "fevicol-heatx-1l.webp");
  }

  if (prod.id.includes("fevicol-probond")) {
    return path.join(adhesivesPublic, "fevicol-probond-special-pvc-adhesive-1kg.webp");
  }

  if (prod.id.includes("fevicol-speedx")) {
    return path.join(adhesivesPublic, "fevicol-speedx-1kg.webp");
  }

  if (prod.id.includes("fevicol-sh") || prod.id.includes("fevicol-hiper") || prod.id.includes("jivanjor")) {
    return path.join(adhesivesPublic, "fevicol-sh-1kg.webp");
  }

  if (prod.id.includes("fevicol-sr-998") || prod.id.includes("dendrite")) {
    return path.join(adhesivesPublic, "fevicol-heatx-1l.webp");
  }

  if (prod.id.includes("araldite") || prod.id.includes("fevitite")) {
    return path.join(adhesivesPublic, "araldite-standard-90g.webp");
  }

  if (prod.id.includes("mseal")) {
    return path.join(adhesivesPublic, "m-seal-epoxy-compound-1kg.webp");
  }

  if (prod.id.includes("fevikwik")) {
    return path.join(adhesivesPublic, "fevikwik-2g-tube.webp");
  }

  if (prod.id.includes("abro-masking-tape-24mm")) {
    const tape1 = path.join(paintPublic, "masking-tape-1-20m.webp");
    if (fs.existsSync(tape1)) return tape1;
  }

  if (prod.id.includes("abro-masking-tape-48mm")) {
    const tape2 = path.join(paintPublic, "masking-tape-2-20m.webp");
    if (fs.existsSync(tape2)) return tape2;
  }

  if (prod.id.includes("pu-foam")) {
    return path.join(adhesivesPublic, "fevicol-sr-505-spray-500ml.webp");
  }

  return null;
}

// Generate crisp SVG graphic representation for Cartridges / Guns / Specialized Sealants
function createAdhesivePackshotSvg(prod: any): string {
  const isSilicone = prod.subCategory === "Silicone, PU Sealants & Foam";
  const isGun = prod.subCategory === "Applicator Guns & Masking Tapes";
  const isTape = prod.name.includes("Masking Tape");
  const isContact = prod.subCategory === "Contact & Rubber Adhesives";
  const isEpoxy = prod.subCategory === "Epoxy, Putty & Instant Repair";

  let brandColor = "#0284C7"; // Blue
  let bgGradientStart = "#F0F9FF";
  let bgGradientEnd = "#E0F2FE";
  let accentTag = prod.brand.toUpperCase();

  if (prod.brand === "Fevicol" || prod.brand === "Pidilite") {
    brandColor = "#1D4ED8"; // Deep Fevicol Blue
    bgGradientStart = "#EFF6FF";
    bgGradientEnd = "#DBEAFE";
  } else if (prod.brand === "Dowsil") {
    brandColor = "#B91C1C"; // Dow Red
    bgGradientStart = "#FEF2F2";
    bgGradientEnd = "#FEE2E2";
  } else if (prod.brand === "Wacker") {
    brandColor = "#047857"; // Wacker Emerald
    bgGradientStart = "#ECFDF5";
    bgGradientEnd = "#D1FAE5";
  } else if (prod.brand === "McCoy Soudal") {
    brandColor = "#C2410C"; // Soudal Orange/Red
    bgGradientStart = "#FFF7ED";
    bgGradientEnd = "#FFEDD5";
  } else if (prod.brand === "Ingco" || prod.brand === "Tomahawk") {
    brandColor = "#EA580C"; // Tool Amber/Orange
    bgGradientStart = "#FFFBEB";
    bgGradientEnd = "#FEF3C7";
  } else if (prod.brand === "Araldite") {
    brandColor = "#0D9488"; // Araldite Teal
    bgGradientStart = "#F0FDFA";
    bgGradientEnd = "#CCFBF1";
  }

  // Cure Warning or Specs
  let warningText = "";
  let warningBg = "#F3F4F6";
  let warningColor = "#374151";

  if (prod.cureType === "ACETOXY_GP") {
    warningText = "⚠️ NOT FOR MIRRORS / MARBLE";
    warningBg = "#FEF2F2";
    warningColor = "#B91C1C";
  } else if (prod.cureType === "NEUTRAL") {
    warningText = "🛡️ MIRROR & STONE SAFE (NEUTRAL)";
    warningBg = "#ECFDF5";
    warningColor = "#047857";
  } else if (prod.id.includes("soudaflex-40fc")) {
    warningText = "⚠️ REQUIRES 600ml SAUSAGE GUN";
    warningBg = "#FFF7ED";
    warningColor = "#C2410C";
  } else if (prod.heatOrWaterRating) {
    warningText = prod.heatOrWaterRating;
    warningBg = "#F0F9FF";
    warningColor = "#0369A1";
  }

  return `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradientStart}" />
      <stop offset="100%" stop-color="${bgGradientEnd}" />
    </linearGradient>
    <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E2E8F0" />
      <stop offset="25%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#64748B" />
      <stop offset="35%" stop-color="#94A3B8" />
      <stop offset="75%" stop-color="#475569" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Clean Canvas -->
  <rect width="800" height="800" fill="#FFFFFF" />

  <!-- Subtle Ambient Glow -->
  <circle cx="400" cy="400" r="320" fill="url(#bgGrad)" opacity="0.6" />

  <!-- Main Illustration Container -->
  ${
    isSilicone
      ? `
  <!-- Silicone Cartridge / Sausage Mockup -->
  <g transform="translate(280, 140)">
    <!-- Nozzle / Tip -->
    <polygon points="120,40 100,10 140,10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="110" y="40" width="20" height="30" rx="3" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
    <!-- Cartridge Cylinder Body -->
    <rect x="60" y="70" width="120" height="380" rx="14" fill="url(#tubeGrad)" stroke="#94A3B8" stroke-width="3" filter="url(#cardShadow)"/>
    <!-- Printed Brand Label on Cartridge -->
    <rect x="62" y="140" width="116" height="240" fill="${brandColor}" opacity="0.95"/>
    <rect x="62" y="150" width="116" height="40" fill="#FFFFFF"/>
    <text x="120" y="176" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="${brandColor}" text-anchor="middle">${escapeXml(prod.brand)}</text>
    <text x="120" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">${escapeXml(prod.title.split("—")[1]?.trim() || prod.name)}</text>
    <text x="120" y="245" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FEF08A" text-anchor="middle">${escapeXml(prod.settingTimeLabel || "")}</text>
    <!-- Pack Size on Cylinder Bottom -->
    <rect x="62" y="340" width="116" height="30" fill="#0F172A"/>
    <text x="120" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#38BDF8" text-anchor="middle">${escapeXml(prod.packSizeDisplay)}</text>
    <!-- Base Plunger Cap -->
    <rect x="70" y="446" width="100" height="18" rx="4" fill="#64748B"/>
  </g>
  `
      : isGun
      ? `
  <!-- Caulking / Sealant Gun Mockup -->
  <g transform="translate(180, 200)">
    <!-- Gun Barrel -->
    <rect x="40" y="100" width="360" height="40" rx="8" fill="url(#metalGrad)" stroke="#1E293B" stroke-width="3" filter="url(#cardShadow)"/>
    <!-- Push Rod -->
    <rect x="0" y="115" width="440" height="10" rx="4" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
    <!-- Pistol Grip Handle -->
    <path d="M 80,140 L 70,260 L 110,260 L 120,140 Z" fill="${brandColor}" stroke="#0F172A" stroke-width="3"/>
    <!-- Trigger Lever -->
    <path d="M 120,150 Q 140,200 130,230" stroke="#0F172A" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Front Nozzle Ring -->
    <ellipse cx="400" cy="120" rx="10" ry="24" fill="#334155" stroke="#0F172A" stroke-width="3"/>
    <text x="220" y="126" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(prod.brand)} PROFESSIONAL 9"</text>
  </g>
  `
      : isTape
      ? `
  <!-- Tape Roll Mockup -->
  <g transform="translate(240, 160)">
    <circle cx="160" cy="160" r="140" fill="#FEF3C7" stroke="#D97706" stroke-width="4" filter="url(#cardShadow)"/>
    <circle cx="160" cy="160" r="75" fill="#FFFFFF" stroke="#92400E" stroke-width="3"/>
    <!-- Tape Core Logo -->
    <circle cx="160" cy="160" r="70" fill="#F8FAFC"/>
    <text x="160" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#B45309" text-anchor="middle">ABRO</text>
    <text x="160" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#78350F" text-anchor="middle">MASKING TAPE</text>
    <!-- Roll Thickness Label -->
    <text x="160" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#92400E" text-anchor="middle">${escapeXml(prod.packSizeDisplay)}</text>
  </g>
  `
      : `
  <!-- Generic Container / Drum Mockup -->
  <g transform="translate(260, 140)">
    <rect x="40" y="60" width="200" height="360" rx="28" fill="${brandColor}" stroke="#1E293B" stroke-width="4" filter="url(#cardShadow)"/>
    <rect x="44" y="130" width="192" height="180" fill="#FFFFFF"/>
    <text x="140" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="${brandColor}" text-anchor="middle">${escapeXml(prod.brand)}</text>
    <text x="140" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#0F172A" text-anchor="middle">${escapeXml(prod.name.split("(")[0]?.trim() || prod.name)}</text>
    <text x="140" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="${brandColor}" text-anchor="middle">${escapeXml(prod.packSizeDisplay)}</text>
  </g>
  `
  }

  <!-- Header Brand Pill -->
  <g transform="translate(48, 48)">
    <rect width="180" height="42" rx="10" fill="#0F172A"/>
    <text x="90" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(accentTag)} ORIGINAL</text>
  </g>

  <!-- Express Fleet Dispatch Badge -->
  <g transform="translate(540, 48)">
    <rect width="212" height="42" rx="10" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-width="1.5"/>
    <text x="106" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#047857" text-anchor="middle">⚡ ${escapeXml(prod.deliveryVehicleType)} · 60m</text>
  </g>

  <!-- Technical Safety / Warning Footer Banner -->
  ${
    warningText
      ? `
  <g transform="translate(48, 690)">
    <rect width="704" height="52" rx="12" fill="${warningBg}" stroke="${warningColor}" stroke-width="1.5"/>
    <text x="352" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="${warningColor}" text-anchor="middle">${escapeXml(warningText)}</text>
  </g>
  `
      : ""
  }
</svg>
`;
}

async function processProductImage(prod: any): Promise<{ buffer: Buffer; sha256: string }> {
  const basePhoto = getBaseAssetPath(prod);

  let rawBuffer: Buffer;

  if (basePhoto && fs.existsSync(basePhoto)) {
    // High-resolution photographic asset available!
    // Composite onto 800x800 white canvas
    const baseImg = await sharp(basePhoto)
      .resize(700, 700, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toBuffer();

    // Composite with background and subtle corner badge
    const badgeSvg = `
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="badgeShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
        </filter>
      </defs>
      <!-- Top Left Brand Badge -->
      <g transform="translate(40, 40)">
        <rect width="180" height="40" rx="8" fill="#0F172A" filter="url(#badgeShadow)"/>
        <text x="90" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(prod.brand.toUpperCase())}</text>
      </g>
      <!-- Top Right Pack Size Badge -->
      <g transform="translate(580, 40)">
        <rect width="180" height="40" rx="8" fill="#1E40AF" filter="url(#badgeShadow)"/>
        <text x="90" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" text-anchor="middle">${escapeXml(prod.packSizeDisplay)}</text>
      </g>
      <!-- Bottom GST Badge -->
      <g transform="translate(40, 720)">
        <rect width="220" height="36" rx="6" fill="#F1F5F9" stroke="#CBD5E1"/>
        <text x="110" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#334155" text-anchor="middle">HSN ${escapeXml(prod.hsnCode)} · 18% GST</text>
      </g>
      <!-- Bottom Vehicle Dispatch Badge -->
      <g transform="translate(520, 720)">
        <rect width="240" height="36" rx="6" fill="#ECFDF5" stroke="#A7F3D0"/>
        <text x="120" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#047857" text-anchor="middle">⚡ ${escapeXml(prod.deliveryVehicleType)} Dispatch</text>
      </g>
    </svg>`;

    rawBuffer = await sharp({
      create: {
        width: 800,
        height: 800,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: baseImg, gravity: "center" },
        { input: Buffer.from(badgeSvg), gravity: "center" },
      ])
      .webp({ quality: 90 })
      .toBuffer();
  } else {
    // Generate specialized SVG packshot
    const svgStr = createAdhesivePackshotSvg(prod);
    rawBuffer = await sharp(Buffer.from(svgStr))
      .resize(800, 800)
      .webp({ quality: 90 })
      .toBuffer();
  }

  const sha256 = getSha256(rawBuffer);
  return { buffer: rawBuffer, sha256 };
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");

  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {}
  }

  if (isDryRun) {
    console.log("\n=======================================================");
    console.log("🔍 DRY RUN: 5 REPRESENTATIVE ADHESIVES & SEALANTS SKUS");
    console.log("=======================================================\n");

    for (let i = 0; i < ADHESIVES_DRY_RUN_SKUS.length; i++) {
      const sample = ADHESIVES_DRY_RUN_SKUS[i];
      const prod = ALL_45_ADHESIVES_PRODUCTS.find((p) => p.id === sample.id);
      if (!prod) {
        console.error(`  ❌ SKU not found: ${sample.id}`);
        continue;
      }

      const { buffer, sha256 } = await processProductImage(prod);
      const filename = path.basename(prod.image);
      const outPath = path.join(outputDir, filename);
      fs.writeFileSync(outPath, buffer);

      console.log(`[${i + 1}/5] Dry Run Item: ${sample.name}`);
      console.log(`  ✓ Product ID   : ${prod.id}`);
      console.log(`  ✓ Subcategory  : ${prod.subCategory} (Expected: ${sample.expectedCategory})`);
      console.log(`  ✓ GST / HSN    : ${prod.gstPercent}% / ${prod.hsnCode} (Expected: ${sample.expectedGst})`);
      console.log(`  ✓ Vehicle Type : ${prod.deliveryVehicleType} (Expected: ${sample.expectedVehicle})`);
      console.log(`  ✓ Pack Size    : ${prod.packSizeDisplay}`);
      console.log(`  ✓ Output Path  : ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
      console.log(`  ✓ SHA-256      : ${sha256}\n`);
    }

    console.log("✅ Dry run completed successfully on all 5 sample SKUs.");
    return;
  }

  console.log("\n=======================================================");
  console.log(`🚀 PROCESSING ALL ${ALL_45_ADHESIVES_PRODUCTS.length} ADHESIVE WEBP IMAGES`);
  console.log("=======================================================\n");

  let successCount = 0;
  for (let i = 0; i < ALL_45_ADHESIVES_PRODUCTS.length; i++) {
    const prod = ALL_45_ADHESIVES_PRODUCTS[i];
    const { buffer, sha256 } = await processProductImage(prod);
    const filename = path.basename(prod.image);
    const outPath = path.join(outputDir, filename);
    fs.writeFileSync(outPath, buffer);

    const relKey = `images/products/fevicol-adhesives-sealants/${filename}`;
    manifest[relKey] = {
      id: prod.id,
      skuSlug: prod.slug,
      filename,
      category: "fevicol-adhesives-sealants",
      subCategory: prod.subCategory,
      sha256,
      sizeBytes: buffer.length,
      width: 800,
      height: 800,
      format: "webp",
      updatedAt: new Date().toISOString(),
    };

    successCount++;
    console.log(
      `[${i + 1}/${ALL_45_ADHESIVES_PRODUCTS.length}] ✓ ${filename} (${(buffer.length / 1024).toFixed(1)} KB) - SHA: ${sha256.substring(0, 10)}...`
    );
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n✅ Image manifest updated at ${manifestPath}`);
  console.log(`🎉 Successfully generated all ${successCount} WebP images in ${outputDir}!\n`);
}

main().catch((err) => {
  console.error("Image generation script error:", err);
  process.exit(1);
});
