import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { ALL_9_TOOLS_SAFETY_PRODUCTS } from "../artifacts/conon/src/data/toolsSafetyData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outputDir = path.join(publicDir, "images/products/power-tools-safety");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

fs.mkdirSync(outputDir, { recursive: true });

function getSha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

const SOURCE_MAP: Record<string, string> = {
  "prod-tools-bosch-gws-600": path.join(publicDir, "images/products/tools/bosch-gws-600-angle-grinder.webp"),
  "prod-tools-bosch-gbh-2-26-re": path.join(rootDir, "artifacts/conon/src/assets/brands/bosch-drill.png"),
  "prod-tools-bosch-gbh-2-26-dre": path.join(rootDir, "artifacts/conon/src/assets/brands/bosch-drill.png"),
  "prod-tools-taparia-tk-052": path.join(publicDir, "images/products/tools/taparia-screwdriver-set-6pc.webp"),
  "prod-tools-stanley-tylon-5m": path.join(rootDir, "artifacts/conon/src/assets/brands/stanley-tape.png"),
  "prod-safety-karam-pn501": path.join(rootDir, "artifacts/conon/src/assets/brands/karam-helmet.png"),
  "prod-safety-karam-ki01-pn351": path.join(rootDir, "artifacts/conon/src/assets/stock_images/safety-harness.jpg"),
  "prod-safety-3m-fahrenheit": path.join(rootDir, "artifacts/conon/src/assets/stock_images/safety-goggles.jpg"),
  "prod-safety-smasys-jacket": path.join(rootDir, "artifacts/conon/src/assets/stock_images/safety-vest.jpg"),
};

async function main() {
  console.log("=================================================");
  console.log(" STEP 6.1: DRY-RUN CHECK (3 REPRESENTATIVE SKUS) ");
  console.log("=================================================");
  const dryRunSample = [
    ALL_9_TOOLS_SAFETY_PRODUCTS[0], // Bosch GWS 600
    ALL_9_TOOLS_SAFETY_PRODUCTS[3], // Taparia TK-052
    ALL_9_TOOLS_SAFETY_PRODUCTS[5], // Karam PN501
  ];

  for (const item of dryRunSample) {
    const src = SOURCE_MAP[item.id];
    const exists = fs.existsSync(src);
    console.log(`[DRY-RUN] ${item.name}`);
    console.log(`  Subcategory : ${item.subCategory}`);
    console.log(`  GST / HSN   : ${item.gstPercent}% / ${item.hsnCode}`);
    console.log(`  Vehicle     : ${item.deliveryVehicleType} (60-Min Express)`);
    console.log(`  Source Path : ${src} (${exists ? "EXISTS" : "MISSING"})`);
  }

  console.log("\n=================================================");
  console.log(" GENERATING 800x800 WebP PACKSHOTS (9 SKUS)     ");
  console.log("=================================================");

  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch (_) {}
  }

  for (const item of ALL_9_TOOLS_SAFETY_PRODUCTS) {
    const filename = path.basename(item.image);
    const outPath = path.join(outputDir, filename);
    const sourceFile = SOURCE_MAP[item.id];

    if (!sourceFile || !fs.existsSync(sourceFile)) {
      console.error(`ERROR: Source file missing for ${item.name}: ${sourceFile}`);
      continue;
    }

    const buffer = await sharp(sourceFile)
      .resize(800, 800, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(outPath, buffer);
    const sha256 = getSha256(buffer);
    const sizeKb = (buffer.length / 1024).toFixed(1) + " KB";

    const relKey = `images/products/power-tools-safety/${filename}`;
    manifest[relKey] = {
      filename,
      category: "power-tools-safety",
      subCategory: item.subCategory,
      sha256,
      sizeBytes: buffer.length,
      width: 800,
      height: 800,
      format: "webp",
      updatedAt: new Date().toISOString(),
    };

    console.log(`✓ [Generated] ${filename} | ${sizeKb} | SHA: ${sha256.substring(0, 12)}...`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\nUpdated manifest at ${manifestPath}`);
  console.log(`Total 9 SKUs processed and stored in ${outputDir}\n`);
}

main().catch((err) => {
  console.error("Image generation failed:", err);
  process.exit(1);
});
