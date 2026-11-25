const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

const BASE_DIR = path.resolve(__dirname, '..');
const ATTACHED_ASSETS = path.resolve(BASE_DIR, 'artifacts/conon/src/assets');
const PUBLIC_DIR = path.resolve(BASE_DIR, 'artifacts/conon/public');
const PUBLIC_PRODUCTS_DIR = path.resolve(PUBLIC_DIR, 'images/products');
const MANIFEST_PATH = path.resolve(BASE_DIR, 'artifacts/conon/src/lib/productAssetManifest.json');
const USER_REF_IMG = '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795235785852_021bc1fa.jpg';

// Helper to ensure directory exists
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── 1. STEEL TAG GENERATOR (Matching User Reference Image) ────────────────────
function createSteelTagSvg(brand, diameterText, gradeText = 'Fe550D') {
  let brandName = 'TATA';
  let subName = 'TISCON';
  let tagline = 'JOY OF BUILDING';
  let topTextColor = '#0c2a5e';
  let subColor = '#0d428f';
  let gradStart = '#0d418c';
  let gradEnd = '#072d66';
  let accentColor = '#e03a2f';

  if (brand === 'jsw') {
    brandName = 'JSW';
    subName = 'NEOSTEEL';
    tagline = 'PURE TMT BARS';
    topTextColor = '#0a235c';
    subColor = '#0b2e75';
    gradStart = '#0b2e75';
    gradEnd = '#05183d';
    accentColor = '#d9251d';
  } else if (brand === 'jindal') {
    brandName = 'JINDAL';
    subName = 'PANTHER';
    tagline = 'TMT REBARS';
    topTextColor = '#151515';
    subColor = '#e65100';
    gradStart = '#e65100';
    gradEnd = '#b23c00';
    accentColor = '#111111';
  } else if (brand === 'kamdhenu') {
    brandName = 'KAMDHENU';
    subName = 'NXT';
    tagline = 'NEXT GEN INTERLOCK';
    topTextColor = '#0f5132';
    subColor = '#198754';
    gradStart = '#198754';
    gradEnd = '#0b4d26';
    accentColor = '#dc3545';
  } else if (brand === 'sail') {
    brandName = 'SAIL';
    subName = 'SeQR';
    tagline = 'SAFETY &amp; STRENGTH';
    topTextColor = '#0c2a5e';
    subColor = '#0056b3';
    gradStart = '#0056b3';
    gradEnd = '#002752';
    accentColor = '#ffc107';
  }

  return Buffer.from(`
  <svg width="165" height="230" viewBox="0 0 165 230" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="tagShadow" x="-20%" y="-15%" width="145%" height="140%">
        <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.55" />
      </filter>
      <linearGradient id="tagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}" />
        <stop offset="100%" stop-color="${gradEnd}" />
      </linearGradient>
    </defs>

    <!-- Metal hanging wire loop connecting tag to rebar strap -->
    <path d="M 80 0 L 76 18 M 80 0 L 84 18" stroke="#a0aab8" stroke-width="2.5" fill="none" />
    <path d="M 72 3 L 88 3" stroke="#8892a0" stroke-width="2.5" fill="none" />

    <!-- Main Hanging Card -->
    <g filter="url(#tagShadow)">
      <!-- Pure solid opaque white card body completely covering any underlying area -->
      <rect x="5" y="8" width="150" height="212" rx="14" fill="#ffffff" />
      
      <!-- Punch hole with metallic brass eyelet -->
      <circle cx="80" cy="20" r="5" fill="#1e252e" />
      <circle cx="80" cy="20" r="6" stroke="#d4af37" stroke-width="1.5" fill="none" />

      <!-- Brand Logo / Header -->
      <text x="80" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="900" fill="${topTextColor}" text-anchor="middle" letter-spacing="1.5">${brandName}</text>
      
      <text x="80" y="76" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="900" fill="${subColor}" text-anchor="middle" letter-spacing="0.8">${subName}</text>
      
      <!-- Decorative brand accent line -->
      <rect x="25" y="83" width="110" height="2.5" rx="1" fill="${accentColor}" />

      <!-- Subtitle / Tagline -->
      <text x="80" y="99" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="800" fill="#556377" text-anchor="middle" letter-spacing="0.8">${tagline}</text>

      <!-- Bottom colored block -->
      <path d="M 5 110 L 155 110 L 155 206 Q 155 220 141 220 L 19 220 Q 5 220 5 206 Z" fill="url(#tagGrad)" />

      <!-- Grade & Diameter Label -->
      <text x="80" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">${gradeText}</text>
      <text x="80" y="190" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.4">${diameterText}</text>
    </g>
  </svg>
  `);
}

// ─── 2. PROCESS AND SAVE A PACKSHOT ──────────────────────────────────────────
async function savePackshot(inputPathOrBuffer, outRelativePath, options = {}) {
  const fullOut = path.resolve(PUBLIC_DIR, outRelativePath.replace(/^\//, ''));
  ensureDir(fullOut);

  let pipeline = sharp(inputPathOrBuffer);
  if (options.crop) {
    pipeline = pipeline.extract(options.crop);
  }
  if (options.resize) {
    pipeline = pipeline.resize(options.resize.width, options.resize.height, {
      fit: options.resize.fit || 'contain',
      background: options.resize.background || { r: 255, g: 255, b: 255, alpha: 1 }
    });
  } else {
    pipeline = pipeline.resize(600, 600, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    });
  }

  if (options.composite) {
    pipeline = pipeline.composite(options.composite);
  }

  await pipeline.webp({ quality: 90, effort: 4 }).toFile(fullOut);
  console.log('✓ Saved:', outRelativePath);
}

async function main() {
  console.log('=== Building 100% Real Brand Product Packshots ===\n');

  // Load existing manifest
  let manifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 1: STEEL & TMT BARS (Matching User Attached Reference Image)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- Generating Steel & TMT Bars Packshots ---');
  const baseSteelBuffer = await sharp(USER_REF_IMG)
    .extract({ left: 30, top: 0, width: 575, height: 575 })
    .resize(600, 600)
    .toBuffer();

  // 1. Tata Tiscon 8mm (The exact user photograph)
  await sharp(baseSteelBuffer)
    .webp({ quality: 92 })
    .toFile(path.resolve(PUBLIC_PRODUCTS_DIR, 'steel/tata-tiscon-8mm-tmt-fe500d.webp'));
  manifest['Tata Tiscon 8mm TMT Fe500D'] = '/images/products/steel/tata-tiscon-8mm-tmt-fe500d.webp';

  // 2. Tata Tiscon 10mm, 12mm, 16mm, 20mm
  const tataSizes = [
    { mm: '10 mm', grade: 'Fe550D', slug: 'tata-tiscon-10mm-tmt-fe500d', name: 'Tata Tiscon 10mm TMT Fe500D' },
    { mm: '12 mm', grade: 'Fe550D', slug: 'tata-tiscon-12mm-tmt-fe500d', name: 'Tata Tiscon 12mm TMT Fe500D' },
    { mm: '16 mm', grade: 'Fe550D', slug: 'tata-tiscon-16mm-tmt-fe550d', name: 'Tata Tiscon 16mm TMT Fe550D' },
    { mm: '20 mm', grade: 'Fe550D', slug: 'tata-tiscon-20mm-tmt-fe550d', name: 'Tata Tiscon 20mm TMT Fe550D' },
  ];
  for (const item of tataSizes) {
    const tag = createSteelTagSvg('tata', item.mm, item.grade);
    const outRel = `/images/products/steel/${item.slug}.webp`;
    await sharp(baseSteelBuffer)
      .composite([{ input: tag, left: 58, top: 345 }])
      .webp({ quality: 90 })
      .toFile(path.resolve(PUBLIC_DIR, outRel.replace(/^\//, '')));
    manifest[item.name] = outRel;
    // Also mirror to tmt-steel directory
    ensureDir(path.resolve(PUBLIC_PRODUCTS_DIR, `tmt-steel/${item.slug}.webp`));
    await fs.promises.copyFile(
      path.resolve(PUBLIC_DIR, outRel.replace(/^\//, '')),
      path.resolve(PUBLIC_PRODUCTS_DIR, `tmt-steel/${item.slug}.webp`)
    );
  }

  // 3. JSW Neosteel (8mm, 10mm, 12mm, 16mm, 20mm)
  const jswSizes = [
    { mm: '8 mm', grade: 'Fe 550D', slug: 'jsw-neosteel-8mm-tmt-fe500d', name: 'JSW Neosteel 8mm TMT Fe500D' },
    { mm: '10 mm', grade: 'Fe 550D', slug: 'jsw-neosteel-10mm-tmt-fe500d', name: 'JSW Neosteel 10mm TMT Fe500D' },
    { mm: '12 mm', grade: 'Fe 550D', slug: 'jsw-neosteel-12mm-tmt-fe500d', name: 'JSW Neosteel 12mm TMT Fe500D' },
    { mm: '16 mm', grade: 'Fe 550D', slug: 'jsw-neosteel-16mm-tmt-fe550d', name: 'JSW Neosteel 16mm TMT Fe550D' },
    { mm: '20 mm', grade: 'Fe 550D', slug: 'jsw-neosteel-20mm-tmt-fe550d', name: 'JSW Neosteel 20mm TMT Fe550D' },
  ];
  for (const item of jswSizes) {
    const tag = createSteelTagSvg('jsw', item.mm, item.grade);
    const outRel = `/images/products/steel/${item.slug}.webp`;
    await sharp(baseSteelBuffer)
      .composite([{ input: tag, left: 58, top: 345 }])
      .webp({ quality: 90 })
      .toFile(path.resolve(PUBLIC_DIR, outRel.replace(/^\//, '')));
    manifest[item.name] = outRel;
  }

  // 4. Jindal Panther (8mm, 10mm, 12mm, 16mm)
  const jindalSizes = [
    { mm: '8 mm', grade: 'Fe 550D', slug: 'jindal-panther-8mm-tmt-fe500d', name: 'Jindal Panther 8mm TMT Fe500D' },
    { mm: '10 mm', grade: 'Fe 550D', slug: 'jindal-panther-10mm-tmt-fe500d', name: 'Jindal Panther 10mm TMT Fe500D' },
    { mm: '12 mm', grade: 'Fe 550D', slug: 'jindal-panther-12mm-tmt-fe550d', name: 'Jindal Panther 12mm TMT Fe550D' },
    { mm: '16 mm', grade: 'Fe 550D', slug: 'jindal-panther-16mm-tmt-fe550d', name: 'Jindal Panther 16mm TMT Fe550D' },
  ];
  for (const item of jindalSizes) {
    const tag = createSteelTagSvg('jindal', item.mm, item.grade);
    const outRel = `/images/products/steel/${item.slug}.webp`;
    await sharp(baseSteelBuffer)
      .composite([{ input: tag, left: 58, top: 345 }])
      .webp({ quality: 90 })
      .toFile(path.resolve(PUBLIC_DIR, outRel.replace(/^\//, '')));
    manifest[item.name] = outRel;
  }

  // 5. Kamdhenu NXT & SAIL SeQR
  const kamdhenuSizes = [
    { mm: '8 mm', grade: 'Fe 550D', slug: 'kamdhenu-nxt-8mm-tmt-fe500d', name: 'Kamdhenu NXT 8mm TMT Fe500D' },
    { mm: '10 mm', grade: 'Fe 550D', slug: 'kamdhenu-nxt-10mm-tmt-fe500d', name: 'Kamdhenu NXT 10mm TMT Fe500D' },
    { mm: '12 mm', grade: 'Fe 550D', slug: 'kamdhenu-nxt-12mm-tmt-fe500d', name: 'Kamdhenu NXT 12mm TMT Fe500D' },
    { mm: '16 mm', grade: 'Fe 550D', slug: 'kamdhenu-16mm-tmt-fe550d', name: 'Kamdhenu 16mm TMT Fe550D' },
  ];
  for (const item of kamdhenuSizes) {
    const tag = createSteelTagSvg('kamdhenu', item.mm, item.grade);
    const outRel = `/images/products/steel/${item.slug}.webp`;
    await sharp(baseSteelBuffer)
      .composite([{ input: tag, left: 58, top: 345 }])
      .webp({ quality: 90 })
      .toFile(path.resolve(PUBLIC_DIR, outRel.replace(/^\//, '')));
    manifest[item.name] = outRel;
  }

  const sailSizes = [
    { mm: '8 mm', grade: 'Fe 500D', slug: 'sail-seqr-8mm-tmt-fe500', name: 'SAIL SeQR 8mm TMT Fe500' },
    { mm: '10 mm', grade: 'Fe 500D', slug: 'sail-seqr-10mm-tmt-fe500d', name: 'SAIL SeQR 10mm TMT Fe500D' },
    { mm: '12 mm', grade: 'Fe 500D', slug: 'sail-seqr-12mm-tmt-fe500d', name: 'SAIL SeQR 12mm TMT Fe500D' },
    { mm: '16 mm', grade: 'Fe 500D', slug: 'sail-seqr-16mm-tmt-fe500d', name: 'SAIL SeQR 16mm TMT Fe500D' },
  ];
  for (const item of sailSizes) {
    const tag = createSteelTagSvg('sail', item.mm, item.grade);
    const outRel = `/images/products/steel/${item.slug}.webp`;
    await sharp(baseSteelBuffer)
      .composite([{ input: tag, left: 58, top: 345 }])
      .webp({ quality: 90 })
      .toFile(path.resolve(PUBLIC_DIR, outRel.replace(/^\//, '')));
    manifest[item.name] = outRel;
  }

  // 6. GI Annealed Binding Wire 18 Gauge
  const bindingWireSrc = path.resolve(ATTACHED_ASSETS, 'stock_images/binding-wire.jpg');
  await savePackshot(bindingWireSrc, '/images/products/steel/gi-binding-wire-18-gauge-25kg.webp', {
    crop: { left: 200, top: 0, width: 853, height: 853 }
  });
  manifest['GI Binding Wire 18 Gauge 25kg'] = '/images/products/steel/gi-binding-wire-18-gauge-25kg.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 2: CEMENT PACKSHOTS (Real Printed Bags)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Cement Real Packshots ---');
  // UltraTech Weather Plus
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'waterplus_1781000563604.png'),
    '/images/products/cement/ultratech-weatherplus.webp'
  );
  manifest['UltraTech Weather Plus'] = '/images/products/cement/ultratech-weatherplus.webp';
  manifest['UltraTech Weatherplus'] = '/images/products/cement/ultratech-weatherplus.webp';

  // UltraTech Super OPC 53
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'super_opc_1781000603180.png'),
    '/images/products/cement/ultratech-opc-53-grade.webp'
  );
  manifest['UltraTech OPC 53 Grade'] = '/images/products/cement/ultratech-opc-53-grade.webp';
  manifest['UltraTech Super'] = '/images/products/cement/ultratech-opc-53-grade.webp';

  // ACC Suraksha Power+
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'acc_suraksha_1781691111058.png'),
    '/images/products/cement/acc-suraksha-ppc.webp'
  );
  manifest['ACC Suraksha Power+'] = '/images/products/cement/acc-suraksha-ppc.webp';
  manifest['ACC Suraksha PPC'] = '/images/products/cement/acc-suraksha-ppc.webp';

  // Ambuja Kawach Waterproof
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'ambuja_kawatch_1781691111059.png'),
    '/images/products/cement/ambuja-kawach.webp'
  );
  manifest['Ambuja Kawach'] = '/images/products/cement/ambuja-kawach.webp';

  // Birla Samrat Chetak
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'birla_opc_1781691111061.png'),
    '/images/products/cement/birla-samrat-opc.webp'
  );
  manifest['Birla Samrat'] = '/images/products/cement/birla-samrat-opc.webp';

  // Dalmia DSP Special Concrete
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'dalmia_opc_1781692393719.png'),
    '/images/products/cement/dalmia-dsp-opc.webp'
  );
  manifest['Dalmia DSP'] = '/images/products/cement/dalmia-dsp-opc.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 3: PLYWOOD, MDF & HDHMR
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Plywood & Boards Real Packshots ---');
  // CenturyPly Club Prime Marine 18mm
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/centuryply-ply.png'),
    '/images/products/wood/centuryply-marine-ply-19mm.webp'
  );
  manifest['CenturyPly Marine Ply 19mm'] = '/images/products/wood/centuryply-marine-ply-19mm.webp';

  // Action TESA HDHMR 18mm
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/actiontesa-mdf.png'),
    '/images/products/wood/action-tesa-hdhmr-18mm.webp'
  );
  manifest['Action Tesa HDHMR 18mm'] = '/images/products/wood/action-tesa-hdhmr-18mm.webp';

  // Greenply Platinum Marine 18mm
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/greenply-ply.png'),
    '/images/products/wood/greenply-marine-ply-19mm.webp'
  );
  manifest['Greenply Marine Ply 19mm'] = '/images/products/wood/greenply-marine-ply-19mm.webp';

  // CenturyPly Film Faced Shuttering Plywood 12mm
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/plywood.jpg'),
    '/images/products/wood/centuryply-shuttering-ply-12mm.webp'
  );
  manifest['CenturyPly Shuttering Ply 12mm'] = '/images/products/wood/centuryply-shuttering-ply-12mm.webp';

  // Fevicol SH 50kg Drum
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/fevicol-drum.png'),
    '/images/products/wood/fevicol-sh-50kg-drum.webp'
  );
  manifest['Fevicol SH 50kg Drum'] = '/images/products/wood/fevicol-sh-50kg-drum.webp';

  // Merino High Gloss Laminate Sheet 1mm
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'generated_images/products/laminate-sheet.png'),
    '/images/products/wood/merino-laminate-1mm.webp'
  );
  manifest['Merino High Gloss Decorative Laminate Sheet 1mm'] = '/images/products/wood/merino-laminate-1mm.webp';
  manifest['Action Tesa Pre-Laminated 18mm'] = '/images/products/wood/merino-laminate-1mm.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 4: HARDWARE & FITTINGS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Hardware Real Packshots ---');
  // Hettich Telescopic Drawer Slide
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/drawer-channel.jpg'),
    '/images/products/hardware/hettich-drawer-channel-18.webp',
    { crop: { left: 249, top: 0, width: 782, height: 782 } }
  );
  manifest['Hettich Telescopic Drawer Slide 18 inch'] = '/images/products/hardware/hettich-drawer-channel-18.webp';

  // Hettich Soft Close Concealed Hinge
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/hettich-hinge.png'),
    '/images/products/hardware/hettich-soft-close-hinge.webp'
  );
  manifest['Hettich Onsys Soft Close Hinge'] = '/images/products/hardware/hettich-soft-close-hinge.webp';

  // Godrej Nav-Tal 7 Levers Brass Padlock
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/godrej-lock.png'),
    '/images/products/hardware/godrej-nav-tal-7.webp'
  );
  manifest['Godrej Nav-Tal 7 Levers'] = '/images/products/hardware/godrej-nav-tal-7.webp';

  // Dorset Premium Brass Mortise Handle Set
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'generated_images/products/dorset-handle.png'),
    '/images/products/hardware/dorset-mortise-handle.webp'
  );
  manifest['Dorset Mortise Handle Brass'] = '/images/products/hardware/dorset-mortise-handle.webp';

  // Bosch GSB 500W Impact Drill
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/bosch-drill.png'),
    '/images/products/hardware/bosch-hammer-drill-500w.webp'
  );
  manifest['Bosch GSB 500W Impact Drill'] = '/images/products/hardware/bosch-hammer-drill-500w.webp';

  // Ozone Heavy Duty Hydraulic Door Closer
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/door-hardware.jpg'),
    '/images/products/hardware/ozone-hydraulic-closer.webp',
    { crop: { left: 160, top: 0, width: 958, height: 958 } }
  );
  manifest['Ozone Heavy Duty Overhead Hydraulic Door Closer'] = '/images/products/hardware/ozone-hydraulic-closer.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 5: WATERPROOFING & ADHESIVES
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Waterproofing & Adhesives Packshots ---');
  // Dr. Fixit 302 Super Latex 5kg
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/drfixit-bucket.png'),
    '/images/products/adhesives/dr-fixit-urp-302-5kg.webp'
  );
  manifest['Dr. Fixit Pidicrete URP 5L'] = '/images/products/adhesives/dr-fixit-urp-302-5kg.webp';

  // Dr. Fixit LW+ 5L
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/drfixit-bucket.png'),
    '/images/products/adhesives/dr-fixit-lw-plus-5l.webp'
  );
  manifest['Dr. Fixit LW+ 5L'] = '/images/products/adhesives/dr-fixit-lw-plus-5l.webp';
  manifest['Dr. Fixit Pidicrete URP 1L'] = '/images/products/adhesives/dr-fixit-lw-plus-5l.webp';

  // Roff New Construction Tile Adhesive 20kg
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/roff-adhesive.png'),
    '/images/products/adhesives/roff-new-construction-20kg.webp'
  );
  manifest['Roff MasterFix Tile Adhesive 20kg'] = '/images/products/adhesives/roff-new-construction-20kg.webp';

  // Fevicol Marine 5kg
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/fevicol-drum.png'),
    '/images/products/adhesives/fevicol-marine-5kg.webp'
  );
  manifest['Fevicol Marine Waterproof Wood Adhesive 5kg'] = '/images/products/adhesives/fevicol-marine-5kg.webp';

  // Fevicol HeatX 1L
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'generated_images/products/instant-glue.png'),
    '/images/products/adhesives/fevicol-heatx-1l.webp'
  );
  manifest['Fevicol HeatX Fast Heat Resistant Adhesive 1L'] = '/images/products/adhesives/fevicol-heatx-1l.webp';

  // M-Seal Multi-Surface Epoxy Compound 1kg
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'generated_images/products/mseal-epoxy.png'),
    '/images/products/adhesives/m-seal-epoxy-1kg.webp'
  );
  manifest['M-Seal General Purpose Multi-Surface Epoxy Compound 1kg'] = '/images/products/adhesives/m-seal-epoxy-1kg.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 6: TILES & NATURAL STONE
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Tiles & Natural Stone Packshots ---');
  // Kajaria Vitrified 2x2 ft
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'kajariya_2ft_1782798562965.png'),
    '/images/products/tiles/kajaria-vitrified-2x2.webp'
  );
  manifest['Kajaria Vitrified 2×2 ft'] = '/images/products/tiles/kajaria-vitrified-2x2.webp';

  // Kajaria PGVT Italian Statuario 4x2 ft
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'Kajaria_pGVT_4×2_ft_1782798562966.png'),
    '/images/products/tiles/kajaria-pgvt-4x2.webp'
  );
  manifest['Kajaria PGVT 4×2 ft (Polished)'] = '/images/products/tiles/kajaria-pgvt-4x2.webp';

  // Somany Ceramic Floor Tile
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/somany-tile.png'),
    '/images/products/tiles/somany-anti-skid-bathroom.webp'
  );
  manifest['Somany Ceramic 2×2 ft'] = '/images/products/tiles/somany-anti-skid-bathroom.webp';
  manifest['Somany Anti-Skid Ceramic Floor Tiles 1×1 ft'] = '/images/products/tiles/somany-anti-skid-bathroom.webp';

  // Black Galaxy South Indian Granite Slab
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'generated_images/marble-stone/black-galaxy.png'),
    '/images/products/tiles/black-galaxy-granite-18mm.webp'
  );
  manifest['Black Galaxy Granite'] = '/images/products/tiles/black-galaxy-granite-18mm.webp';

  // Makrana Pure White Marble Slab
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'generated_images/marble-stone/makrana-white.png'),
    '/images/products/tiles/makrana-white-marble.webp'
  );
  manifest['Makrana Pure White Marble'] = '/images/products/tiles/makrana-white-marble.webp';

  // Roff Rainbow Epoxy Tile Grout
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/tile-adhesive.jpg'),
    '/images/products/tiles/roff-tile-grout-epoxy-1kg.webp',
    { crop: { left: 200, top: 0, width: 854, height: 854 } }
  );
  manifest['Roff Rainbow Epoxy Tile Grout (Waterproof) 1kg'] = '/images/products/tiles/roff-tile-grout-epoxy-1kg.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 7: ELECTRICALS & WIRES
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Electricals & Wires Packshots ---');
  // Polycab Maxima+ 2.5 sq mm wire
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/polycab-wire.png'),
    '/images/products/electrical/polycab-2-5-sqmm-90m.webp'
  );
  manifest['Polycab Maxima+ 2.5 sq mm'] = '/images/products/electrical/polycab-2-5-sqmm-90m.webp';

  // Finolex FRLS 1.5 sq mm wire
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/finolex-wire.png'),
    '/images/products/electrical/finolex-1-5-sqmm-90m.webp'
  );
  manifest['Finolex 1.5 sq mm Flame Retardant'] = '/images/products/electrical/finolex-1-5-sqmm-90m.webp';

  // Havells Life Line 4.0 sq mm wire
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/havells-wire.png'),
    '/images/products/electrical/havells-4-0-sqmm-90m.webp'
  );
  manifest['Havells Life Line 4.0 sq mm'] = '/images/products/electrical/havells-4-0-sqmm-90m.webp';

  // Schneider Electric Acti9 32A DP MCB
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/mcb.jpg'),
    '/images/products/electrical/schneider-32a-dp-mcb.webp',
    { crop: { left: 213, top: 0, width: 853, height: 853 } }
  );
  manifest['Schneider Electric Acti9 32A Double Pole C-Curve MCB'] = '/images/products/electrical/schneider-32a-dp-mcb.webp';

  // Anchor Roma Classic 6A Switch
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/anchor-switch.png'),
    '/images/products/electrical/anchor-roma-modular-switch.webp'
  );
  manifest['Anchor Roma Switch 6A'] = '/images/products/electrical/anchor-roma-modular-switch.webp';

  // Legrand Arteor 6 Module Plate
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/legrand-switch.png'),
    '/images/products/electrical/legrand-arteor-6m-plate.webp'
  );
  manifest['Legrand Arteor 6 Module White Grid & Cover Plate'] = '/images/products/electrical/legrand-arteor-6m-plate.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 8: PLUMBING & SANITARY
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Plumbing & Sanitary Packshots ---');
  // Astral CPVC Pro Pipe 1 inch
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/astral-pipe.png'),
    '/images/products/plumbing/astral-cpvc-pro-1-inch.webp'
  );
  manifest['Astral CPVC 1 inch (3m)'] = '/images/products/plumbing/astral-cpvc-pro-1-inch.webp';

  // Ashirvad FlowGuard Pipe 3/4 inch
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/ashirvad-pipe.png'),
    '/images/products/plumbing/ashirvad-flowguard-3-4-inch.webp'
  );
  manifest['Astral CPVC ¾ inch (3m)'] = '/images/products/plumbing/ashirvad-flowguard-3-4-inch.webp';

  // Supreme SWR Drainage PVC Pipe 4 inch
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/supreme-pipe.png'),
    '/images/products/plumbing/supreme-swr-pvc-4-inch.webp'
  );
  manifest['Supreme SWR Drainage PVC Pipe 4 inch (3m Rubber Ring)'] = '/images/products/plumbing/supreme-swr-pvc-4-inch.webp';

  // Jaquar Alive Basin Mixer Tap Chrome
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/jaquar-faucet.png'),
    '/images/products/plumbing/jaquar-alive-basin-faucet.webp'
  );
  manifest['Jaquar Alive Single Lever Basin Mixer'] = '/images/products/plumbing/jaquar-alive-basin-faucet.webp';

  // Hindware Italian Collection Ceramic Closet
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/hindware-ewc.png'),
    '/images/products/plumbing/hindware-one-piece-ewc.webp'
  );
  manifest['Hindware Italian Collection Ceramic'] = '/images/products/plumbing/hindware-one-piece-ewc.webp';

  // Astral CPVC Solvent Cement 250ml
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/pipe-fittings.jpg'),
    '/images/products/plumbing/astral-cpvc-solvent-cement-250ml.webp',
    { crop: { left: 280, top: 0, width: 720, height: 720 } }
  );
  manifest['Astral CPVC Heavy Duty Pipe Solvent Cement 250ml'] = '/images/products/plumbing/astral-cpvc-solvent-cement-250ml.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 9: BRICKS, SAND & AGGREGATE
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Bricks, Sand & Aggregate Packshots ---');
  // Screened River Sand Silt-Washed Plaster Grade
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/sand.jpg'),
    '/images/products/sand/screened-river-sand-cft.webp',
    { crop: { left: 200, top: 0, width: 853, height: 853 } }
  );
  manifest['Screened River Sand'] = '/images/products/sand/screened-river-sand-cft.webp';

  // Double-Washed Plaster Sand P-Sand Ultra Smooth
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/sand.jpg'),
    '/images/products/sand/plaster-fine-sand-cft.webp',
    { crop: { left: 0, top: 0, width: 853, height: 853 } }
  );
  manifest['Fine River Sand (Zone III)'] = '/images/products/sand/plaster-fine-sand-cft.webp';

  // 20mm Machine-Crushed Blue Metal Stone Gitti
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/aggregate.jpg'),
    '/images/products/aggregate/gitti-20mm-cft.webp',
    { crop: { left: 200, top: 0, width: 850, height: 850 } }
  );
  manifest['20mm Stone Aggregate'] = '/images/products/aggregate/gitti-20mm-cft.webp';

  // 10mm High Compaction Stone Chips
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'stock_images/aggregate.jpg'),
    '/images/products/aggregate/stone-chips-10mm-cft.webp',
    { crop: { left: 0, top: 0, width: 850, height: 850 } }
  );
  manifest['10mm Stone Chips'] = '/images/products/aggregate/stone-chips-10mm-cft.webp';

  // Red Clay Burnt Kiln Bricks Grade 1 Awval Eeta
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'first_class_brick_1781692393720.png'),
    '/images/products/bricks/first-class-red-brick.webp'
  );
  manifest['First Class Red Brick'] = '/images/products/bricks/first-class-red-brick.webp';

  // Magicrete AAC Lightweight Block 6 Inch
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'magicrete_aac_6_inch_1781692393725.png'),
    '/images/products/bricks/magicrete-aac-block-6.webp'
  );
  manifest['Magicrete AAC 6 inch'] = '/images/products/bricks/magicrete-aac-block-6.webp';

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 10: PAINTS, PUTTY & EXTERIOR
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- Generating Paints & Putty Packshots ---');
  // Birla White Wall Seal Putty 40kg
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'birla_white_putty_1782798620454.png'),
    '/images/products/paint/birla-white-putty-40kg.webp'
  );
  manifest['Birla White WallSeal Waterproof 40kg'] = '/images/products/paint/birla-white-putty-40kg.webp';

  // Dr. Fixit Raincoat 20L
  await savePackshot(
    path.resolve(ATTACHED_ASSETS, 'brands/drfixit-bucket.png'),
    '/images/products/paint/dr-fixit-raincoat-20l.webp'
  );
  manifest['Dr. Fixit Raincoat 20L'] = '/images/products/paint/dr-fixit-raincoat-20l.webp';

  // Asian Paints Royale Luxury Emulsion 20L
  if (!fs.existsSync(path.resolve(PUBLIC_PRODUCTS_DIR, 'paint/royale-luxury-emulsion-20l.webp'))) {
    await savePackshot(
      path.resolve(ATTACHED_ASSETS, 'brands/asianpaints-bucket.png'),
      '/images/products/paint/royale-luxury-emulsion-20l.webp'
    );
  }
  manifest['Royale Luxury Emulsion 20L'] = '/images/products/paint/royale-luxury-emulsion-20l.webp';

  // Asian Paints Royale Shyne Emulsion 20L
  if (!fs.existsSync(path.resolve(PUBLIC_PRODUCTS_DIR, 'paint/royale-shyne-emulsion-20l.webp'))) {
    await savePackshot(
      path.resolve(ATTACHED_ASSETS, 'brands/asianpaints-bucket.png'),
      '/images/products/paint/royale-shyne-emulsion-20l.webp'
    );
  }
  manifest['Royale Shyne Emulsion 20L'] = '/images/products/paint/royale-shyne-emulsion-20l.webp';

  // Asian Paints Apcolite Premium Gloss 20L
  if (!fs.existsSync(path.resolve(PUBLIC_PRODUCTS_DIR, 'paint/apcolite-premium-gloss-20l.webp'))) {
    await savePackshot(
      path.resolve(ATTACHED_ASSETS, 'brands/asianpaints-bucket.png'),
      '/images/products/paint/apcolite-premium-gloss-20l.webp'
    );
  }
  manifest['Apcolite Premium Gloss 20L'] = '/images/products/paint/apcolite-premium-gloss-20l.webp';

  // Asian Paints Apex Advanced Exterior 20L
  if (!fs.existsSync(path.resolve(PUBLIC_PRODUCTS_DIR, 'paint/apex-advanced-exterior-20l.webp'))) {
    await savePackshot(
      path.resolve(ATTACHED_ASSETS, 'brands/asianpaints-bucket.png'),
      '/images/products/paint/apex-advanced-exterior-20l.webp'
    );
  }
  manifest['Apex Advanced Exterior 20L'] = '/images/products/paint/apex-advanced-exterior-20l.webp';

  // Save updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\n✓ Saved updated manifest to:', MANIFEST_PATH);
  console.log('Total mapped SKUs in manifest:', Object.keys(manifest).length);
}

main().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
