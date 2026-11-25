import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { ALL_38_KITCHEN_PRODUCTS, KitchenSinkProduct } from "../artifacts/conon/src/data/kitchenSinksData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/kitchen-sinks-faucets");
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
export const KITCHEN_DRY_RUN_SKUS = [
  {
    id: "prod-sink-nirali-orra-straight-satin-24x18",
    name: "Nirali BG Orra Satin 24x18",
    expectedCategory: "SS Pressed Sinks",
    expectedGst: "18%",
    expectedVehicle: "E-Loader",
    expectedCabinet: "700mm",
  },
  {
    id: "prod-sink-ruhe-handmade-24x18",
    name: "Ruhe Handmade 24x18",
    expectedCategory: "Handmade SS Sinks",
    expectedGst: "18%",
    expectedVehicle: "E-Loader",
    expectedCabinet: "700mm",
  },
  {
    id: "prod-sink-carysil-big-bowl-nera-black-24x18",
    name: "Carysil Big Bowl Quartz Nera",
    expectedCategory: "Quartz Sinks",
    expectedGst: "18%",
    expectedVehicle: "E-Loader",
    expectedCabinet: "700mm",
  },
  {
    id: "prod-mix-kohler-atom-pulldown-chrome-25981in",
    name: "Kohler Atom Pull-Down Faucet",
    expectedCategory: "Sink Mixers & Pull-Out Faucets",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
    expectedMount: "TABLE_DECK_MOUNTED",
  },
  {
    id: "prod-acc-plantex-coupling-304",
    name: "Plantex 304 SS Waste Coupling",
    expectedCategory: "Sink Accessories & RO Add-Ons",
    expectedGst: "18%",
    expectedVehicle: "2-Wheeler",
    expectedHsn: "7324",
  },
];

// Determine base source photographic asset
function getBaseAssetPath(prod: KitchenSinkProduct): string | null {
  const kitchenImages = path.join(publicDir, "images/products/kitchen");
  const sanitaryImages = path.join(publicDir, "images/products/sanitary");
  const plumbingImages = path.join(publicDir, "images/products/plumbing");
  const attachedBrands = path.join(rootDir, "artifacts/conon/src/assets/brands");
  const attachedStock = path.join(rootDir, "artifacts/conon/src/assets/stock_images");

  // Sinks
  if (prod.kitchenSubcategory === "SS_PRESSED_SINK") {
    if (prod.sinkConstruction.includes("Drainboard") || prod.title.includes("Drainboard")) {
      const p = path.join(kitchenImages, "futura-dura-ss-sink-drainboard.webp");
      if (fs.existsSync(p)) return p;
    }
    if (prod.sinkConstruction.includes("Double Bowl") || prod.title.includes("Double Bowl")) {
      const p = path.join(kitchenImages, "futura-undermount-series-ss-sink.webp");
      if (fs.existsSync(p)) return p;
    }
    const p = path.join(kitchenImages, "futura-dura-ss-sink.webp");
    if (fs.existsSync(p)) return p;
  }

  if (prod.kitchenSubcategory === "HANDMADE_SS_SINK") {
    if (prod.sinkConstruction.includes("Double Bowl") || prod.title.includes("Double Bowl")) {
      const p = path.join(kitchenImages, "futura-undermount-series-ss-sink.webp");
      if (fs.existsSync(p)) return p;
    }
    const p = path.join(kitchenImages, "futura-hand-carved-series-ss-sink.webp");
    if (fs.existsSync(p)) return p;
  }

  if (prod.kitchenSubcategory === "QUARTZ_SINK") {
    const p = path.join(kitchenImages, "futura-dura-ss-sink.webp");
    if (fs.existsSync(p)) return p;
  }

  // Faucets & Mixers
  if (prod.kitchenSubcategory === "SINK_COCK") {
    if (prod.brand === "Jaquar") {
      const p = path.join(attachedBrands, "jaquar-faucet.png");
      if (fs.existsSync(p)) return p;
    }
    if (prod.brand === "CERA") {
      const p = path.join(sanitaryImages, "cera-victor-pillar-cock.webp");
      if (fs.existsSync(p)) return p;
    }
    const p = path.join(plumbingImages, "jaquar-florentine-pillar-cock.webp");
    if (fs.existsSync(p)) return p;
    return path.join(attachedStock, "cp-fitting.jpg");
  }

  if (prod.kitchenSubcategory === "SINK_MIXER_PULLOUT") {
    const p = path.join(sanitaryImages, "jaquar-florentine-prime-wall-mixer.webp");
    if (fs.existsSync(p)) return p;
    const p2 = path.join(attachedBrands, "jaquar-faucet.png");
    if (fs.existsSync(p2)) return p2;
  }

  // Accessories
  if (prod.id.includes("waste-pipe")) {
    const p = path.join(sanitaryImages, "futura-waste-pipe-flexible-pvc.webp");
    if (fs.existsSync(p)) return p;
  }
  if (prod.id.includes("coupling")) {
    const p = path.join(sanitaryImages, "futura-waste-coupling-ft-brass.webp");
    if (fs.existsSync(p)) return p;
    const p2 = path.join(sanitaryImages, "cera-waste-coupling.webp");
    if (fs.existsSync(p2)) return p2;
  }

  return null;
}

// Generate an SVG overlay template with spec tags and branding
function generateSvgOverlay(prod: KitchenSinkProduct): string {
  const brandName = escapeXml(prod.brand);
  const productName = escapeXml(prod.title || prod.name);
  const subcategory = escapeXml(prod.subCategory);
  const hsnCode = escapeXml(prod.hsnCode);
  const gstPercent = prod.gstPercent;
  const exGst = prod.exGstPrice;
  const price = prod.price;
  const vehicle = escapeXml(prod.deliveryVehicleType);

  // Badge details
  let keySpec1 = "";
  let keySpec2 = "";
  let accentColor = "#1e293b"; // dark slate

  if (prod.kitchenSubcategory === "SS_PRESSED_SINK") {
    accentColor = "#0284c7"; // sky blue
    keySpec1 = `SS 304 | ${prod.overallDimensionsInch || "Standard"}`;
    keySpec2 = `Min Cabinet: ${prod.minCabinetWidthMm}mm`;
  } else if (prod.kitchenSubcategory === "HANDMADE_SS_SINK") {
    accentColor = "#0d9488"; // teal
    keySpec1 = `1.2mm Heavy SS 304 | SoundProof`;
    keySpec2 = `Min Cabinet: ${prod.minCabinetWidthMm}mm`;
  } else if (prod.kitchenSubcategory === "QUARTZ_SINK") {
    accentColor = prod.finishColor.includes("Nera") ? "#0f172a" : "#ca8a04"; // gold/dark
    keySpec1 = `German Quartz Composite | ${prod.finishColor}`;
    keySpec2 = `Min Cabinet: ${prod.minCabinetWidthMm}mm`;
  } else if (prod.kitchenSubcategory === "SINK_COCK") {
    accentColor = "#2563eb"; // blue
    keySpec1 = `${prod.mountType === "WALL_MOUNTED" ? "Wall Mounted" : "Table Mounted"} | Cold Only`;
    keySpec2 = prod.finishColor.includes("Black") ? "Black Matt Finish" : "Chrome Plated Brass Body";
  } else if (prod.kitchenSubcategory === "SINK_MIXER_PULLOUT") {
    accentColor = "#7c3aed"; // violet
    keySpec1 = `${prod.mountType === "TABLE_DECK_MOUNTED" ? "Table/Deck Mount" : "Wall Mount"} | Hot & Cold`;
    keySpec2 = prod.title.includes("Pull-Out") || prod.title.includes("Pull-Down") ? "Pull-Out Spray Spout" : "360° Swivel Spout";
  } else {
    accentColor = "#475569";
    keySpec1 = `${prod.materialGrade}`;
    keySpec2 = `Conon Fast Fit Accessory`;
  }

  // Quartz texture rendering for Quartz Sinks
  let quartzIllustration = "";
  if (prod.kitchenSubcategory === "QUARTZ_SINK") {
    const isBlack = prod.finishColor.includes("Nera Black");
    const isChampagne = prod.finishColor.includes("Champagne");
    const bgFill = isBlack ? "#18181b" : isChampagne ? "#d8c7b5" : "#e6ded1";
    const innerFill = isBlack ? "#09090b" : isChampagne ? "#bfa892" : "#cfc2ad";
    const strokeColor = isBlack ? "#3f3f46" : "#a89078";
    const rimTextColor = isBlack ? "#a1a1aa" : "#451a03";

    quartzIllustration = `
      <g transform="translate(180, 220)">
        <!-- Quartz Sink Outer Rim -->
        <rect x="0" y="0" width="440" height="340" rx="16" fill="${bgFill}" stroke="${strokeColor}" stroke-width="4" filter="drop-shadow(0px 12px 24px rgba(0,0,0,0.15))" />
        <!-- Quartz Texture speckles -->
        <circle cx="50" cy="50" r="1.5" fill="${strokeColor}" opacity="0.6"/>
        <circle cx="120" cy="80" r="1.5" fill="${strokeColor}" opacity="0.6"/>
        <circle cx="280" cy="60" r="1.5" fill="${strokeColor}" opacity="0.6"/>
        <circle cx="390" cy="110" r="1.5" fill="${strokeColor}" opacity="0.6"/>
        <circle cx="90" cy="290" r="1.5" fill="${strokeColor}" opacity="0.6"/>
        <circle cx="340" cy="300" r="1.5" fill="${strokeColor}" opacity="0.6"/>
        
        <!-- Deep Basin -->
        <rect x="40" y="40" width="360" height="260" rx="12" fill="${innerFill}" stroke="${strokeColor}" stroke-width="2" />
        
        <!-- Waste Hole & Drain Grooves -->
        <circle cx="220" cy="170" r="28" fill="#52525b" stroke="#71717a" stroke-width="3"/>
        <circle cx="220" cy="170" r="14" fill="#27272a"/>
        <line x1="90" y1="90" x2="195" y2="150" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>
        <line x1="350" y1="90" x2="245" y2="150" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>
        <line x1="90" y1="250" x2="195" y2="190" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>
        <line x1="350" y1="250" x2="245" y2="190" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>

        <!-- Rim Emboss Badge -->
        <rect x="150" y="10" width="140" height="22" rx="4" fill="rgba(0,0,0,0.25)"/>
        <text x="220" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="${rimTextColor}" text-anchor="middle" letter-spacing="1">CARYSIL GERMAN QUARTZ</text>
      </g>
    `;
  }

  // Black Matt Faucet special illustration overlay if applicable
  let blackMattOverlay = "";
  if (prod.finishColor.includes("Black") && (prod.kitchenSubcategory === "SINK_COCK" || prod.kitchenSubcategory === "SINK_MIXER_PULLOUT")) {
    blackMattOverlay = `
      <g transform="translate(620, 180)">
        <rect x="0" y="0" width="130" height="32" rx="16" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="6" fill="#000000" stroke="#71717a" stroke-width="1"/>
        <text x="70" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#f4f4f5" text-anchor="middle">MATT BLACK</text>
      </g>
    `;
  }

  return `
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <filter id="badgeShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
        </filter>
      </defs>

      <!-- Background header gradient strip -->
      <rect x="0" y="0" width="800" height="120" fill="url(#headerGrad)"/>

      <!-- Top Header Brand & Category -->
      <g transform="translate(40, 45)">
        <rect x="0" y="0" width="120" height="30" rx="6" fill="${accentColor}" filter="url(#badgeShadow)"/>
        <text x="60" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${brandName.toUpperCase()}</text>
        <text x="135" y="21" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#475569">${subcategory}</text>
      </g>

      <!-- Top Right Express Delivery & GST -->
      <g transform="translate(760, 45)">
        <!-- Vehicle Badge -->
        <rect x="-210" y="0" width="210" height="30" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="-105" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">
          ${vehicle === "2-Wheeler" ? "⚡ 60-MIN 2-WHEELER" : vehicle.includes("Pickup") ? "🚚 HEAVY E-LOADER" : "🛺 60-MIN E-LOADER"}
        </text>
      </g>

      ${quartzIllustration}
      ${blackMattOverlay}

      <!-- Bottom Card Information Overlay -->
      <g transform="translate(40, 680)">
        <!-- Base card container -->
        <rect x="0" y="0" width="720" height="85" rx="12" fill="#ffffff" fill-opacity="0.96" stroke="#e2e8f0" stroke-width="1.5" filter="url(#badgeShadow)"/>

        <!-- Product Name & Subtext -->
        <text x="24" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#0f172a">
          ${productName.length > 48 ? productName.substring(0, 45) + "..." : productName}
        </text>
        
        <!-- Specs chips -->
        <g transform="translate(24, 42)">
          <!-- Spec 1 -->
          <rect x="0" y="0" width="180" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
          <text x="90" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">${escapeXml(keySpec1)}</text>
          
          <!-- Spec 2 -->
          <rect x="190" y="0" width="180" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
          <text x="280" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">${escapeXml(keySpec2)}</text>

          <!-- HSN / GST -->
          <rect x="380" y="0" width="120" height="24" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
          <text x="440" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#166534" text-anchor="middle">HSN ${hsnCode} (18%)</text>
        </g>

        <!-- Price Display on Right -->
        <g transform="translate(560, 16)">
          <text x="135" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#0f172a" text-anchor="end">₹${price.toLocaleString("en-IN")}</text>
          <text x="135" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="end">Ex-GST ₹${exGst.toLocaleString("en-IN")}</text>
        </g>
      </g>
    </svg>
  `;
}

async function generateSingleImage(prod: KitchenSinkProduct): Promise<{ filename: string; buffer: Buffer; sha256: string }> {
  const filename = path.basename(prod.image);
  const baseAsset = getBaseAssetPath(prod);

  // Create base 800x800 canvas
  let canvas = sharp({
    create: {
      width: 800,
      height: 800,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  });

  const compositeLayers: any[] = [];

  // If we have a base photographic asset, fit it in the center (leave room for top & bottom headers)
  if (baseAsset && fs.existsSync(baseAsset)) {
    try {
      const resizedBase = await sharp(baseAsset)
        .resize(520, 520, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();

      compositeLayers.push({
        input: resizedBase,
        top: 130,
        left: 140,
      });
    } catch (err) {
      console.warn(`Warning: Could not resize base asset ${baseAsset}:`, err);
    }
  }

  // Generate SVG overlay
  const svgOverlay = Buffer.from(generateSvgOverlay(prod));
  compositeLayers.push({
    input: svgOverlay,
    top: 0,
    left: 0,
  });

  const buffer = await canvas
    .composite(compositeLayers)
    .webp({ quality: 90 })
    .toBuffer();

  const sha256 = getSha256(buffer);
  return { filename, buffer, sha256 };
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRunOnly = args.includes("--dry-run");

  console.log("================================================================================");
  console.log(" STEP 6.1: DRY-RUN INSPECTION OF 5 REPRESENTATIVE SKUS                          ");
  console.log("================================================================================");

  for (const sample of KITCHEN_DRY_RUN_SKUS) {
    const prod = ALL_38_KITCHEN_PRODUCTS.find((p) => p.id === sample.id);
    if (!prod) {
      console.error(`[DRY-RUN ERROR] SKU not found: ${sample.id}`);
      continue;
    }
    const baseSrc = getBaseAssetPath(prod);
    const srcExists = baseSrc ? fs.existsSync(baseSrc) : false;

    console.log(`\nSKU [${prod.id}] - ${prod.title}`);
    console.log(`  Subcategory    : ${prod.subCategory} (Match: ${prod.subCategory === sample.expectedCategory ? "YES" : "NO"})`);
    console.log(`  Price (Inc/Ex) : ₹${prod.price} (Ex-GST: ₹${prod.exGstPrice}) | GST: ${prod.gstPercent}% | HSN: ${prod.hsnCode}`);
    console.log(`  Vehicle        : ${prod.deliveryVehicleType} (Match: ${prod.deliveryVehicleType.includes(sample.expectedVehicle) ? "YES" : "NO"})`);
    if (prod.minCabinetWidthMm) {
      console.log(`  Min Cabinet    : ${prod.minCabinetWidthMm}mm (Match: ${sample.expectedCabinet ? sample.expectedCabinet.includes(String(prod.minCabinetWidthMm)) ? "YES" : "NO" : "N/A"})`);
    }
    if (prod.mountType) {
      console.log(`  Mount Type     : ${prod.mountType} (Match: ${sample.expectedMount ? sample.expectedMount === prod.mountType ? "YES" : "NO" : "N/A"})`);
    }
    console.log(`  Target Image   : ${prod.image}`);
    console.log(`  Base Asset     : ${baseSrc || "Custom High-Precision SVG Canvas"} (Exists: ${srcExists ? "YES" : "NO"})`);
  }

  if (isDryRunOnly) {
    console.log("\nDry-run complete. Exiting without writing full catalog images.");
    return;
  }

  console.log("\n================================================================================");
  console.log(" GENERATING ALL 38 KITCHEN SINKS & FAUCETS 800x800 WebP PACKSHOTS               ");
  console.log("================================================================================");

  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch (_) {}
  }

  let count = 0;
  for (const prod of ALL_38_KITCHEN_PRODUCTS) {
    const { filename, buffer, sha256 } = await generateSingleImage(prod);
    const outPath = path.join(outputDir, filename);

    fs.writeFileSync(outPath, buffer);
    const sizeKb = (buffer.length / 1024).toFixed(1) + " KB";

    const relKey = `images/products/kitchen-sinks-faucets/${filename}`;
    manifest[relKey] = {
      filename,
      category: "kitchen-sinks-faucets",
      subCategory: prod.subCategory,
      kitchenSubcategory: prod.kitchenSubcategory,
      sha256,
      sizeBytes: buffer.length,
      width: 800,
      height: 800,
      format: "webp",
      updatedAt: new Date().toISOString(),
    };

    count++;
    console.log(`[${count}/38] ✓ ${filename} | ${sizeKb} | SHA: ${sha256.substring(0, 12)}...`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n✓ Successfully generated all 38 WebP images in ${outputDir}`);
  console.log(`✓ Updated image manifest at ${manifestPath}`);
}

main().catch((err) => {
  console.error("FATAL in generate-kitchen-sinks-images:", err);
  process.exit(1);
});
