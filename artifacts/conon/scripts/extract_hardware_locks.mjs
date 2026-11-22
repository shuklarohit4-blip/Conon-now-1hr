import sharp from "sharp";
import fs from "fs";
import path from "path";

const HINGES_REF = "/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795237639566_460a611f.jpg";
const LOCKS_REF = "/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795237639563_74554031.jpg";

const HINGES_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/hardware";
const LOCKS_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/locks";
const SUBCAT_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories";

fs.mkdirSync(HINGES_DIR, { recursive: true });
fs.mkdirSync(LOCKS_DIR, { recursive: true });
fs.mkdirSync(SUBCAT_DIR, { recursive: true });

async function processCutout(src, crop, outPath) {
  const { data, info } = await sharp(src)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 246;
  const pixels = data.length / 4;
  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i * 4 + 3] = 0;
    } else if (r >= 238 && g >= 238 && b >= 238) {
      const alphaFactor = Math.max(0, 1 - (Math.min(r, g, b) - 238) / (255 - 238));
      data[i * 4 + 3] = Math.round(data[i * 4 + 3] * alphaFactor);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ threshold: 10 })
    .webp({ quality: 92 })
    .toFile(outPath);

  console.log("Created:", outPath);
}

async function run() {
  // ── Hinges Cards ──
  // Card 1: Ebco Soft Close
  await processCutout(HINGES_REF, { left: 266, top: 275, width: 142, height: 110 }, path.join(HINGES_DIR, "ebco-soft-close-hinges-set.webp"));
  // Card 2: Hettich Onsys 4447i
  await processCutout(HINGES_REF, { left: 415, top: 275, width: 142, height: 110 }, path.join(HINGES_DIR, "hettich-onsys-4447i-hinges-set.webp"));
  // Card 3: Ebco Slip On Hinge
  await processCutout(HINGES_REF, { left: 564, top: 275, width: 142, height: 110 }, path.join(HINGES_DIR, "ebco-slip-on-hinge-regular.webp"));
  // Card 4: Premium Door Butt Hinges SS
  await processCutout(HINGES_REF, { left: 713, top: 275, width: 142, height: 110 }, path.join(HINGES_DIR, "premium-ss-butt-hinges.webp"));

  // Subcategory icons for Hinges
  await processCutout(HINGES_REF, { left: 118, top: 200, width: 34, height: 34 }, path.join(SUBCAT_DIR, "hinges-icon.webp"));
  await processCutout(HINGES_REF, { left: 118, top: 260, width: 34, height: 34 }, path.join(SUBCAT_DIR, "drawer-channels-icon.webp"));
  await processCutout(HINGES_REF, { left: 118, top: 320, width: 34, height: 34 }, path.join(SUBCAT_DIR, "handles-profiles-icon.webp"));
  await processCutout(HINGES_REF, { left: 118, top: 390, width: 34, height: 34 }, path.join(SUBCAT_DIR, "wardrobe-pullouts-icon.webp"));
  await processCutout(HINGES_REF, { left: 118, top: 460, width: 34, height: 34 }, path.join(SUBCAT_DIR, "hydraulics-icon.webp"));
  await processCutout(HINGES_REF, { left: 118, top: 530, width: 34, height: 34 }, path.join(SUBCAT_DIR, "grills-accessories-icon.webp"));

  // ── Locks Cards ──
  // Card 1: Europa Main Door Lock Antique Brass
  await processCutout(LOCKS_REF, { left: 266, top: 275, width: 142, height: 110 }, path.join(LOCKS_DIR, "europa-antique-brass-lock.webp"));
  // Card 2: Godrej Tribolt Ultra
  await processCutout(LOCKS_REF, { left: 415, top: 275, width: 142, height: 110 }, path.join(LOCKS_DIR, "godrej-tribolt-ultra-lock.webp"));
  // Card 3: Europa Hexabolt H341
  await processCutout(LOCKS_REF, { left: 564, top: 275, width: 142, height: 110 }, path.join(LOCKS_DIR, "europa-hexabolt-h341-lock.webp"));
  // Card 4: Europa Jemmy Proof J320
  await processCutout(LOCKS_REF, { left: 713, top: 275, width: 142, height: 110 }, path.join(LOCKS_DIR, "europa-jemmy-proof-j320-lock.webp"));

  // Subcategory icons for Locks
  await processCutout(LOCKS_REF, { left: 118, top: 200, width: 34, height: 34 }, path.join(SUBCAT_DIR, "mechanical-locks-icon.webp"));
  await processCutout(LOCKS_REF, { left: 118, top: 260, width: 34, height: 34 }, path.join(SUBCAT_DIR, "glass-door-hardware-icon.webp"));
  await processCutout(LOCKS_REF, { left: 118, top: 320, width: 34, height: 34 }, path.join(SUBCAT_DIR, "cylindrical-locks-icon.webp"));
  await processCutout(LOCKS_REF, { left: 118, top: 380, width: 34, height: 34 }, path.join(SUBCAT_DIR, "wooden-door-hardware-icon.webp"));

  console.log("All Hinges and Locks assets processed successfully!");
}

run().catch(console.error);
