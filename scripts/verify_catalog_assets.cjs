const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../artifacts/conon/src/lib/productAssetManifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('=== Comprehensive Product Catalog Image Verification ===\n');

let totalSKUs = Object.keys(manifest).length;
let existsOnDisk = 0;
let missingFiles = [];
let oversizedFiles = [];
let pathMap = {};
let duplicates = [];

for (const [skuName, relPath] of Object.entries(manifest)) {
  const diskPath = path.resolve(__dirname, '../artifacts/conon/public', relPath.replace(/^\//, ''));
  
  // 1. Verify existence
  if (!fs.existsSync(diskPath)) {
    missingFiles.push({ skuName, diskPath });
    continue;
  }
  
  const stat = fs.statSync(diskPath);
  if (stat.size === 0) {
    missingFiles.push({ skuName, diskPath, reason: 'zero bytes' });
    continue;
  }
  
  existsOnDisk++;
  
  // 2. Check file size (< 100KB target)
  const sizeKB = stat.size / 1024;
  if (sizeKB > 100) {
    oversizedFiles.push({ skuName, relPath, sizeKB: sizeKB.toFixed(1) });
  }
  
  // 3. Track duplicates
  if (pathMap[relPath]) {
    duplicates.push({ relPath, skus: [pathMap[relPath], skuName] });
  } else {
    pathMap[relPath] = skuName;
  }
}

console.log(`Total SKUs checked: ${totalSKUs}`);
console.log(`Files present on disk (non-zero size): ${existsOnDisk} / ${totalSKUs} (${((existsOnDisk/totalSKUs)*100).toFixed(1)}%)`);
console.log(`Duplicate image paths across distinct SKUs: ${duplicates.length}`);
console.log(`Missing files: ${missingFiles.length}`);
console.log(`Files > 100KB: ${oversizedFiles.length}`);

if (missingFiles.length > 0) {
  console.error('\nMissing files found:');
  console.error(missingFiles);
}

if (duplicates.length > 0) {
  console.error('\nDuplicate image paths found:');
  console.error(duplicates);
}

if (missingFiles.length === 0 && duplicates.length === 0) {
  console.log('\n>>> SUCCESS: 100% of product images verified. Zero duplicates, zero missing assets! <<<');
}
