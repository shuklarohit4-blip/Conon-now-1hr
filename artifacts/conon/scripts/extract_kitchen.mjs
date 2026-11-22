import sharp from "sharp";
import fs from "fs";
import path from "path";

const KITCHEN_REF = "/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795259893190_06c960b2.jpg";

const KITCHEN_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/kitchen";
const SUBCAT_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories";

fs.mkdirSync(KITCHEN_DIR, { recursive: true });
fs.mkdirSync(SUBCAT_DIR, { recursive: true });

async function processSinkPackshot(src, crop, outPath) {
  // Extract and save directly as high-res WebP with rounded corners matching the reference
  await sharp(src)
    .extract(crop)
    .webp({ quality: 95 })
    .toFile(outPath);
  console.log("Created:", outPath);
}

async function extractIcon(src, crop, outPath) {
  await sharp(src)
    .extract(crop)
    .resize(64, 64, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 92 })
    .toFile(outPath);
  console.log("Icon created:", outPath);
}

async function run() {
  console.log("Extracting kitchen sink packshots and icons...");

  // Row 1 Packshots (cards 1 - 4)
  // Card 1: Futura Dura SS Sink
  await processSinkPackshot(KITCHEN_REF, { left: 266, top: 278, width: 142, height: 134 }, path.join(KITCHEN_DIR, "futura-dura-ss-sink.webp"));
  // Card 2: Futura Dura SS Sink with Drainboard
  await processSinkPackshot(KITCHEN_REF, { left: 415, top: 278, width: 142, height: 134 }, path.join(KITCHEN_DIR, "futura-dura-ss-sink-drainboard.webp"));
  // Card 3: Futura Undermount Series SS Sink
  await processSinkPackshot(KITCHEN_REF, { left: 564, top: 278, width: 142, height: 134 }, path.join(KITCHEN_DIR, "futura-undermount-series-ss-sink.webp"));
  // Card 4: Futura Hand Carved Series SS Sink
  await processSinkPackshot(KITCHEN_REF, { left: 713, top: 278, width: 142, height: 134 }, path.join(KITCHEN_DIR, "futura-hand-carved-series-ss-sink.webp"));

  // Subcategory Icons
  await extractIcon(KITCHEN_REF, { left: 124, top: 226, width: 28, height: 28 }, path.join(SUBCAT_DIR, "ss-sinks-icon.webp"));
  await extractIcon(KITCHEN_REF, { left: 124, top: 280, width: 28, height: 28 }, path.join(SUBCAT_DIR, "quartz-sinks-icon.webp"));
  await extractIcon(KITCHEN_REF, { left: 124, top: 338, width: 28, height: 28 }, path.join(SUBCAT_DIR, "faucets-icon.webp"));
  await extractIcon(KITCHEN_REF, { left: 124, top: 396, width: 28, height: 28 }, path.join(SUBCAT_DIR, "kitchen-accessories-hardware-icon.webp"));

  console.log("All kitchen assets extracted successfully!");
}

run().catch(console.error);
