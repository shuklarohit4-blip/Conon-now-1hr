import sharp from 'sharp';
import path from 'path';

const SRC = '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795243783883_197b8a0a.jpg';
const OUT_DIR = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/adhesives';
const SUBCAT_DIR = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories';

async function extractCleanProduct(c) {
  const { data, info } = await sharp(SRC)
    .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Zero out the blue ribbon on top left (x < 28, y < 30)
  for (let y = 0; y < 30; y++) {
    for (let x = 0; x < 28; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if ((b > 130 && b > r + 25) || (r > 240 && g > 240 && b > 240)) {
        data[idx + 3] = 0;
      }
    }
  }

  // Flood fill / remove white background starting from borders
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBackground(x, y) {
    const idx = (y * width + x) * channels;
    if (data[idx + 3] === 0) return true;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    return (r > 245 && g > 245 && b > 245);
  }

  for (let x = 0; x < width; x++) {
    if (isBackground(x, 0)) { queue.push(x, 0); visited[x] = 1; }
    if (isBackground(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBackground(0, y) && !visited[y * width]) { queue.push(0, y); visited[y * width] = 1; }
    if (isBackground(width - 1, y) && !visited[y * width + width - 1]) { queue.push(width - 1, y); visited[y * width + width - 1] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const pIdx = (cy * width + cx) * channels;
    data[pIdx + 3] = 0;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex] && isBackground(nx, ny)) {
          visited[nIndex] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Find non-transparent bounding box
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  const croppedPng = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: minX, top: minY, width: bw, height: bh })
    .png()
    .toBuffer();

  const scale = Math.min(320 / bw, 320 / bh);
  const targetW = Math.round(bw * scale);
  const targetH = Math.round(bh * scale);

  const resized = await sharp(croppedPng)
    .resize(targetW, targetH, { fit: 'contain' })
    .png()
    .toBuffer();

  const canvas = sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  const finalWebp = await canvas
    .composite([
      {
        input: resized,
        top: Math.round((400 - targetH) / 2),
        left: Math.round((400 - targetW) / 2)
      }
    ])
    .webp({ quality: 95 })
    .toBuffer();

  const outFile = path.join(OUT_DIR, c.id + '.webp');
  await sharp(finalWebp).toFile(outFile);
  console.log('Saved:', outFile);
}

async function run() {
  const cards = [
    { id: 'fevicol-heatx-heatproof-adhesive-500g', x: 262, y: 278, w: 142, h: 108 },
    { id: 'fevicol-marine-waterproof-adhesive-1kg', x: 414, y: 278, w: 142, h: 108 },
    { id: 'fevicol-probond-special-pvc-adhesive-1kg', x: 567, y: 278, w: 142, h: 108 },
    { id: 'fevicol-sh-adhesive-1kg-synthetic-resin', x: 720, y: 278, w: 142, h: 108 }
  ];

  for (const c of cards) {
    await extractCleanProduct(c);
  }

  // Extract the 3 subcategory icons
  // 1. Wood Adhesives (Fevicol HeatX Can in circle)
  await sharp(SRC)
    .extract({ left: 130, top: 198, width: 36, height: 36 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(SUBCAT_DIR, 'wood-adhesives-icon.webp'));

  // 2. Epoxy & Special Adhesives (Araldite Tubes in circle)
  await sharp(SRC)
    .extract({ left: 130, top: 258, width: 36, height: 36 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(SUBCAT_DIR, 'epoxy-special-adhesives-icon.webp'));

  // 3. Sealants (M-Seal Box in circle)
  await sharp(SRC)
    .extract({ left: 130, top: 318, width: 36, height: 36 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(SUBCAT_DIR, 'sealants-icon.webp'));

  console.log('Saved Fevicol subcategory icons');
}

run().catch(console.error);
