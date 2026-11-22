import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const HOME_DIR = process.cwd();
const PUBLIC_DIR = path.resolve(HOME_DIR, 'artifacts/conon/public');
const BRAIN_DIR = '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43';
const OUT_DIR = path.resolve(PUBLIC_DIR, 'images/home-categories');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Alpha matting helper to ensure 100% transparency on white/near-white backgrounds
async function alphaMatteWhite(inputPathOrBuffer, threshold = 236) {
  const { data, info } = await sharp(inputPathOrBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const outBuf = Buffer.from(data);
  for (let i = 0; i < outBuf.length; i += 4) {
    const r = outBuf[i];
    const g = outBuf[i + 1];
    const b = outBuf[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      outBuf[i + 3] = 0;
    }
  }
  return sharp(outBuf, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

// Grounding drop shadow SVG generator
function getShadowSvg(width = 512, height = 512) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0f172a" stop-opacity="0.22" />
          <stop offset="60%" stop-color="#0f172a" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.00" />
        </radialGradient>
      </defs>
      <ellipse cx="${width / 2}" cy="${height * 0.88}" rx="${width * 0.38}" ry="${height * 0.05}" fill="url(#shadow)" />
    </svg>
  `);
}

// Composite 3 transparent product packshots into a balanced flagship cluster
async function composeCluster(heroPath, leftPath, rightPath, shadowSvg, threshold = 236) {
  const [heroMatted, leftMatted, rightMatted] = await Promise.all([
    alphaMatteWhite(heroPath, threshold),
    alphaMatteWhite(leftPath, threshold),
    alphaMatteWhite(rightPath, threshold),
  ]);

  const [heroTrimmed, leftTrimmed, rightTrimmed] = await Promise.all([
    sharp(heroMatted).trim().toBuffer(),
    sharp(leftMatted).trim().toBuffer(),
    sharp(rightMatted).trim().toBuffer(),
  ]);

  const [heroBuf, leftBuf, rightBuf] = await Promise.all([
    sharp(heroTrimmed).resize(250, 260, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
    sharp(leftTrimmed).resize(210, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
    sharp(rightTrimmed).resize(210, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(),
  ]);

  return sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadowSvg, top: 0, left: 0 },
      { input: leftBuf, top: 150, left: 35 },
      { input: rightBuf, top: 150, left: 265 },
      { input: heroBuf, top: 135, left: 131 },
    ])
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
}

// Process AI generated cluster packshot
async function processAiCluster(srcPath, shadowSvg, quality = 85) {
  const mattedPngBuf = await alphaMatteWhite(srcPath, 238);
  const trimmed = await sharp(mattedPngBuf).trim().toBuffer();

  const resizedProduct = await sharp(trimmed)
    .resize(440, 410, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  return sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadowSvg, top: 0, left: 0 },
      { input: resizedProduct, top: 40, left: 36 },
    ])
    .webp({ quality, effort: 5 })
    .toBuffer();
}

// Process Clean Existing SVG/WebP Cluster
async function processCleanCluster(srcPath, shadowSvg) {
  const mattedPngBuf = await alphaMatteWhite(srcPath, 238);
  const trimmed = await sharp(mattedPngBuf).trim().toBuffer();

  const productBuf = await sharp(trimmed)
    .resize(440, 400, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  return sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadowSvg, top: 0, left: 0 },
      { input: productBuf, top: 45, left: 36 },
    ])
    .webp({ quality: 88, effort: 4 })
    .toBuffer();
}

async function run() {
  console.log('=== Building High-Fidelity 18 Category Packshot Clusters ===\n');
  const shadowSvg = getShadowSvg(512, 512);

  const categories = [
    {
      slug: 'cctv-networking',
      fn: () => processAiCluster(path.join(BRAIN_DIR, 'cctv_networking_cluster_1795239943767.jpg'), shadowSvg),
    },
    {
      slug: 'cpvc-plumbing-tanks',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/plumbing/astral-cpvc-flowguard-gold-pipe-1-inch-3m-length-hot-cold-water-supply.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/plumbing/ashirvad-3-layer-tank-1000l.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/plumbing/astral-cpvc-solvent-cement-250ml.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'cement-civil-works',
      fn: () => processCleanCluster(path.resolve(PUBLIC_DIR, 'images/categories/cement.webp'), shadowSvg),
    },
    {
      slug: 'plywood-boards',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/wood/century-club-prime-19mm-bwr.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/wood/greenply-bwp-marine-19mm-8-4.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/wood/action-tesa-hdhmr-18mm.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'fevicol-adhesives-sealants',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/adhesives/fevicol-sh-50kg-drum-synthetic-resin-wood-adhesive-pidilite.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/adhesives/fevicol-marine-5kg.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/adhesives/araldite-standard-90g.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'wires-mcb-electrical',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/electrical/finolex-1-5-sqmm-90m.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/electrical/havells-isolator-dp-40a.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/electrical/anchor-roma-modular-switch.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'kitchen-sinks-faucets',
      fn: () => processAiCluster(path.join(BRAIN_DIR, 'kitchen_sinks_cluster_1795239978508.jpg'), shadowSvg),
    },
    {
      slug: 'furniture-wardrobe-bed-hardware',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/hardware/ebco-telescopic-channel-18.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/hardware/hettich-onsys-soft-close-hinge.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/hardware/hettich-cabinet-handle-6-ss.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'modular-kitchen-systems',
      fn: () => processAiCluster(path.join(BRAIN_DIR, 'modular_kitchen_systems_cluster_1795239997551.jpg'), shadowSvg, 80),
    },
    {
      slug: 'door-hardware-locks',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/hardware/godrej-digi-smart-lock.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/hardware/dorset-mortise-handle.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/hardware/godrej-nav-tal-7.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'sanitary-bath-fittings',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/plumbing/hindware-one-piece-ewc.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/plumbing/hindware-counter-top-basin.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/plumbing/jaquar-alive-basin-faucet.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'tile-stone-installation',
      fn: () => processCleanCluster(path.resolve(PUBLIC_DIR, 'images/categories/tiling.webp'), shadowSvg),
    },
    {
      slug: 'home-appliances',
      fn: () => processAiCluster(path.join(BRAIN_DIR, 'home_appliances_cluster_1795239961735.jpg'), shadowSvg),
    },
    {
      slug: 'lighting',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/electrical/havells-led-bulb-12w-warm.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/electrical/havells-led-flood-50w.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/electrical/havells-led-bulb-15w-cool.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'painting',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/paint/royale-luxury-emulsion-20l.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/paint/asian-paints-apex-weatherproof-exterior-emulsion-20l-dust-algae-guard.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/paint/premium-roller-9-frame.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'safety-workwear',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/safety/karam-pn-521-helmet-isi.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/safety/safari-safety-vest-reflective.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/safety/karam-fs-51-full-harness.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'tools-hardware',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/tools/stanley-claw-hammer-570g.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/tools/taparia-plier-combo-set.webp'),
        shadowSvg
      ),
    },
    {
      slug: 'waterproofing-repairing',
      fn: () => composeCluster(
        path.resolve(PUBLIC_DIR, 'images/products/paint/dr-fixit-dampguard-20kg.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/paint/dr-fixit-pidicrete-urp-1l.webp'),
        path.resolve(PUBLIC_DIR, 'images/products/paint/smartcare-damp-proof-20kg.webp'),
        shadowSvg
      ),
    },
  ];

  for (const item of categories) {
    try {
      const buf = await item.fn();
      const outPath = path.resolve(OUT_DIR, `${item.slug}.webp`);
      fs.writeFileSync(outPath, buf);
      const sizeKb = (buf.length / 1024).toFixed(1);
      console.log(`✓ ${item.slug}.webp (${sizeKb} KB)`);
    } catch (err) {
      console.error(`✗ Error building ${item.slug}:`, err.message);
    }
  }

  console.log('\n=== All 18 Category Clusters Built Successfully ===');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
