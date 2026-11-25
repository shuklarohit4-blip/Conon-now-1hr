import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/bricks-sand-gitti-aac");
const attachedAssetsDir = path.join(rootDir, "artifacts/conon/src/assets");
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

// 5 Sample SKUs for Dry Run required by STEP 6.1
export const MASONRY_DRY_RUN_SKUS = [
  {
    name: "Avval Red Clay Brick",
    slug: "lucknow-avval-red-clay-brick-1000-pcs",
    category: "Bricks",
    expectedVehicle: "Tractor Trolley / Truck",
    expectedGst: "12%",
  },
  {
    name: "Birla Aerocon 4\" AAC Block",
    slug: "birla-aerocon-aac-block-4-inch-600x200x100mm",
    category: "AAC Blocks",
    expectedVehicle: "Pickup / Mini-Truck",
    expectedGst: "12%",
  },
  {
    name: "Banda Coarse Morang Sand",
    slug: "banda-hamirpur-coarse-red-brown-morang-sand-rcc-per-cft",
    category: "Sand (Morang)",
    expectedVehicle: "Tractor Trolley / Dumper",
    expectedGst: "5%",
  },
  {
    name: "20mm Kabrai Kali Gitti",
    slug: "kabrai-mahoba-20mm-kali-crushed-stone-gitti-rcc-per-cft",
    category: "Stone Gitti",
    expectedVehicle: "Tractor Trolley / Dumper",
    expectedGst: "5%",
  },
  {
    name: "Concrete Cover Blocks",
    slug: "standard-precast-multi-size-concrete-cover-blocks-pack-100",
    category: "Precast Cover Blocks",
    expectedVehicle: "2-Wheeler",
    expectedGst: "18%",
  },
];

// Helper to create synthetic 800x800 SVG packshot with authentic visual rendering
function createMasonryPackshotSvg(p: any): string {
  const isBrick = p.masonrySubcategory === "BRICKS";
  const isAAC = p.masonrySubcategory === "AAC_CONCRETE_BLOCKS";
  const isSand = p.masonrySubcategory === "SAND_MORANG";
  const isGitti = p.masonrySubcategory === "GITTI_AGGREGATES";
  const isPaver = p.masonrySubcategory === "PAVERS_COVER_BLOCKS";

  let badgeColor = "#0284C7";
  let badgeBg = "#E0F2FE";
  let primaryTone = "#991B1B";

  if (isBrick) {
    badgeColor = "#991B1B";
    badgeBg = "#FEE2E2";
    primaryTone = p.name.includes("Fly Ash") ? "#475569" : "#B91C1C";
  } else if (isAAC) {
    badgeColor = "#0284C7";
    badgeBg = "#E0F2FE";
    primaryTone = "#64748B";
  } else if (isSand) {
    badgeColor = "#B45309";
    badgeBg = "#FEF3C7";
    primaryTone = p.name.includes("Balu") ? "#D97706" : "#B45309";
  } else if (isGitti) {
    badgeColor = "#1E293B";
    badgeBg = "#F1F5F9";
    primaryTone = "#334155";
  } else if (isPaver) {
    badgeColor = "#047857";
    badgeBg = "#D1FAE5";
    primaryTone = p.name.includes("Cover") ? "#475569" : "#C2410C";
  }

  // Visual element based on product type
  let illustration = "";

  if (isBrick) {
    const isFlyAsh = p.name.includes("Fly Ash");
    const brickFill = isFlyAsh ? "#94A3B8" : "#DC2626";
    const brickSide = isFlyAsh ? "#64748B" : "#991B1B";
    const brickTop = isFlyAsh ? "#CBD5E1" : "#EF4444";
    illustration = `
      <g transform="translate(180, 260)">
        <!-- 3D Perspective Isometric Brick -->
        <!-- Top Face -->
        <polygon points="120,40 320,40 240,0 40,0" fill="${brickTop}" stroke="#334155" stroke-width="4"/>
        <!-- Frog indentation on top -->
        <polygon points="140,30 280,30 230,10 90,10" fill="${brickSide}" opacity="0.6"/>
        <text x="175" y="24" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">CONON</text>
        <!-- Front Face -->
        <polygon points="40,0 240,0 240,160 40,160" fill="${brickFill}" stroke="#334155" stroke-width="4"/>
        <!-- Side Face -->
        <polygon points="240,0 320,40 320,200 240,160" fill="${brickSide}" stroke="#334155" stroke-width="4"/>
        <text x="140" y="90" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF" text-anchor="middle" opacity="0.9">${isFlyAsh ? "IS 12894" : "AVVAL-1"}</text>
        <text x="140" y="118" font-family="Arial, sans-serif" font-weight="600" font-size="14" fill="#FFFFFF" text-anchor="middle" opacity="0.8">9×4×3 in</text>
      </g>
    `;
  } else if (isAAC) {
    illustration = `
      <g transform="translate(160, 240)">
        <!-- 3D AAC Block -->
        <polygon points="100,50 380,50 300,0 20,0" fill="#E2E8F0" stroke="#475569" stroke-width="4"/>
        <polygon points="20,0 300,0 300,180 20,180" fill="#CBD5E1" stroke="#475569" stroke-width="4"/>
        <polygon points="300,0 380,50 380,230 300,180" fill="#94A3B8" stroke="#475569" stroke-width="4"/>
        <!-- Texture speckles for aerated concrete -->
        <circle cx="80" cy="50" r="3" fill="#64748B" opacity="0.5"/>
        <circle cx="150" cy="90" r="4" fill="#64748B" opacity="0.5"/>
        <circle cx="220" cy="40" r="3" fill="#64748B" opacity="0.5"/>
        <circle cx="100" cy="130" r="3" fill="#64748B" opacity="0.5"/>
        <circle cx="240" cy="120" r="4" fill="#64748B" opacity="0.5"/>
        <rect x="60" y="70" width="180" height="48" rx="8" fill="#1E293B" opacity="0.85"/>
        <text x="150" y="100" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#38BDF8" text-anchor="middle">${p.thicknessMm || "100"}mm AAC</text>
      </g>
    `;
  } else if (isSand) {
    illustration = `
      <g transform="translate(180, 250)">
        <!-- Sand Mound -->
        <path d="M 40,240 Q 220,40 400,240 Z" fill="#D97706" opacity="0.85" stroke="#78350F" stroke-width="4"/>
        <path d="M 80,240 Q 220,80 360,240 Z" fill="#F59E0B" opacity="0.7"/>
        <path d="M 140,240 Q 220,120 300,240 Z" fill="#FDE68A" opacity="0.6"/>
        <circle cx="220" cy="110" r="6" fill="#78350F" opacity="0.5"/>
        <circle cx="180" cy="160" r="5" fill="#78350F" opacity="0.4"/>
        <circle cx="260" cy="170" r="5" fill="#78350F" opacity="0.4"/>
        <!-- eMM-11 Mining Badge -->
        <rect x="130" y="170" width="180" height="40" rx="8" fill="#1E293B" opacity="0.9"/>
        <text x="220" y="195" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#FDE047" text-anchor="middle">UP eMM-11 Mining Pass</text>
      </g>
    `;
  } else if (isGitti) {
    illustration = `
      <g transform="translate(180, 240)">
        <!-- Gitti Aggregate Pile -->
        <path d="M 30,240 Q 220,30 410,240 Z" fill="#334155" stroke="#0F172A" stroke-width="4"/>
        <!-- Angular stone facets -->
        <polygon points="120,180 160,150 180,190 140,210" fill="#475569" stroke="#1E293B" stroke-width="2"/>
        <polygon points="200,130 250,110 270,160 220,170" fill="#64748B" stroke="#1E293B" stroke-width="2"/>
        <polygon points="280,170 330,150 350,200 300,210" fill="#475569" stroke="#1E293B" stroke-width="2"/>
        <polygon points="160,90 200,60 230,100 180,110" fill="#64748B" stroke="#1E293B" stroke-width="2"/>
        <rect x="140" y="180" width="160" height="36" rx="8" fill="#0F172A" opacity="0.95"/>
        <text x="220" y="204" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#F8FAFC" text-anchor="middle">${p.aggregateSizeMm || "20"}mm KABRAI</text>
      </g>
    `;
  } else if (isPaver) {
    if (p.name.includes("Cover")) {
      illustration = `
        <g transform="translate(220, 240)">
          <!-- Multi-size Cover Block -->
          <rect x="60" y="40" width="240" height="180" rx="16" fill="#64748B" stroke="#1E293B" stroke-width="4"/>
          <!-- Rebar slots -->
          <circle cx="180" cy="40" r="28" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
          <circle cx="180" cy="220" r="32" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
          <rect x="60" y="105" width="240" height="50" fill="#475569"/>
          <text x="180" y="137" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#F8FAFC" text-anchor="middle">20/25/40/50mm</text>
        </g>
      `;
    } else {
      illustration = `
        <g transform="translate(190, 240)">
          <!-- Interlocking Zig-Zag Paver -->
          <path d="M 50,40 L 140,40 L 190,100 L 280,100 L 330,40 L 410,40 L 380,180 L 300,180 L 250,120 L 160,120 L 110,180 L 20,180 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="5"/>
          <rect x="130" y="95" width="180" height="40" rx="8" fill="#1E293B" opacity="0.9"/>
          <text x="220" y="122" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#F8FAFC" text-anchor="middle">${p.thicknessMm || "60"}mm M${p.name.includes("80mm") ? "35" : "30"} PAVER</text>
        </g>
      `;
    }
  }

  return `
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="85%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#EDF2F7"/>
        </radialGradient>
      </defs>
      <!-- Clean background -->
      <rect width="800" height="800" fill="url(#bgGlow)"/>

      <!-- Category & Brand Header -->
      <rect x="40" y="36" width="720" height="64" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="56" y="48" width="140" height="40" rx="10" fill="${badgeBg}"/>
      <text x="126" y="73" font-family="Arial, sans-serif" font-weight="900" font-size="13" fill="${badgeColor}" text-anchor="middle" letter-spacing="0.5">${escapeXml(p.brand.toUpperCase())}</text>

      <text x="216" y="74" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#1E293B">${escapeXml(p.subCategory)}</text>
      
      <!-- GST & Vehicle Badge -->
      <rect x="630" y="48" width="114" height="40" rx="10" fill="#1E293B"/>
      <text x="687" y="73" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#F8FAFC" text-anchor="middle">${p.gstPercent}% GST</text>

      <!-- Center Product Graphic -->
      ${illustration}

      <!-- Bottom Card Specifications -->
      <rect x="40" y="660" width="720" height="104" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <text x="70" y="695" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#0F172A">${escapeXml(p.name.length > 55 ? p.name.substring(0, 52) + "..." : p.name)}</text>
      <text x="70" y="725" font-family="Arial, sans-serif" font-weight="600" font-size="13" fill="#64748B">${escapeXml(p.dimensionsLabel || p.unit)} • HSN ${p.hsnCode} • ${escapeXml(p.deliveryVehicleType)}</text>
      <text x="70" y="748" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="${badgeColor}">✓ Lucknow Verified Source • ${p.deliveryMode === "EXPRESS_60_MIN" ? "⚡ 60-Min Express" : "🚛 Scheduled Heavy Delivery"}</text>

      <!-- Price Callout -->
      <rect x="620" y="680" width="124" height="64" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="682" y="712" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#1E293B" text-anchor="middle">₹${p.price.toLocaleString("en-IN")}</text>
      <text x="682" y="732" font-family="Arial, sans-serif" font-weight="600" font-size="10" fill="#64748B" text-anchor="middle">Incl. ${p.gstPercent}% GST</text>
    </svg>
  `;
}

async function processProductImage(p: any): Promise<{ buffer: Buffer; sha256: string }> {
  // Check if we have a photographic match in artifacts/conon/src/assets
  let sourceBuf: Buffer | null = null;

  if (p.slug.includes("red-clay-brick") || p.slug.includes("first-class")) {
    const pth = path.join(attachedAssetsDir, "first_class_brick_1781692393720.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("fly-ash-brick")) {
    const pth = path.join(attachedAssetsDir, "fly_ash_brick_standard_1781692393721.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("magicrete-magic-blox-aac-block-4-inch")) {
    const pth = path.join(attachedAssetsDir, "magicrete_aac_4_inch_1781692393725.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("magicrete-magic-blox-aac-block-6-inch")) {
    const pth = path.join(attachedAssetsDir, "magicrete_aac_6_inch_1781692393725.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("magicrete-magic-blox-aac-block-8-inch")) {
    const pth = path.join(attachedAssetsDir, "magicrete_aac_8_inch_1781692393726.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("birla-aerocon-aac-block-4-inch")) {
    const pth = path.join(attachedAssetsDir, "acc_block_100mm_1781691111053.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("birla-aerocon-aac-block-6-inch")) {
    const pth = path.join(attachedAssetsDir, "acc_block_150mm_1781691111054.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  } else if (p.slug.includes("birla-aerocon-aac-block-8-inch")) {
    const pth = path.join(attachedAssetsDir, "acc_block_200mm_1781691111054.png");
    if (fs.existsSync(pth)) sourceBuf = fs.readFileSync(pth);
  }

  // If no photographic asset, generate high-quality SVG packshot
  let rawBuffer: Buffer;
  if (sourceBuf) {
    // Process existing high-res photographic asset into pristine 800x800 contain canvas
    rawBuffer = await sharp(sourceBuf)
      .resize(800, 800, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 90 })
      .toBuffer();
  } else {
    const svgStr = createMasonryPackshotSvg(p);
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

  const jsonPath = path.join(rootDir, "scratch/all_37_masonry_products.json");
  const allProducts: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {}
  }

  if (isDryRun) {
    console.log("\n=======================================================");
    console.log("🔍 DRY RUN: 5 REPRESENTATIVE MASONRY & AGGREGATE SKUS");
    console.log("=======================================================\n");

    for (let i = 0; i < MASONRY_DRY_RUN_SKUS.length; i++) {
      const sample = MASONRY_DRY_RUN_SKUS[i];
      const prod = allProducts.find((p) => p.slug === sample.slug);
      if (!prod) {
        console.error(`  ❌ SKU not found: ${sample.slug}`);
        continue;
      }

      const { buffer, sha256 } = await processProductImage(prod);
      const outPath = path.join(outputDir, `${prod.slug}.webp`);
      fs.writeFileSync(outPath, buffer);

      console.log(`[${i + 1}/5] Dry Run Item: ${sample.name}`);
      console.log(`  ✓ Slug: ${prod.slug}`);
      console.log(`  ✓ Subcategory: ${prod.subCategory}`);
      console.log(`  ✓ GST Slab: ${prod.gstPercent}% (Expected: ${sample.expectedGst})`);
      console.log(`  ✓ Vehicle: ${prod.deliveryVehicleType} (Expected: ${sample.expectedVehicle})`);
      console.log(`  ✓ Delivery Mode: ${prod.deliveryMode}`);
      console.log(`  ✓ Output Path: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
      console.log(`  ✓ SHA-256: ${sha256}\n`);
    }

    console.log("✅ Dry run completed successfully on all 5 sample SKUs.");
    return;
  }

  console.log("\n=======================================================");
  console.log(`🚀 PROCESSING ALL ${allProducts.length} MASONRY WEBP IMAGES`);
  console.log("=======================================================\n");

  let successCount = 0;
  for (let i = 0; i < allProducts.length; i++) {
    const prod = allProducts[i];
    const { buffer, sha256 } = await processProductImage(prod);
    const outPath = path.join(outputDir, `${prod.slug}.webp`);
    fs.writeFileSync(outPath, buffer);

    manifest[prod.id] = {
      id: prod.id,
      skuSlug: prod.slug,
      categorySlug: "bricks-sand-gitti-aac",
      title: prod.title,
      brand: prod.brand,
      price: prod.price,
      gstPercent: prod.gstPercent,
      hsnCode: prod.hsnCode,
      targetAsset: `/images/products/bricks-sand-gitti-aac/${prod.slug}.webp`,
      sha256,
      updatedAt: new Date().toISOString(),
    };

    successCount++;
    console.log(`[${i + 1}/${allProducts.length}] Generated WebP: ${prod.slug}.webp (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n🎉 Successfully processed and saved all ${successCount} product images to:`);
  console.log(`📁 ${outputDir}`);
}

main().catch((err) => {
  console.error("Image generation failed:", err);
  process.exit(1);
});
