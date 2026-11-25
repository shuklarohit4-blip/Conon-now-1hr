const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

const PUBLIC_PRODUCTS_DIR = path.resolve(__dirname, '../artifacts/conon/public/images/products');
const ATTACHED_ASSETS_DIR = path.resolve(__dirname, '../artifacts/conon/src/assets');

// Ensure base dir exists
fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });

// Helper to sanitize slug
function toSlug(str) {
  return str
    .replace(/½/g, 'half-inch')
    .replace(/¾/g, 'three-quarter-inch')
    .replace(/¼/g, 'one-quarter-inch')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to save a standardized 600x600 webp packshot on white canvas
async function saveStandardPackshot(inputBufferOrPath, outPath, options = {}) {
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const padRatio = options.padRatio || 0.88; // 88% of canvas, 12% padding
  const innerSize = Math.round(600 * padRatio);

  try {
    let pipeline = sharp(inputBufferOrPath);
    const meta = await pipeline.metadata();

    // Resize inside 528x528 with contain
    const resized = await sharp(inputBufferOrPath)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent during resize
      })
      .toBuffer();

    // Composite onto 600x600 white background
    await sharp({
      create: {
        width: 600,
        height: 600,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resized, gravity: 'center' }])
      .webp({ quality: 85, effort: 4 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    return { ok: true, size: stats.size };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Helper to fetch remote image with retry and timeout
async function fetchImageBuffer(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) throw new Error('File too small or empty');
    return buf;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Export for module or execute
module.exports = {
  PUBLIC_PRODUCTS_DIR,
  ATTACHED_ASSETS_DIR,
  toSlug,
  saveStandardPackshot,
  fetchImageBuffer
};
