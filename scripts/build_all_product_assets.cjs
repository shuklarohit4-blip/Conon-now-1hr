const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');
const {
  PUBLIC_PRODUCTS_DIR,
  ATTACHED_ASSETS_DIR,
  toSlug,
  saveStandardPackshot,
  fetchImageBuffer
} = require('./catalog_utils.cjs');

// Load extracted catalog
const catalogPath = '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/scratch/all_catalog.json';
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Verified official URLs for Paints & Waterproofing
const VERIFIED_OFFICIAL_URLS = {
  // Asian Paints
  'royale-luxury-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-royale-luxury-emulsion-asian-paints.png',
  'royale-shyne-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/luxury-emulsion-shyne-advanced-ps-royale.png',
  'royale-health-shield-10l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-royale-health-shield-asian-paints.png',
  'apcolite-premium-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/shyne-premium-emulsion.png',
  'apcolite-premium-gloss-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-apcolite-all-protek-shyne-packshot-asian-paints.png',
  'tractor-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-tractor-emulsion-advanced-asian-paints.png',
  'tractor-shyne-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-tractor-emulsion-shyne-asian-paints.png',
  'tractor-distemper-20kg': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-tractor-distemper-asian-paints.png',
  'ace-exterior-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/exterior-walls-ace-exterior-emulsion-asian-paints.png',
  'ace-interior-emulsion-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/interior-walls-ace-interior-emulsion-asian-paints.png',
  'apex-ultima-exterior-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/exterior-walls-apex-ultima-asian-paints.png',
  'apex-advanced-exterior-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/exterior-walls-apex-weatherproof-emulsion-asian-paints.png',
  'asian-primer-decoprime-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/undercoats-decoprime-wall-primer-wt-asian-paints.png',
  'asian-cement-primer-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/undercoats-exterior-wall-primer-asian-paints.png',
  'smartcare-damp-proof-20kg': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/waterproofing-smartcare-damp-proof-asian-paints.png',
  'smartcare-damp-block-20l': 'https://static.asianpaints.com/content/dam/asian_paints/products/packshots/waterproofing-smartcare-damp-block-asian-paints.png',

  // Berger Paints
  'berger-silk-glamor-20l': 'https://images.bergerpaints.com/2023-11/Silk_Glamor_High_Sheen_canshot.jpg',
  'berger-silk-emulsion-20l': 'https://images.bergerpaints.com/2023-11/Silk_Breathe_Easy_canshot.jpg',
  'berger-easy-clean-20l': 'https://images.bergerpaints.com/s3fs-public/2023-11/Easy%20Clean%20Fresh_1.png',
  'weathercoat-all-guard-20l': 'https://images.bergerpaints.com/s3fs-public/2023-11/WeatherCoat%20All%20Guard_1.png',
  'weathercoat-long-life-20l': 'https://images.bergerpaints.com/s3fs-public/2023-11/WeatherCoat%20Long%20Life_1.png',
  'weathercoat-anti-dust-20l': 'https://images.bergerpaints.com/s3fs-public/2023-11/Anti%20Dustt%20Kool_1.png',
  'berger-bison-distemper-20kg': 'https://images.bergerpaints.com/s3fs-public/2023-09/Bison%20glow%20banner%20final_0.png',
  'berger-pu-primer-20l': 'https://images.bergerpaints.com/s3fs-public/2023-11/BP%20White%20Primer%20WT_1.png',
  'berger-wp-primer-20l': 'https://images.bergerpaints.com/s3fs-public/2023-11/WeatherCoat%20Exterior%20Primer_1.png',
  'berger-walmasta-putty-40kg': 'https://images.bergerpaints.com/s3fs-public/2023-11/Bison%20Wall%20Putty_1.png',
};

// Map of attached_assets files
const LOCAL_SOURCE_MAP = {
  // Cement
  'ultratech-opc-53-grade': 'ai-image-e0c6d9a8-04e0-48f8-af5a-c9f3095bb39a_1781000536697.png',
  'ultratech-ppc': 'ppc_1781000586657.png',
  'ultratech-buildmore': 'build_more_ppc_1781000550304.png',
  'ultratech-super': 'super_opc_1781000603180.png',
  'ultratech-weatherplus': 'waterplus_1781000563604.png',
  'acc-gold-opc-53': 'acc_opc_1781691111056.png',
  'acc-suraksha-ppc': 'acc_suraksha_1781691111058.png',
  'acc-f2r-fast-to-road': 'acc_rhc_1781691111057.png',
  'acc-concrete': 'acc_concrete+_1781691111055.png',
  'acc-gold-water-shield': 'acc_gold_water_1781691111056.png',
  'ambuja-plus': 'ambuja_ppc_1781691111060.png',
  'ambuja-opc-53': 'brands/ambuja-cement.png',
  'ambuja-kawach': 'ambuja_kawatch_1781691111059.png',
  'ambuja-cool-walls': 'ambuja_cool_walls_1781691111059.png',
  'shree-jung-rodhak-opc': 'brands/shree-cement.png',
  'bangur-power': 'brands/shree-cement.png',
  'bangur-premium-opc-53': 'brands/shree-cement.png',
  'shree-ultra-ppc': 'brands/shree-cement.png',
  'bangur-duraguard': 'brands/shree-cement.png',
  'jk-super-opc-53': 'jk_super_opc_1781692393724.png',
  'jk-lakshmi-ppc': 'jk_laxmi_ppc_1781692393723.png',
  'jk-sixer-opc': 'jk_laxmi_sixer_opc_1781692393724.png',
  'jk-smartcrete': 'jk_smartcrete_1781692393724.png',
  'birla-samrat-opc': 'birla_opc_1781691111061.png',
  'birla-uttam-ppc': 'birla_uttam_ppc_1781691111062.png',
  'birla-a1-ppc': 'birla_a1_1781691111060.png',
  'birla-advanced-ppc': 'birla_adv_ppc_1781691111061.png',
  'dalmia-dsp-opc': 'dalmia_opc_1781692393719.png',
  'dalmia-konark-ppc': 'dalmia_konark_1781691111063.png',
  'dalmia-infracon-src': 'dalmia_src_1781692393720.png',
  'mycem-opc-43': 'mycem_opc43_1781692393726.png',
  'mycem-opc-53': 'mycem_opc53_1781692393727.png',
  'prism-champion-ppc': 'brands/prism-cement.png',
  'prism-duratech': 'brands/prism-cement.png',

  // Bricks & Blocks
  'first-class-red-brick': 'first_class_brick_1781692393720.png',
  'second-class-red-brick': 'first_class_brick_1781692393720.png',
  'table-mould-brick': 'first_class_brick_1781692393720.png',
  'fly-ash-brick-standard': 'fly_ash_brick_standard_1781692393721.png',
  'fly-ash-brick-heavy': 'fly_ash_heavy_1781692393721.png',
  'fly-ash-brick-interlocking': 'fly_ash_interlocking_1781692393722.png',
  'aac-block-600-200-100mm': 'magicrete_aac_4_inch_1781692393725.png',
  'aac-block-600-200-150mm': 'magicrete_aac_6_inch_1781692393725.png',
  'aac-block-600-200-200mm': 'magicrete_aac_8_inch_1781692393726.png',
  'hollow-concrete-block-8': 'hollow_b_1781692393723.png',
  'solid-concrete-block-6': 'half_block_1781692393722.png',
  'half-block-4': 'half_block_1781692393722.png',

  // Marble & Stone
  'makrana-white-marble': 'generated_images/marble-stone/makrana-white.png',
  'makrana-albeta-marble': 'generated_images/marble-stone/makrana-albeta.png',
  'makrana-kumari-marble': 'generated_images/marble-stone/makrana-kumari.png',
  'statuario-italian-marble': 'generated_images/marble-stone/statuario.png',
  'carrara-white-marble': 'generated_images/marble-stone/carrara.png',
  'botticino-beige-marble': 'generated_images/marble-stone/botticino.png',
  'morwad-white-marble': 'generated_images/marble-stone/morwad-white.png',
  'onyx-green-marble': 'generated_images/marble-stone/onyx.png',
  'black-galaxy-granite': 'generated_images/marble-stone/black-galaxy.png',
  'tan-brown-granite': 'generated_images/marble-stone/tan-brown.png',
  'steel-grey-granite': 'generated_images/marble-stone/steel-grey.png',
  'kashmir-white-granite': 'generated_images/marble-stone/kashmir-white.png',
  'kota-stone-blue': 'generated_images/marble-stone/kota-blue.png',
  'kota-stone-brown': 'generated_images/marble-stone/kota-brown.png',
  'dholpur-beige-sandstone': 'generated_images/marble-stone/dholpur-beige.png',
  'mint-sandstone': 'generated_images/marble-stone/mint-sandstone.png',

  // Tiles
  'kajaria-vitrified-2-2-ft': 'kajariya_2ft_1782798562965.png',
  'kajaria-gvt-4-2-ft': 'Kajaria_pGVT_4×2_ft_1782798562966.png',
  'kajaria-pgvt-4-2-ft-polished': 'Kajaria_GVT_4×2_ft_1782798562967.png',
  'kajaria-wall-tile-1-1-5-ft': 'kajariya_wall_tile_1782798562967.png',
  'nitco-italian-marble-tile-2-4': 'nitco_italian_marbal_1782798547454.png',
  'nitco-vitrified-2-2-ft': 'nitco_2ft_1782798518743.png',
  'nitco-step-riser-set': 'nitco_step_riser_1782798533109.png',
  'nitco-terrazzo-look-2-2-ft': 'nitco_terrazzo_look_1782798547454.png',
  'orient-bell-gvt-2-2-ft': 'orient_gvt_1782798547455.png',
  'orient-bell-pgvt-4-2-ft': 'orient_pgvt_1782798547455.png',
  'orient-bell-wall-tile-1-1-5': 'orient_bell_wall_tile_1782798562964.png',
  'orient-bell-mosaic-sheet': 'orient_bell_sheet_1782798562964.png',
  'somany-durastone-2-2-ft': 'brands/somany-tile.png',

  // Putty & Plaster
  'wallcare-putty-40kg': 'birla_white_putty_1782798620454.png',
  'wallcare-putty-20kg': 'birla_white_putty_1782798620454.png',
  'wallcare-putty-5kg': 'birla_white_putty_1782798620454.png',
  'wallseal-waterproof-putty-40kg': 'birla_white_putty_1782798620454.png',
  'birla-white-cement-50kg': 'brands/birlawhite-putty.png',
  'levelplast-gypsum-plaster-25kg': 'birla_25_kg_1782798620453.png',
  'jk-wall-putty-40kg': 'jk_wall_putty_1782798620452.png',

  // Adhesives
  'fevicol-sh-50kg': 'brands/fevicol-drum.png',
  'fevicol-sh-20kg': 'brands/fevicol-drum.png',
  'fevicol-sh-5kg': 'brands/fevicol-drum.png',
  'fevicol-marine-20kg': 'brands/fevicol-drum.png',
  'fevicol-heatx-5kg-laminate': 'brands/fevicol-drum.png',
  'roff-t01-nca-non-ceramic-20kg': 'brands/roff-adhesive.png',
  'roff-t02-nsa-natural-stone-20kg': 'brands/roff-adhesive.png',

  // Hardware & Tools
  'godrej-nav-tal-7-levers-hardened-brass-padlock-with-3-keys-heavy-duty': 'brands/godrej-lock.png',
  'hettich-soft-close-concealed-hinges-35mm-cup-cabinet-wardrobe-pack-of-10': 'brands/hettich-hinge.png',
  'bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck': 'brands/bosch-drill.png',
  'makita-hammer-drill': 'brands/makita-drill.png',
  'dewalt-angle-grinder': 'brands/dewalt-grinder.png',
  'stanley-measuring-tape': 'brands/stanley-tape.png',

  // Plumbing
  'astral-cpvc-flowguard-gold-pipe-1-inch-3m-length-hot-cold-water-supply': 'brands/astral-pipe.png',
  'ashirvad-cpvc-pipe-1inch': 'brands/ashirvad-pipe.png',
  'supreme-cpvc-pipe-1inch': 'brands/supreme-pipe.png',
  'jaquar-alive-single-lever-basin-mixer-tap-chrome-finish-brass-body': 'brands/jaquar-faucet.png',
  'hindware-ewc-one-piece-toilet': 'brands/hindware-ewc.png',

  // Electrical
  'polycab-fr-house-wire-1-5-sq-mm-90m-coil-bis-certified-flame-retardant': 'brands/polycab-wire.png',
  'havells-lifeline-plus-wire-1-5sqmm': 'brands/havells-wire.png',
  'finolex-fr-house-wire-1-5sqmm': 'brands/finolex-wire.png',
  'anchor-roma-modular-switch-6a-1-way-white-polycarbonate-pack-of-10': 'brands/anchor-switch.png',
  'legrand-myrius-modular-switch': 'brands/legrand-switch.png',

  // Wood
  'centuryply-club-prime-plywood': 'brands/centuryply-ply.png',
  'greenply-ecotec-plywood': 'brands/greenply-ply.png',
  'actiontesa-hdhmr-board': 'brands/actiontesa-mdf.png',
  'gyproc-plasterboard': 'brands/gyproc-board.png',
};

// Generates distinct realistic variant packshots (e.g. for steel diameters, sand grades, aggregate fractions)
async function generateDistinctVariantPackshot(category, baseName, variantTag, outPath, preferredSrc) {
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Choose a base texture/sample from stock_images or brand assets
  let fallbackPath = preferredSrc && fs.existsSync(preferredSrc) ? preferredSrc : null;
  if (!fallbackPath) {
    let baseStockFile = '';
    if (category === 'steel') baseStockFile = 'tmt-bars.jpg';
    else if (category === 'sand') baseStockFile = 'sand.jpg';
    else if (category === 'aggregate') baseStockFile = 'aggregate.jpg';
    else if (category === 'bricks') baseStockFile = 'red-brick.jpg';
    else if (category === 'hardware') baseStockFile = 'door-hardware.jpg';
    else if (category === 'tools') baseStockFile = 'drill.jpg';
    else if (category === 'wood') baseStockFile = 'plywood.jpg';
    else if (category === 'electrical') baseStockFile = 'wire.jpg';
    else if (category === 'plumbing') baseStockFile = 'pipe.jpg';
    else baseStockFile = 'cement-bag.jpg';

    const stockPath = path.resolve(ATTACHED_ASSETS_DIR, 'stock_images', baseStockFile);
    fallbackPath = fs.existsSync(stockPath) ? stockPath : path.resolve(ATTACHED_ASSETS_DIR, 'brands/asianpaints-bucket.png');
  }

  // Load and resize base
  const innerSize = 510;
  const resized = await sharp(fallbackPath)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  const cleanTag = (variantTag || '')
    .slice(0, 30)
    .toUpperCase()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const rectWidth = Math.min(550, Math.max(120, cleanTag.length * 8 + 24));

  // Create an elegant SVG badge to place on the corner of the packshot specifying exact SKU / grade / brand
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

async function main() {
  console.log('=== Building Comprehensive Product Catalog Assets ===');

  const manifest = {};
  let createdCount = 0;
  let remoteFetchCount = 0;
  let localAssetCount = 0;
  let variantGenCount = 0;

  // Process all products across brandCatalog and productFeed
  const allItems = [
    ...catalogData.brandCatalog,
    ...catalogData.productFeed.map(pf => ({
      category: pf.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      brand: pf.brand || 'CONON-NOW',
      name: pf.name
    }))
  ];

  console.log(`Processing ${allItems.length} total catalog products...`);

  for (const item of allItems) {
    const cat = item.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = toSlug(item.name);
    const filename = `${slug}.webp`;
    const outPath = path.join(PUBLIC_PRODUCTS_DIR, cat, filename);
    const publicUrl = `/images/products/${cat}/${filename}`;

    // Skip if already in manifest
    if (manifest[item.name]) continue;

    // Check if official remote URL exists
    let handled = false;
    if (VERIFIED_OFFICIAL_URLS[slug]) {
      try {
        const url = VERIFIED_OFFICIAL_URLS[slug];
        const buf = await fetchImageBuffer(url);
        const res = await saveStandardPackshot(buf, outPath);
        if (res.ok) {
          manifest[item.name] = publicUrl;
          remoteFetchCount++;
          handled = true;
          console.log(`[Official CDN] ${cat}/${filename} (${(res.size/1024).toFixed(1)} KB)`);
        }
      } catch (err) {
        console.warn(`[CDN Failed for ${slug}: ${err.message}]`);
      }
    }

    // Check if local source exists in attached_assets
    if (!handled && LOCAL_SOURCE_MAP[slug]) {
      const srcFile = path.resolve(ATTACHED_ASSETS_DIR, LOCAL_SOURCE_MAP[slug]);
      if (fs.existsSync(srcFile)) {
        const res = await saveStandardPackshot(srcFile, outPath);
        if (res.ok) {
          manifest[item.name] = publicUrl;
          localAssetCount++;
          handled = true;
          console.log(`[Local Studio] ${cat}/${filename} (${(res.size/1024).toFixed(1)} KB)`);
        }
      }
    }

    // Check fuzzy match in attached_assets
    if (!handled) {
      // Find suitable matching brand image or category base
      let matchFile = null;
      const lowerBrand = (item.brand || '').toLowerCase();
      const lowerName = item.name.toLowerCase();

      if (cat === 'cement') {
        if (lowerBrand.includes('ultra') || lowerName.includes('ultratech')) matchFile = 'ppc_1781000586657.png';
        else if (lowerBrand.includes('acc') || lowerName.includes('acc')) matchFile = 'brands/acc-cement.png';
        else if (lowerBrand.includes('ambuja') || lowerName.includes('ambuja')) matchFile = 'brands/ambuja-cement.png';
        else if (lowerBrand.includes('birla') || lowerName.includes('birla')) matchFile = 'brands/birla-cement.png';
        else if (lowerBrand.includes('dalmia') || lowerName.includes('dalmia')) matchFile = 'brands/dalmia-cement.png';
        else if (lowerBrand.includes('jk') || lowerName.includes('jk')) matchFile = 'brands/jk-cement.png';
        else if (lowerBrand.includes('shree') || lowerBrand.includes('bangur')) matchFile = 'brands/shree-cement.png';
        else if (lowerBrand.includes('prism') || lowerName.includes('prism')) matchFile = 'brands/prism-cement.png';
        else if (lowerBrand.includes('mycem') || lowerName.includes('mycem')) matchFile = 'brands/mycem-cement.png';
        else matchFile = 'stock_images/cement-bag.jpg';
      }
      else if (cat === 'paint') {
        if (lowerBrand.includes('berger') || lowerName.includes('berger')) matchFile = 'brands/berger-bucket.png';
        else if (lowerBrand.includes('nerolac') || lowerName.includes('nerolac')) matchFile = 'brands/nerolac-bucket.png';
        else if (lowerBrand.includes('dulux') || lowerName.includes('dulux')) matchFile = 'brands/dulux-bucket.png';
        else matchFile = 'brands/asianpaints-bucket.png';
      }
      else if (cat === 'steel') {
        matchFile = 'stock_images/tmt-bars.jpg';
      }
      else if (cat === 'tiles') {
        if (lowerBrand.includes('somany') || lowerName.includes('somany')) matchFile = 'brands/somany-tile.png';
        else matchFile = 'brands/kajaria-tile.png';
      }
      else if (cat === 'marble-stone') matchFile = 'generated_images/marble-stone/makrana-white.png';
      else if (cat === 'sand') matchFile = 'stock_images/sand.jpg';
      else if (cat === 'aggregate') matchFile = 'stock_images/aggregate.jpg';
      else if (cat === 'bricks') matchFile = 'first_class_brick_1781692393720.png';
      else if (cat === 'electrical') {
        if (lowerBrand.includes('finolex') || lowerName.includes('finolex')) matchFile = 'brands/finolex-wire.png';
        else if (lowerBrand.includes('havells') || lowerName.includes('havells')) matchFile = 'brands/havells-wire.png';
        else if (lowerBrand.includes('anchor') || lowerName.includes('roma')) matchFile = 'brands/anchor-switch.png';
        else if (lowerBrand.includes('legrand') || lowerName.includes('myrius')) matchFile = 'brands/legrand-switch.png';
        else matchFile = 'brands/polycab-wire.png';
      }
      else if (cat === 'plumbing') {
        if (lowerBrand.includes('ashirvad') || lowerName.includes('ashirvad')) matchFile = 'brands/ashirvad-pipe.png';
        else if (lowerBrand.includes('supreme') || lowerName.includes('supreme')) matchFile = 'brands/supreme-pipe.png';
        else if (lowerBrand.includes('jaquar') || lowerName.includes('jaquar')) matchFile = 'brands/jaquar-faucet.png';
        else if (lowerBrand.includes('hindware') || lowerName.includes('hindware')) matchFile = 'brands/hindware-ewc.png';
        else matchFile = 'brands/astral-pipe.png';
      }
      else if (cat === 'hardware') {
        if (lowerBrand.includes('godrej') || lowerName.includes('godrej') || lowerName.includes('nav-tal')) matchFile = 'brands/godrej-lock.png';
        else matchFile = 'brands/hettich-hinge.png';
      }
      else if (cat === 'adhesives') {
        if (lowerBrand.includes('roff') || lowerName.includes('roff')) matchFile = 'brands/roff-adhesive.png';
        else matchFile = 'brands/fevicol-drum.png';
      }
      else if (cat === 'tools') {
        if (lowerBrand.includes('dewalt') || lowerName.includes('dewalt')) matchFile = 'brands/dewalt-grinder.png';
        else if (lowerBrand.includes('makita') || lowerName.includes('makita')) matchFile = 'brands/makita-drill.png';
        else if (lowerBrand.includes('stanley') || lowerName.includes('stanley')) matchFile = 'brands/stanley-tape.png';
        else matchFile = 'brands/bosch-drill.png';
      }
      else if (cat === 'wood') {
        if (lowerBrand.includes('greenply') || lowerName.includes('greenply')) matchFile = 'brands/greenply-ply.png';
        else if (lowerBrand.includes('actiontesa') || lowerName.includes('actiontesa')) matchFile = 'brands/actiontesa-mdf.png';
        else if (lowerBrand.includes('gyproc') || lowerName.includes('gyproc')) matchFile = 'brands/gyproc-board.png';
        else matchFile = 'brands/centuryply-ply.png';
      }
      else matchFile = 'brands/asianpaints-bucket.png';

      const fullMatch = path.resolve(ATTACHED_ASSETS_DIR, matchFile);
      const variantTag = item.brand ? `${item.brand} · ${item.name.split(' ').slice(0, 3).join(' ')}` : item.name;
      await generateDistinctVariantPackshot(cat, item.name, variantTag, outPath, fullMatch);
      manifest[item.name] = publicUrl;
      variantGenCount++;
      handled = true;
    }

    if (handled) createdCount++;
  }

  // Save the manifest mapping
  const manifestPath = path.resolve(__dirname, '../artifacts/conon/src/lib/productAssetManifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n=== Complete! Manifest written with ${Object.keys(manifest).length} distinct product assets ===`);
  console.log(`- Official CDN Packshots: ${remoteFetchCount}`);
  console.log(`- Local Studio Packshots: ${localAssetCount}`);
  console.log(`- Tailored Variant Packshots: ${variantGenCount}`);
  console.log(`- Saved manifest to: artifacts/conon/src/lib/productAssetManifest.json`);
}

main().catch(err => {
  console.error('Fatal error in build_all_product_assets:', err);
  process.exit(1);
});
