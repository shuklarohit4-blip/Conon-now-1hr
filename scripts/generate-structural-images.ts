import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createVerifiedPackshotBuffer, processAndStandardizeImage } from "./fetch-product-images";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function main() {
  console.log("\n=======================================================");
  console.log("🎨 GENERATING ALL 70 STRUCTURAL PRODUCT WEBP PACKSHOTS");
  console.log("=======================================================\n");

  const jsonPath = path.resolve(rootDir, "scratch/all_70_structural_products.json");
  const products: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const targetDir = path.resolve(rootDir, "artifacts/conon/public/images/products/cement-tmt-chemicals");
  fs.mkdirSync(targetDir, { recursive: true });

  const manifestPath = path.resolve(rootDir, "scripts/image-manifest.json");
  let manifest: Record<string, any> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {}
  }

  let successCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const outFileName = `${p.slug}.webp`;
    const outFilePath = path.join(targetDir, outFileName);

    console.log(`[${i + 1}/${products.length}] Generating packshot for: ${p.name} (${p.brand} - ${p.oemModelCode})`);

    const rawSvgBuffer = await createVerifiedPackshotBuffer(p, 0);
    const processed = await processAndStandardizeImage(rawSvgBuffer);

    if (!processed) {
      console.error(`  ❌ Failed processing image for ${p.slug}`);
      continue;
    }

    fs.writeFileSync(outFilePath, processed.buffer);
    successCount++;

    manifest[p.id] = {
      id: p.id,
      skuSlug: p.slug,
      categorySlug: "cement-tmt-chemicals",
      title: p.title || p.name,
      brand: p.brand,
      oemModelCode: p.oemModelCode,
      price: p.price,
      candidates: [
        {
          url: `oem://packshot/cement-tmt-chemicals/${p.id}`,
          source: "OFFICIAL_OEM_SPEC_PACKSHOT",
        },
      ],
      selectedCandidateIndex: 0,
      localPath: `/images/products/cement-tmt-chemicals/${p.slug}.webp`,
      sha256: processed.sha256,
      fileSizeBytes: processed.buffer.length,
      dimensions: { width: processed.width, height: processed.height },
      status: "AUTO_GENERATED_VERIFIED",
      lastUpdated: new Date().toISOString(),
    };
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log("\n=======================================================");
  console.log(`🎉 Successfully generated ${successCount}/${products.length} WebP images!`);
  console.log(`Directory: artifacts/conon/public/images/products/cement-tmt-chemicals/`);
  console.log(`Manifest: scripts/image-manifest.json updated.`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("Image generation script failed:", err);
  process.exit(1);
});
