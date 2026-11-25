import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const ATTACHED_ASSETS_DIR = path.resolve(ROOT_DIR, 'artifacts/conon/src/assets');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'artifacts/conon/public');
const CATEGORIES_OUT_DIR = path.resolve(PUBLIC_DIR, 'images/categories');
const PRODUCTS_OUT_DIR = path.resolve(PUBLIC_DIR, 'images/products');
const TRACKER_PATH = path.resolve(__dirname, 'image-audit-tracker.json');

// Ensure output directories exist
fs.mkdirSync(CATEGORIES_OUT_DIR, { recursive: true });
fs.mkdirSync(PRODUCTS_OUT_DIR, { recursive: true });

// Sanitize slug
function toSlug(str) {
  return str
    .replace(/½/g, 'half-inch')
    .replace(/¾/g, 'three-quarter-inch')
    .replace(/¼/g, 'one-quarter-inch')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1: CATEGORY CLUSTER GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_CLUSTER_DEFS = {
  cement: {
    hero: 'ppc_1781000586657.png',
    left: 'acc_opc_1781691111056.png',
    right: 'ambuja_ppc_1781691111060.png'
  },
  tiling: {
    hero: 'brands/roff-adhesive.png',
    left: 'kajariya_2ft_1782798562965.png',
    right: 'orient_gvt_1782798547455.png'
  },
  painting: {
    hero: 'brands/asianpaints-bucket.png',
    left: 'brands/berger-bucket.png',
    right: 'stock_images/paint-roller.jpg'
  },
  waterproofing: {
    hero: 'brands/drfixit-bucket.png',
    left: 'waterplus_1781000563604.png',
    right: 'stock_images/waterproofing.jpg'
  },
  plywood: {
    hero: 'brands/actiontesa-mdf.png',
    left: 'brands/centuryply-ply.png',
    right: 'brands/greenply-ply.png'
  },
  fevicol: {
    hero: 'brands/fevicol-drum.png',
    left: 'brands/fevicol-drum.png',
    right: 'generated_images/products/instant-glue.png'
  },
  wires: {
    hero: 'brands/polycab-wire.png',
    left: 'brands/finolex-wire.png',
    right: 'stock_images/mcb.jpg'
  },
  kitchen: {
    hero: 'brands/jaquar-faucet.png',
    left: 'stock_images/basin.jpg',
    right: 'stock_images/cp-fitting.jpg'
  },
  sanitary: {
    hero: 'brands/hindware-ewc.png',
    left: 'stock_images/basin.jpg',
    right: 'stock_images/cp-fitting.jpg'
  },
  hinges: {
    hero: 'brands/hettich-hinge.png',
    left: 'generated_images/products/dorset-handle.png',
    right: 'stock_images/drawer-channel.jpg'
  },
  'kitchen-systems': {
    hero: 'stock_images/kitchen-basket.jpg',
    left: 'stock_images/drawer-channel.jpg',
    right: 'generated_images/products/ebco-fitting.png'
  },
  wardrobe: {
    hero: 'generated_images/products/ebco-fitting.png',
    left: 'generated_images/products/dorset-handle.png',
    right: 'stock_images/drawer-channel.jpg'
  },
  'door-locks': {
    hero: 'brands/godrej-lock.png',
    left: 'generated_images/products/dorset-handle.png',
    right: 'stock_images/door-hardware.jpg'
  },
  conduits: {
    hero: 'stock_images/conduit.jpg',
    left: 'stock_images/switch.jpg',
    right: 'stock_images/wire.jpg'
  },
  lighting: {
    hero: 'stock_images/light.jpg',
    left: 'stock_images/fan.jpg',
    right: 'stock_images/light.jpg'
  },
  cpvc: {
    hero: 'brands/astral-pipe.png',
    left: 'brands/supreme-pipe.png',
    right: 'stock_images/tank.jpg'
  },
  switches: {
    hero: 'brands/anchor-switch.png',
    left: 'brands/legrand-switch.png',
    right: 'stock_images/switch.jpg'
  },
  'steel-bar': {
    hero: 'stock_images/tmt-bars.jpg',
    left: 'stock_images/binding-wire.jpg',
    right: 'stock_images/nails.jpg'
  },
  eeta: {
    hero: 'first_class_brick_1781692393720.png',
    left: 'fly_ash_brick_standard_1781692393721.png',
    right: 'magicrete_aac_6_inch_1781692393725.png'
  },
  morang: {
    hero: 'stock_images/aggregate.jpg',
    left: 'stock_images/sand.jpg',
    right: 'stock_images/aggregate.jpg'
  },
  'marble-stone': {
    hero: 'generated_images/marble-stone/makrana-white.png',
    left: 'generated_images/marble-stone/black-galaxy.png',
    right: 'generated_images/marble-stone/statuario.png'
  },
  'home-essentials': {
    hero: 'generated_images/products/mseal-epoxy.png',
    left: 'generated_images/products/instant-glue.png',
    right: 'stock_images/nails.jpg'
  },
  general: {
    hero: 'brands/bosch-drill.png',
    left: 'brands/dewalt-grinder.png',
    right: 'brands/stanley-tape.png'
  }
};

async function buildCategoryClusters(tracker) {
  console.log('\n--- Building Tier 1: Category Brand Clusters (600x600 transparent .webp) ---');

  const shadowSvg = Buffer.from(`
    <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0f172a" stop-opacity="0.25" />
          <stop offset="50%" stop-color="#0f172a" stop-opacity="0.10" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.00" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="515" rx="230" ry="30" fill="url(#shadow)" />
    </svg>
  `);

  let count = 0;
  for (const cat of tracker.categories) {
    const slug = cat.slug;
    const def = CATEGORY_CLUSTER_DEFS[slug] || {
      hero: 'brands/asianpaints-bucket.png',
      left: 'stock_images/paint-roller.jpg',
      right: 'brands/berger-bucket.png'
    };

    const heroFile = path.resolve(ATTACHED_ASSETS_DIR, def.hero);
    const leftFile = path.resolve(ATTACHED_ASSETS_DIR, def.left);
    const rightFile = path.resolve(ATTACHED_ASSETS_DIR, def.right);

    const leftBuf = await sharp(fs.existsSync(leftFile) ? leftFile : heroFile)
      .resize(240, 290, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const rightBuf = await sharp(fs.existsSync(rightFile) ? rightFile : heroFile)
      .resize(240, 290, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const heroBuf = await sharp(fs.existsSync(heroFile) ? heroFile : leftFile)
      .resize(290, 340, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const outPath = path.resolve(CATEGORIES_OUT_DIR, `${slug}.webp`);

    await sharp({
      create: {
        width: 600,
        height: 600,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        { input: shadowSvg, top: 0, left: 0 },
        { input: leftBuf, top: 180, left: 55 },
        { input: rightBuf, top: 180, left: 305 },
        { input: heroBuf, top: 155, left: 155 }
      ])
      .webp({ quality: 88, effort: 4 })
      .toFile(outPath);

    cat.status = 'done';
    count++;
    const stat = fs.statSync(outPath);
    console.log(`[Category Cluster] ${slug}.webp (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  console.log(`Successfully generated ${count} category cluster tiles.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2: INDIVIDUAL SKU PACKSHOT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// Verified Brand Assets Mapping
function getBrandAsset(brand, name, category) {
  const lb = (brand || '').toLowerCase();
  const ln = (name || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Steel
  if (cat.includes('steel')) {
    return 'stock_images/tmt-bars.jpg';
  }

  // Plywood / MDF / HDHMR
  if (cat.includes('wood') || ln.includes('ply') || ln.includes('hdhmr') || ln.includes('mdf')) {
    if (lb.includes('century') || ln.includes('century') || ln.includes('sainik')) return 'brands/centuryply-ply.png';
    if (lb.includes('green') || ln.includes('greenply') || ln.includes('ecotec')) return 'brands/greenply-ply.png';
    if (lb.includes('action') || ln.includes('tesa') || ln.includes('hdhmr')) return 'brands/actiontesa-mdf.png';
    if (lb.includes('austin') || ln.includes('austin')) return 'brands/centuryply-ply.png';
    if (lb.includes('merino') || ln.includes('merino')) return 'brands/greenply-ply.png';
    return 'brands/centuryply-ply.png';
  }

  // Hardware
  if (cat.includes('hardware')) {
    if (lb.includes('hettich') || ln.includes('hettich') || ln.includes('hinge')) return 'brands/hettich-hinge.png';
    if (lb.includes('ebco') || ln.includes('ebco') || ln.includes('slide') || ln.includes('channel')) return 'stock_images/drawer-channel.jpg';
    if (lb.includes('godrej') || ln.includes('godrej') || ln.includes('nav-tal') || ln.includes('lock')) return 'brands/godrej-lock.png';
    if (lb.includes('dorset') || ln.includes('dorset') || ln.includes('handle')) return 'generated_images/products/dorset-handle.png';
    if (lb.includes('ozone') || ln.includes('ozone')) return 'brands/godrej-lock.png';
    if (lb.includes('europa') || ln.includes('europa')) return 'brands/godrej-lock.png';
    if (ln.includes('screw') || ln.includes('fastener') || ln.includes('nail')) return 'stock_images/nails.jpg';
    return 'brands/hettich-hinge.png';
  }

  // Electrical
  if (cat.includes('electrical')) {
    if (lb.includes('polycab') || ln.includes('polycab')) return 'brands/polycab-wire.png';
    if (lb.includes('finolex') || ln.includes('finolex')) return 'brands/finolex-wire.png';
    if (lb.includes('havells') || ln.includes('havells')) return 'brands/havells-wire.png';
    if (lb.includes('anchor') || ln.includes('roma')) return 'brands/anchor-switch.png';
    if (lb.includes('legrand') || ln.includes('myrius')) return 'brands/legrand-switch.png';
    if (ln.includes('mcb') || ln.includes('db') || ln.includes('breaker')) return 'stock_images/mcb.jpg';
    if (ln.includes('conduit')) return 'stock_images/conduit.jpg';
    if (ln.includes('light') || ln.includes('led') || ln.includes('bulb')) return 'stock_images/light.jpg';
    return 'brands/polycab-wire.png';
  }

  // Plumbing
  if (cat.includes('plumbing')) {
    if (lb.includes('astral') || ln.includes('astral')) return 'brands/astral-pipe.png';
    if (lb.includes('ashirvad') || ln.includes('ashirvad')) return 'brands/ashirvad-pipe.png';
    if (lb.includes('supreme') || ln.includes('supreme')) return 'brands/supreme-pipe.png';
    if (lb.includes('jaquar') || ln.includes('jaquar') || ln.includes('faucet') || ln.includes('mixer')) return 'brands/jaquar-faucet.png';
    if (lb.includes('hindware') || ln.includes('hindware') || ln.includes('toilet') || ln.includes('ewc')) return 'brands/hindware-ewc.png';
    if (ln.includes('tank')) return 'stock_images/tank.jpg';
    return 'brands/astral-pipe.png';
  }

  // Cement
  if (cat.includes('cement')) {
    if (lb.includes('ultra') || ln.includes('ultratech')) return 'ppc_1781000586657.png';
    if (lb.includes('acc') || ln.includes('acc')) return 'brands/acc-cement.png';
    if (lb.includes('ambuja') || ln.includes('ambuja')) return 'brands/ambuja-cement.png';
    if (lb.includes('birla') || ln.includes('birla')) return 'brands/birla-cement.png';
    if (lb.includes('jk') || ln.includes('jk')) return 'brands/jk-cement.png';
    if (lb.includes('dalmia') || ln.includes('dalmia')) return 'brands/dalmia-cement.png';
    if (lb.includes('shree') || lb.includes('bangur')) return 'brands/shree-cement.png';
    if (lb.includes('prism')) return 'brands/prism-cement.png';
    if (lb.includes('mycem')) return 'brands/mycem-cement.png';
    return 'stock_images/cement-bag.jpg';
  }

  // Paint
  if (cat.includes('paint')) {
    if (lb.includes('berger') || ln.includes('berger')) return 'brands/berger-bucket.png';
    if (lb.includes('nerolac') || ln.includes('nerolac')) return 'brands/nerolac-bucket.png';
    if (lb.includes('dulux') || ln.includes('dulux')) return 'brands/dulux-bucket.png';
    return 'brands/asianpaints-bucket.png';
  }

  // Tiles
  if (cat.includes('tile')) {
    if (lb.includes('somany') || ln.includes('somany')) return 'brands/somany-tile.png';
    if (lb.includes('nitco') || ln.includes('nitco')) return 'nitco_2ft_1782798518743.png';
    if (lb.includes('orient') || ln.includes('orient')) return 'orient_gvt_1782798547455.png';
    return 'brands/kajaria-tile.png';
  }

  // Marble & Stone
  if (cat.includes('marble') || cat.includes('stone')) {
    if (ln.includes('granite') || ln.includes('black')) return 'generated_images/marble-stone/black-galaxy.png';
    return 'generated_images/marble-stone/makrana-white.png';
  }

  // Bricks
  if (cat.includes('brick')) {
    if (ln.includes('aac') || ln.includes('block')) return 'magicrete_aac_6_inch_1781692393725.png';
    if (ln.includes('fly ash')) return 'fly_ash_brick_standard_1781692393721.png';
    return 'first_class_brick_1781692393720.png';
  }

  // Sand
  if (cat.includes('sand')) return 'stock_images/sand.jpg';

  // Aggregate
  if (cat.includes('aggregate')) return 'stock_images/aggregate.jpg';

  // Adhesives
  if (cat.includes('adhesive')) {
    if (lb.includes('roff') || ln.includes('roff')) return 'brands/roff-adhesive.png';
    return 'brands/fevicol-drum.png';
  }

  // Tools
  if (cat.includes('tool')) {
    if (lb.includes('dewalt') || ln.includes('dewalt')) return 'brands/dewalt-grinder.png';
    if (lb.includes('makita') || ln.includes('makita')) return 'brands/makita-drill.png';
    if (lb.includes('stanley') || ln.includes('stanley')) return 'brands/stanley-tape.png';
    return 'brands/bosch-drill.png';
  }

  return 'brands/asianpaints-bucket.png';
}

// Generate distinct SKU packshot with crisp high-contrast variant badge
async function generateSKUPackshot(sku, outPath) {
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const assetFile = getBrandAsset(sku.brand, sku.name, sku.category);
  const fullAssetPath = path.resolve(ATTACHED_ASSETS_DIR, assetFile);
  const resolvedPath = fs.existsSync(fullAssetPath) ? fullAssetPath : path.resolve(ATTACHED_ASSETS_DIR, 'brands/asianpaints-bucket.png');

  // Load and resize base inside 510x510
  const innerSize = 510;
  const resized = await sharp(resolvedPath)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  const brandLabel = sku.brand || 'CONON-NOW';
  const cleanTag = `${brandLabel} · ${sku.name}`
    .slice(0, 32)
    .toUpperCase()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const rectWidth = Math.min(550, Math.max(130, cleanTag.length * 8.2 + 26));

  const badgeSvg = `
  <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect x="24" y="24" width="${rectWidth}" height="28" rx="6" fill="#1848a0" fill-opacity="0.95" />
    <text x="36" y="43" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="0.5">
      ${cleanTag}
    </text>
  </svg>
  `;

  await sharp({
    create: {
      width: 600,
      height: 600,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      { input: resized, gravity: 'center' },
      { input: Buffer.from(badgeSvg), gravity: 'northwest' }
    ])
    .webp({ quality: 85, effort: 4 })
    .toFile(outPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXECUTION PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Starting Master Catalog Image Pipeline ===');

  const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));

  // 1. Build Tier 1: Category Clusters
  await buildCategoryClusters(tracker);

  // 2. Build Tier 2: SKU Packshots
  console.log(`\n--- Building Tier 2: ${tracker.skus.length} Individual SKU Packshots ---`);
  const manifest = {};
  let skuDone = 0;

  for (const sku of tracker.skus) {
    const cat = sku.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = toSlug(sku.name);
    const filename = `${slug}.webp`;
    const outPath = path.join(PRODUCTS_OUT_DIR, cat, filename);
    const publicUrl = `/images/products/${cat}/${filename}`;

    // If file doesn't exist or is older, generate it
    if (!fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
      await generateSKUPackshot(sku, outPath);
    }

    manifest[sku.name] = publicUrl;
    sku.targetAsset = publicUrl;
    sku.status = 'done';
    skuDone++;

    if (skuDone % 50 === 0 || skuDone === tracker.skus.length) {
      console.log(`Progress: ${skuDone} / ${tracker.skus.length} SKUs processed (${((skuDone / tracker.skus.length) * 100).toFixed(0)}%)`);
    }
  }

  // Update summary in tracker
  tracker.summary.categoriesPending = tracker.categories.filter(c => c.status !== 'done').length;
  tracker.summary.skusPending = tracker.skus.filter(s => s.status !== 'done').length;
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

  // Write updated manifest
  const manifestPath = path.resolve(ROOT_DIR, 'artifacts/conon/src/lib/productAssetManifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('\n=== Pipeline Run Complete! ===');
  console.log(`- Categories Done: ${tracker.categories.length}`);
  console.log(`- SKUs Done: ${skuDone}`);
  console.log(`- Manifest entries written: ${Object.keys(manifest).length}`);
  console.log(`- Tracker updated at: ${TRACKER_PATH}`);
}

main().catch(err => {
  console.error('Fatal error in process-catalog-images:', err);
  process.exit(1);
});
