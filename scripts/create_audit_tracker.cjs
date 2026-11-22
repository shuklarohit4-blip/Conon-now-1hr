const fs = require('fs');
const path = require('path');
const { toSlug } = require('./catalog_utils.cjs');

console.log('=== Phase 1: Full Repo & Catalog Inventory Scan ===');

const homeSrc = fs.readFileSync(path.resolve(__dirname, '../artifacts/conon/src/pages/Home.tsx'), 'utf8');

// 1. Extract HOMERUN_CATEGORIES (List A)
function extractCategories() {
  const catRegex = /{\s*slug:\s*\"([^\"]+)\",\s*label:\s*\"([^\"]+)\",\s*image:\s*[^,]+,\s*dbCategory:\s*\"([^\"]+)\"(?:,\s*badge:\s*\"([^\"]+)\")?\s*}/g;
  let m;
  const categories = [];
  while ((m = catRegex.exec(homeSrc)) !== null) {
    categories.push({
      slug: m[1],
      label: m[2],
      dbCategory: m[3],
      badge: m[4] || null,
      targetAsset: `/images/categories/${m[1]}.webp`,
      status: 'pending'
    });
  }
  return categories;
}

// 2. Extract Brand Arrays (CEMENT_BRANDS & STEEL_BRANDS)
function extractBrandArray(varName, categorySlug) {
  const startIdx = homeSrc.indexOf('const ' + varName);
  if (startIdx === -1) return [];
  const arrStart = homeSrc.indexOf('[', startIdx);
  let depth = 0;
  let endIdx = -1;
  for (let i = arrStart; i < homeSrc.length; i++) {
    if (homeSrc[i] === '[') depth++;
    else if (homeSrc[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return [];
  const code = homeSrc.substring(arrStart, endIdx + 1);
  const brands = eval(code);
  const items = [];
  for (const b of brands) {
    for (const p of b.products) {
      const slug = toSlug(p.name);
      items.push({
        id: slug,
        name: p.name,
        brand: b.name,
        category: categorySlug,
        targetAsset: `/images/products/${categorySlug}/${slug}.webp`,
        status: 'pending'
      });
    }
  }
  return items;
}

// 3. Extract ALL_BRAND_DATA
function extractAllBrandData() {
  const declIdx = homeSrc.indexOf('const ALL_BRAND_DATA');
  const eqIdx = homeSrc.indexOf('=', declIdx);
  const objStart = homeSrc.indexOf('{', eqIdx);
  let depth = 0;
  let endIdx = -1;
  for (let i = objStart; i < homeSrc.length; i++) {
    if (homeSrc[i] === '{') depth++;
    else if (homeSrc[i] === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  const code = '(' + homeSrc.substring(objStart, endIdx + 1) + ')';
  const data = eval(code);
  const items = [];
  for (const [catKey, catVal] of Object.entries(data)) {
    if (!catVal.brands) continue;
    for (const b of catVal.brands) {
      if (!b.products) continue;
      for (const p of b.products) {
        const slug = toSlug(p.name);
        items.push({
          id: slug,
          name: p.name,
          brand: b.name,
          category: catKey,
          targetAsset: `/images/products/${catKey}/${slug}.webp`,
          status: 'pending'
        });
      }
    }
  }
  return items;
}

// 4. Extract ProductFeed (DUMMY_PRODUCTS & BUILDER_PICKS)
function extractProductFeed() {
  const feedSrc = fs.readFileSync(path.resolve(__dirname, '../artifacts/conon/src/components/ProductFeed.tsx'), 'utf8');
  const items = [];
  // Match title / materialTag
  const regex = /id:\s*\"([^\"]+)\"[\s\S]*?materialTag:\s*\"([^\"]+)\"[\s\S]*?title:\s*\"([^\"]+)\"/g;
  let m;
  while ((m = regex.exec(feedSrc)) !== null) {
    const rawCat = m[2].toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = toSlug(m[3]);
    items.push({
      id: m[1],
      name: m[3],
      brand: 'CONON-NOW Curated',
      category: rawCat,
      targetAsset: `/images/products/${rawCat}/${slug}.webp`,
      status: 'pending'
    });
  }
  return items;
}

const categories = extractCategories();
const cementItems = extractBrandArray('CEMENT_BRANDS', 'cement');
const steelItems = extractBrandArray('STEEL_BRANDS', 'steel');
const allBrandItems = extractAllBrandData();
const feedItems = extractProductFeed();

// Deduplicate SKUs by unique name
const skuMap = new Map();
for (const item of [...cementItems, ...steelItems, ...allBrandItems, ...feedItems]) {
  if (!skuMap.has(item.name)) {
    skuMap.set(item.name, item);
  }
}
const skus = Array.from(skuMap.values());

const tracker = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalCategories: categories.length,
    totalSKUs: skus.length,
    categoriesPending: categories.length,
    skusPending: skus.length
  },
  categories,
  skus
};

const trackerPath = path.resolve(__dirname, 'image-audit-tracker.json');
fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));

console.log(`Successfully generated tracker: ${trackerPath}`);
console.log(`- Categories in tracker: ${categories.length}`);
console.log(`- Total unique SKUs in tracker: ${skus.length}`);

// Category breakdown
const breakdown = {};
for (const s of skus) {
  breakdown[s.category] = (breakdown[s.category] || 0) + 1;
}
console.log('\nSKU Distribution by Category:');
console.table(breakdown);
