const path = require("path");
const sharp = require(path.resolve(__dirname, "../node_modules/sharp"));
const fs = require("fs");

async function removeWhiteBgBFS(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  
  // Visited array
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBgPixel(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r > 215 && g > 215 && b > 215 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
  }

  // Seed with outer border pixels
  for (let x = 0; x < width; x++) {
    // top row
    const topIdx = (0 * width + x);
    if (isBgPixel(topIdx * channels)) {
      visited[topIdx] = 1;
      queue.push(topIdx);
    }
    // bottom row
    const botIdx = ((height - 1) * width + x);
    if (isBgPixel(botIdx * channels)) {
      visited[botIdx] = 1;
      queue.push(botIdx);
    }
  }

  for (let y = 0; y < height; y++) {
    // left col
    const leftIdx = (y * width + 0);
    if (!visited[leftIdx] && isBgPixel(leftIdx * channels)) {
      visited[leftIdx] = 1;
      queue.push(leftIdx);
    }
    // right col
    const rightIdx = (y * width + (width - 1));
    if (!visited[rightIdx] && isBgPixel(rightIdx * channels)) {
      visited[rightIdx] = 1;
      queue.push(rightIdx);
    }
  }

  // BFS
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cy > 0 ? (cy - 1) * width + cx : -1,
      cy < height - 1 ? (cy + 1) * width + cx : -1,
      cx > 0 ? cy * width + (cx - 1) : -1,
      cx < width - 1 ? cy * width + (cx + 1) : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !visited[n]) {
        if (isBgPixel(n * channels)) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // Set alpha for all background pixels connected to edges
  for (let i = 0; i < width * height; i++) {
    if (visited[i]) {
      const idx = i * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const minVal = Math.min(r, g, b);
      if (minVal >= 240) {
        data[idx + 3] = 0;
      } else {
        const factor = (240 - minVal) / 25;
        data[idx + 3] = Math.max(0, Math.min(255, Math.round(factor * 255)));
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .trim()
    .resize(500, 500, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(outputPath);

  console.log(`[OK] Cutout saved: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

async function main() {
  const outDir = path.resolve("artifacts/conon/public/images/hero");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const items = [
    { src: "attached_assets/brands/asianpaints-bucket.png", dest: "asianpaints-bucket.webp" },
    { src: "attached_assets/brands/fevicol-drum.png", dest: "fevicol-drum.webp" },
    { src: "attached_assets/brands/drfixit-bucket.png", dest: "drfixit-bucket.webp" },
    { src: "attached_assets/brands/bosch-drill.png", dest: "bosch-drill.webp" },
    { src: "attached_assets/brands/godrej-lock.png", dest: "godrej-lock.webp" },
    { src: "attached_assets/brands/acc-cement.png", dest: "acc-cement.webp" },
    { src: "attached_assets/brands/birla-cement.png", dest: "birla-cement.webp" },
    { src: "attached_assets/brands/birlawhite-putty.png", dest: "birlawhite-putty.webp" },
    { src: "attached_assets/brands/actiontesa-mdf.png", dest: "actiontesa-mdf.webp" },
    { src: "attached_assets/brands/centuryply-ply.png", dest: "centuryply-ply.webp" },
    { src: "attached_assets/brands/hettich-hinge.png", dest: "hettich-hinge.webp" },
    { src: "attached_assets/brands/polycab-wire.png", dest: "polycab-wire.webp" },
    { src: "attached_assets/brands/finolex-wire.png", dest: "finolex-wire.webp" },
    { src: "attached_assets/brands/roff-adhesive.png", dest: "roff-adhesive.webp" },
    { src: "attached_assets/brands/dewalt-grinder.png", dest: "dewalt-grinder.webp" },
    { src: "attached_assets/brands/jaquar-faucet.png", dest: "jaquar-faucet.webp" }
  ];

  for (const item of items) {
    if (fs.existsSync(item.src)) {
      await removeWhiteBgBFS(item.src, path.join(outDir, item.dest));
    } else {
      console.warn("Missing:", item.src);
    }
  }
}

main().catch(err => {
  console.error("Cutout error:", err);
  process.exit(1);
});
