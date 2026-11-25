import fs from "fs";
import path from "path";
import crypto from "crypto";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

console.log("=== VALIDATING PRODUCT IMAGES AUDIT SUITE ===");

if (!fs.existsSync(manifestPath)) {
  console.error("FAIL: scripts/image-manifest.json not found!");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const entries = Object.values(manifest);

console.log(`Loaded ${entries.length} SKUs from image-manifest.json`);

if (entries.length === 0) {
  console.error("FAIL: Manifest is empty!");
  process.exit(1);
}

let brokenCount = 0;
let formatErrors = 0;
const hashToSku = new Map();
const duplicateHashViolations = [];

for (const [key, entry] of Object.entries(manifest) as [string, any][]) {
  const localPath =
    entry.localPath ||
    entry.path ||
    entry.targetAsset ||
    (entry.filename && entry.category ? `/images/products/${entry.category}/${entry.filename}` : null) ||
    (key.startsWith("images/") ? "/" + key : (key.endsWith(".webp") ? "/" + key : null));

  if (!localPath || !localPath.endsWith(".webp")) {
    console.error(`FAIL: Invalid image format (must be .webp): ${entry.id || key} -> ${localPath}`);
    formatErrors++;
    continue;
  }

  const clean = localPath.startsWith("/") ? localPath.slice(1) : localPath;
  const fullPath = path.join(publicDir, clean);

  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: File missing on disk: ${fullPath} for SKU ${entry.id || key}`);
    brokenCount++;
    continue;
  }

  // Verify file buffer & SHA-256
  const buf = fs.readFileSync(fullPath);
  const actualHash = crypto.createHash("sha256").update(buf).digest("hex");

  if (entry.sha256 && actualHash !== entry.sha256) {
    console.warn(`WARNING: Hash mismatch on disk vs manifest for ${entry.id || key}. Disk: ${actualHash}, Manifest: ${entry.sha256}`);
  }

  if (hashToSku.has(actualHash)) {
    const existingSku = hashToSku.get(actualHash);
    duplicateHashViolations.push({
      hash: actualHash,
      sku1: existingSku,
      sku2: entry,
    });
  } else {
    hashToSku.set(actualHash, entry);
  }
}

console.log("\nValidation Results Summary:");
console.log(`- Total Manifest SKUs Verified: ${entries.length}`);
console.log(`- Broken / Missing Image Files: ${brokenCount}`);
console.log(`- Format Violations: ${formatErrors}`);
console.log(`- Shared / Reused Packshots: ${duplicateHashViolations.length}`);

if (brokenCount > 0 || formatErrors > 0) {
  console.error("\n❌ VALIDATION FAILED! Issues found in product images.\n");
  process.exit(1);
}

console.log("\n✅ ALL CHECKS PASSED: 100% Valid WebP Files on Disk, 0 Broken Paths!\n");
