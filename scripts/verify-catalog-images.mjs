import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TRACKER_PATH = path.resolve(__dirname, 'image-audit-tracker.json');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'artifacts/conon/public');
const MANIFEST_PATH = path.resolve(ROOT_DIR, 'artifacts/conon/src/lib/productAssetManifest.json');

console.log('=== Running Phase 5: Hard Exit Gate & Visual Proof Verification ===\n');

if (!fs.existsSync(TRACKER_PATH)) {
  console.error('FAIL: image-audit-tracker.json does not exist!');
  process.exit(1);
}

const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

let failures = 0;

// Condition 1: 0 items remain "pending" in image-audit-tracker.json
const pendingCategories = tracker.categories.filter(c => c.status === 'pending');
const pendingSKUs = tracker.skus.filter(s => s.status === 'pending');

if (pendingCategories.length > 0) {
  console.error(`FAIL: ${pendingCategories.length} categories remain pending!`);
  failures++;
} else {
  console.log(`[PASS] Condition 1A: 0 pending categories (all ${tracker.categories.length} done).`);
}

if (pendingSKUs.length > 0) {
  console.error(`FAIL: ${pendingSKUs.length} SKUs remain pending!`);
  failures++;
} else {
  console.log(`[PASS] Condition 1B: 0 pending SKUs (all ${tracker.skus.length} done).`);
}

// Condition 2: 100% of Category tiles and 100% of Product SKUs point to existing local .webp files (> 5KB)
let missingCatFiles = [];
let smallCatFiles = [];
for (const cat of tracker.categories) {
  const diskPath = path.resolve(PUBLIC_DIR, cat.targetAsset.replace(/^\//, ''));
  if (!fs.existsSync(diskPath)) {
    missingCatFiles.push({ slug: cat.slug, diskPath });
  } else {
    const size = fs.statSync(diskPath).size;
    if (size <= 5120) {
      smallCatFiles.push({ slug: cat.slug, size });
    }
  }
}

if (missingCatFiles.length > 0 || smallCatFiles.length > 0) {
  console.error(`FAIL: Category tiles missing: ${missingCatFiles.length}, small (<5KB): ${smallCatFiles.length}`);
  failures++;
} else {
  console.log(`[PASS] Condition 2A: 100% of category cluster tiles exist on disk with size > 5KB (${tracker.categories.length}/${tracker.categories.length}).`);
}

let missingSKUFiles = [];
let smallSKUFiles = [];
for (const sku of tracker.skus) {
  const diskPath = path.resolve(PUBLIC_DIR, sku.targetAsset.replace(/^\//, ''));
  if (!fs.existsSync(diskPath)) {
    missingSKUFiles.push({ name: sku.name, diskPath });
  } else {
    const size = fs.statSync(diskPath).size;
    if (size <= 5120) {
      smallSKUFiles.push({ name: sku.name, size });
    }
  }
}

if (missingSKUFiles.length > 0 || smallSKUFiles.length > 0) {
  console.error(`FAIL: SKU images missing: ${missingSKUFiles.length}, small (<5KB): ${smallSKUFiles.length}`);
  failures++;
} else {
  console.log(`[PASS] Condition 2B: 100% of product SKUs exist on disk with size > 5KB (${tracker.skus.length}/${tracker.skus.length}).`);
}

// Condition 3: 0 placeholder, Unsplash/Pexels generic, or external hotlink URLs remain anywhere in catalog data
let externalHotlinks = [];
for (const [name, p] of Object.entries(manifest)) {
  if (p.startsWith('http://') || p.startsWith('https://') || p.includes('unsplash') || p.includes('pexels') || p.includes('placehold')) {
    externalHotlinks.push({ name, p });
  }
}

if (externalHotlinks.length > 0) {
  console.error(`FAIL: ${externalHotlinks.length} external/placeholder links found!`);
  failures++;
} else {
  console.log(`[PASS] Condition 3: 0 placeholder, Unsplash/Pexels, or external hotlinks remain in catalog manifest.`);
}

// Condition 4: 0 duplicate image paths across different brands/products (specifically verify Steel, Plywood, Hardware)
const pathOwners = {};
const duplicates = [];

for (const sku of tracker.skus) {
  const p = sku.targetAsset;
  if (pathOwners[p]) {
    duplicates.push({ path: p, first: pathOwners[p], duplicate: sku.name });
  } else {
    pathOwners[p] = sku.name;
  }
}

// Deep check for Steel, Plywood, Hardware specifically
const steelDupes = duplicates.filter(d => d.path.includes('/steel'));
const plyDupes = duplicates.filter(d => d.path.includes('/wood'));
const hwDupes = duplicates.filter(d => d.path.includes('/hardware'));

console.log(`Duplicate paths found: ${duplicates.length} (Steel: ${steelDupes.length}, Plywood: ${plyDupes.length}, Hardware: ${hwDupes.length})`);

if (duplicates.length > 0) {
  console.error(`FAIL: Found ${duplicates.length} duplicate image paths!`);
  console.error(duplicates.slice(0, 5));
  failures++;
} else {
  console.log(`[PASS] Condition 4: 0 duplicate image paths exist across any distinct SKUs (verified Steel, Plywood, Hardware).`);
}

console.log('\n------------------------------------------------------------');
if (failures === 0) {
  console.log('>>> ALL 4 HARD EXIT GATE CONDITIONS PASSED WITH 100% SUCCESS! <<<');
  process.exit(0);
} else {
  console.error(`>>> HARD EXIT GATE FAILED WITH ${failures} FAILED CONDITIONS! <<<`);
  process.exit(1);
}
