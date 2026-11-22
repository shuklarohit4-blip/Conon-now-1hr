import sharp from "sharp";
import fs from "fs";
import path from "path";

const ELEC_REF = "/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795244412782_0e840eec.jpg";

const ELEC_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/electrical";
const SUBCAT_DIR = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories";

fs.mkdirSync(ELEC_DIR, { recursive: true });
fs.mkdirSync(SUBCAT_DIR, { recursive: true });

async function processBorderFloodFill(src, crop, outPath, bgThreshold = 240) {
  const { data, info } = await sharp(src)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const isVisited = new Uint8Array(width * height);
  const queue = [];

  function isBg(idx) {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    return r >= bgThreshold && g >= bgThreshold && b >= bgThreshold;
  }

  // Push border pixels
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const botIdx = (height - 1) * width + x;
    if (isBg(topIdx)) { isVisited[topIdx] = 1; queue.push(topIdx); }
    if (isBg(botIdx)) { isVisited[botIdx] = 1; queue.push(botIdx); }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isBg(leftIdx)) { isVisited[leftIdx] = 1; queue.push(leftIdx); }
    if (isBg(rightIdx)) { isVisited[rightIdx] = 1; queue.push(rightIdx); }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // Set alpha to transparent
    data[curr * 4 + 3] = 0;

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !isVisited[n] && isBg(n)) {
        isVisited[n] = 1;
        queue.push(n);
      }
    }
  }

  await sharp(data, {
    raw: { width, height, channels: 4 }
  })
    .trim({ threshold: 5 })
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
  console.log("Extracting clean electrical packshots and icons...");

  // Row 1 Packshots (cards 1 - 4) with height 94 to cleanly exclude price text below
  await processBorderFloodFill(ELEC_REF, { left: 266, top: 276, width: 142, height: 94 }, path.join(ELEC_DIR, "polycab-maxima-green-wire-hr-fr-lsh.webp"));
  await processBorderFloodFill(ELEC_REF, { left: 415, top: 276, width: 142, height: 94 }, path.join(ELEC_DIR, "finolex-silver-fr-wire.webp"));
  await processBorderFloodFill(ELEC_REF, { left: 564, top: 276, width: 142, height: 94 }, path.join(ELEC_DIR, "anchor-panasonic-advance-fr-wire.webp"));
  await processBorderFloodFill(ELEC_REF, { left: 713, top: 276, width: 142, height: 94 }, path.join(ELEC_DIR, "kei-homecab-fr-wire.webp"));

  // 8 Subcategory Icons
  await extractIcon(ELEC_REF, { left: 124, top: 226, width: 28, height: 28 }, path.join(SUBCAT_DIR, "electrical-wires-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 280, width: 28, height: 28 }, path.join(SUBCAT_DIR, "cat6-cables-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 338, width: 28, height: 28 }, path.join(SUBCAT_DIR, "db-mcb-protection-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 396, width: 28, height: 28 }, path.join(SUBCAT_DIR, "conduits-gi-boxes-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 454, width: 28, height: 28 }, path.join(SUBCAT_DIR, "modular-switches-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 512, width: 28, height: 28 }, path.join(SUBCAT_DIR, "electrical-sockets-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 568, width: 28, height: 28 }, path.join(SUBCAT_DIR, "modular-plates-icon.webp"));
  await extractIcon(ELEC_REF, { left: 124, top: 622, width: 28, height: 28 }, path.join(SUBCAT_DIR, "wiring-accessories-icon.webp"));

  console.log("All clean electrical assets processed successfully!");
}

run().catch(console.error);
